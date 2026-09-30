import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { isSvkmEmail, getSvkmDomainError } from '../svkm-domains';

export class RegisterDto {
  @IsEmail({}, { message: 'Must be a valid email address' })
  @Validate(
    class {
      validate(email: string) {
        return isSvkmEmail(email);
      }
      defaultMessage() {
        return getSvkmDomainError();
      }
    }
  )
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain alphanumeric characters and underscores',
  })
  @Transform(({ value }) => value?.toLowerCase().trim())
  username: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100)
  password: string;

  @IsString()
  @IsOptional()
  institution?: string;

  @IsString()
  @IsOptional()
  roleType?: string;
}
