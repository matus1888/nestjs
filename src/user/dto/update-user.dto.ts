import { IsOptional, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;
  //TODO validate
  id: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthday?: string; // Date
  about?: string;
}
