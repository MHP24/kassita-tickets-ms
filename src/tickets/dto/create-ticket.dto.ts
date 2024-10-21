import { TicketPriority, TicketStatus } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TicketImageDto } from './ticket-image.dto';
import { TicketUserDto } from './ticket-user.dto';

export class CreateTicketDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketImageDto)
  @IsOptional()
  images: TicketImageDto[] = [];

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

  @ValidateNested()
  @Type(() => TicketUserDto)
  user: TicketUserDto;
}
