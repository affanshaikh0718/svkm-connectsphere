import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { CompanySize } from '@prisma/client';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsEnum(CompanySize)
  @IsOptional()
  companySize?: CompanySize;

  @IsNumber()
  @IsOptional()
  foundedYear?: number;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  location?: string;
}

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsEnum(CompanySize)
  @IsOptional()
  companySize?: CompanySize;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  location?: string;
}
