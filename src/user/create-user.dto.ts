import { IsEmail, IsNotEmpty } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDTO {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  teamId: string;
  role?: Role;
}
