import { IsUUID } from 'class-validator';

export class FindCasesDto {
  @IsUUID()
  userId: string;
}
