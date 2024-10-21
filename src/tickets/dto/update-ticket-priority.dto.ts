import { TicketPriority } from '@prisma/client';
import { IsUUID, IsEnum } from 'class-validator';

export class UpdateTicketPriorityDto {
  @IsUUID()
  ticketId: string;

  @IsEnum(TicketPriority, {
    message: `Valid priorities are: LOW | MEDIUM | HIGH`,
  })
  priority: TicketPriority;
}
