import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateTicketDto } from './dto';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';

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

  findAll() {
    return `This action returns all tickets`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ticket`;
  }

  update(id: number, updateTicketDto: any) {
    return { updateTicketDto };
  }

  remove(id: number) {
    return `This action removes a #${id} ticket`;
  }
}
