import { IsArray, IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { EmploymentType, LocationType } from '@prisma/client';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(220)
  headline?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  website?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  githubUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  twitterUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  linkedinUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  profilePictureUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  profilePictureKey?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  coverImageUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  coverImageKey?: string;

  @IsBoolean()
  @IsOptional()
  isOpenToWork?: boolean;

  @IsArray()
  @IsOptional()
  openToWorkTypes?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(50)
  statusBadge?: string;
}

export class ExperienceDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(LocationType)
  @IsOptional()
  locationType?: LocationType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  isCurrent?: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  skills?: string[];
}

export class EducationDto {
  @IsString()
  @IsNotEmpty()
  institution: string;

  @IsString()
  @IsOptional()
  degree?: string;

  @IsString()
  @IsOptional()
  fieldOfStudy?: string;

  @IsNotEmpty()
  startYear: number;

  @IsOptional()
  endYear?: number;

  @IsString()
  @IsOptional()
  grade?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
