import { IsEnum, IsString, IsUUID } from 'class-validator';
import { CloseStatus } from '../enum';

export class CloseTicketDto {
  @IsString()
  response: string;

  @IsUUID()
  ticketId: string;

  @IsEnum(CloseStatus)
  status: CloseStatus;

  @IsUUID()
  employeeId: string;
}
