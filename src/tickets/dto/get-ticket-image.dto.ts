import { IsString } from 'class-validator';

export class GetTicketImageDto {
  @IsString()
  name: string;
}
