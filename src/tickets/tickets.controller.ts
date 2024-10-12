import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, PaginationDto, UpdateTicketStatusDto } from './dto';

@Controller()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @MessagePattern('ticket.create')
  create(@Payload() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @MessagePattern('ticket.find-many')
  findMany(@Payload() paginationDto: PaginationDto) {
    return this.ticketsService.findAll(paginationDto);
  }

  @MessagePattern('ticket.find-one')
  findOne(@Payload('id', ParseUUIDPipe) ticketId: string) {
    return this.ticketsService.findById(ticketId);
  }

  @MessagePattern('ticket.update-status')
  updateStatus(@Payload() updateTicketStatustDto: UpdateTicketStatusDto) {
    return this.ticketsService.updateStatus(updateTicketStatustDto);
  }

  // TODO: Create assign ticket

  // TODO: Create find my tickets
}
