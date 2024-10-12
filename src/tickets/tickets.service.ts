import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient, TicketPriority, TicketStatus } from '@prisma/client';
import { CreateTicketDto, PaginationDto, UpdateTicketStatusDto } from './dto';

@Injectable()
export class TicketsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(TicketsService.name);

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connection ready');
  }

  // * Create tickets
  async create(createTicketDto: CreateTicketDto) {
    try {
      return await this.ticket.create({ data: createTicketDto });
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

      const totalPages = await this.ticket.count({
        where: {
          isAvailable: true,
          priority: priority ?? TicketPriority.HIGH,
          status: status ?? TicketStatus.PENDING,
        },
      });
      const lastPage = Math.ceil(totalPages / limit);

      // * Data based in conditions
      const data = await this.ticket.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          isAvailable: true,
          priority: priority ?? TicketPriority.MEDIUM,
          status: status ?? TicketStatus.PENDING,
        },
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
          priority: true,
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
}
