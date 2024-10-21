import { IsUUID } from 'class-validator';

export class FindEmployeeTicketsDto {
  @IsUUID()
  userId: string;
}
