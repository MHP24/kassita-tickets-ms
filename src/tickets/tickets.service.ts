import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient, TicketStatus } from '@prisma/client';
import {
  AssignTicketDto,
  CloseTicketDto,
  CreateTicketDto,
  FindEmployeeTicketsDto,
  GetTicketImageDto,
  PaginationDto,
  UpdateTicketPriorityDto,
  UpdateTicketStatusDto,
} from './dto';
import { FilesManager, IdGenerator } from '../common';
import { envs } from '../config';

@Injectable()
export class TicketsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(TicketsService.name);
  private readonly filesManager = new FilesManager();
  private readonly idGen = new IdGenerator();

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connection ready');
  }

  // * Create tickets
  async create(createTicketDto: CreateTicketDto) {
    try {
      // * Images formatting
      const images = createTicketDto.images.map(
        ({ originalname, ...rest }) => ({
          ...rest,
          originalname: `${this.idGen.generateId()}.${originalname
            .split('.')
            .at(-1)}`,
        }),
      );
      // * File upload to S3 Bucket
      images.forEach(
        async ({ base64, originalname, mimetype }) =>
          await this.filesManager.upload(
            `${envs.awsS3BaseFolder}/${originalname}`,
            mimetype,
            base64,
          ),
      );
      // * Database order creation
      const { user, ...rest } = createTicketDto;
      return await this.ticket.create({
        data: {
          ...rest,
          userId: user.id,
          images: images.map(({ originalname }) => originalname),
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'An error ocurrred trying to create your ticket. Try again',
      });
    }
  }

  // * Find many tickets
  async findAll(paginationDto: PaginationDto) {
    try {
      // * Pagination calc
      const { limit = 10, page = 1, priority, status } = paginationDto;
      const where = {
        isAvailable: true,
      };

      // * Filters from query params
      if (priority) {
        where['priority'] = priority;
      }

      if (status) {
        where['status'] = status;
      }

      const totalPages = await this.ticket.count({
        where,
      });
      const lastPage = Math.ceil(totalPages / limit);

      // * Data based in conditions
      const data = await this.ticket.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where,
      });

      return {
        data,
        metadata: {
          page,
          total: totalPages,
          lastPage,
        },
      };
    } catch (error) {
      this.logger.error(error);
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred getting tickets, try again',
      });
    }
  }

  // * Get a specific ticket by id
  async findById(ticketId: string) {
    const ticket = await this.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Ticket with id: ${ticketId} not found`,
      });
    }

    return ticket;
  }

  // * Obtain all categories/types for specific tickets use cases
  findTicketTypes() {
    try {
      return this.ticketType.findMany();
    } catch (error) {
      this.logger.error(error);
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Unexpected error getting ticket types',
      });
    }
  }

  // * Change only the status
  async updateStatus(updateTicketStatusDto: UpdateTicketStatusDto) {
    const { ticketId, status } = updateTicketStatusDto;
    await this.findById(ticketId);

    try {
      return this.ticket.update({
        where: {
          id: ticketId,
        },
        data: {
          status,
        },
        select: {
          id: true,
          status: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Failed updating status for ticket: ${ticketId}`,
      });
    }
  }

  // * Change only the priority
  async updatePriority(updateTicketPriorityDto: UpdateTicketPriorityDto) {
    const { ticketId, priority } = updateTicketPriorityDto;
    await this.findById(ticketId);

    try {
      return this.ticket.update({
        where: {
          id: ticketId,
        },
        data: {
          priority,
        },
        select: {
          id: true,
          priority: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Failed updating priority for ticket: ${ticketId}`,
      });
    }
  }

  // * Assign ticket to specific user
  async assignTicket({ ticketId, userId }: AssignTicketDto) {
    const ticket = await this.ticket.findUnique({ where: { id: ticketId } });
    // * Ticket validation
    if (!ticket || ticket?.employeeId) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Bad Request',
      });
    }

    return this.ticket.update({
      where: {
        id: ticketId,
      },
      data: {
        employeeId: userId,
        status: TicketStatus.IN_PROGRESS,
      },
      select: {
        id: true,
        status: true,
        employeeId: true,
      },
    });
  }

  // * Find tickets as employee
  findEmployeeTickets({ userId }: FindEmployeeTicketsDto) {
    return this.ticket.findMany({
      where: {
        employeeId: userId,
        status: {
          notIn: [TicketStatus.SOLVED, TicketStatus.REJECTED],
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        priority: true,
      },
    });
  }

  // * Find tickets (cases) as user
  findUserCases(userId: string) {
    return this.ticket.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        priority: true,
      },
    });
  }

  // * Close ticket could be REJECTED | SOLVED
  async closeTicket(closeTicketDto: CloseTicketDto) {
    const { ticketId, employeeId, response, status } = closeTicketDto;

    // * Validation in case ticket already closed
    const ticket = await this.ticket.findUnique({
      where: {
        id: ticketId,
        employeeId,
        resolvedAt: null,
      },
    });

    if (!ticket) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Ticket with id: ${ticketId} already closed or does not exist`,
      });
    }

    // * Update to close ticket
    return this.ticket.update({
      where: {
        id: ticketId,
      },
      data: {
        response,
        status,
        resolvedAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        resolvedAt: true,
      },
    });
  }

  downloadImage({ name }: GetTicketImageDto) {
    try {
      return this.filesManager.download(`${envs.awsS3BaseFolder}/${name}`);
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Image: ${name} not found`,
      });
    }
  }
}
