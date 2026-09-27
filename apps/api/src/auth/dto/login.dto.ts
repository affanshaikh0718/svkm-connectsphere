import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Email or username is required' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  identifier: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
