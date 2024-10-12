import { TicketStatus } from '@prisma/client';
import { IsEnum, IsUUID } from 'class-validator';

export class UpdateTicketStatusDto {
  @IsUUID()
  ticketId: string;

  @IsEnum(TicketStatus, {
    message: `Valid statuses are: PENDING | IN_PROGRESS | REJECTED | SOLVED`,
  })
  status: TicketStatus;
}
