import { IsBase64, IsString } from 'class-validator';

export class TicketImageDto {
  @IsString()
  originalname: string;

  @IsString()
  mimetype: string;

  @IsBase64()
  base64: string;
}
