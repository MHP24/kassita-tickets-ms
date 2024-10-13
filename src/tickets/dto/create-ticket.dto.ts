import { TicketPriority, TicketStatus } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { TicketImageDto } from './ticket-image.dto';
import { Type } from 'class-transformer';

export class CreateTicketDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketImageDto)
  images: TicketImageDto[];

  @IsEnum(TicketPriority, {
    message: `Valid priorities are: LOW | MEDIUM | HIGH`,
  })
  priority?: TicketPriority = TicketPriority.LOW;

  @IsEnum(TicketStatus, {
    message: `Valid statuses are: PENDING | IN_PROGRESS | REJECTED | SOLVED`,
  })
  status?: TicketStatus = TicketStatus.PENDING;

  @IsUUID()
  typeId: string;
}
