import { Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketsService {
  create(createTicketDto: CreateTicketDto) {
    return { createTicketDto };
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
