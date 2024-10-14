import { IsEmail, IsOptional, IsString } from 'class-validator';

export class TicketUserDto {
  @IsString()
  id: string;

  @IsString()
  username: string;

  @IsString()
  @IsOptional()
  apartment?: string;

  @IsEmail()
  email: string;
}
