import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RequestRecommendationDto {
  @IsString()
  @IsNotEmpty()
  targetUserId: string; // The connection requested to write the recommendation

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  positionTitle: string;

  @IsString()
  @IsOptional()
  positionId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  relationship: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  requestMessage?: string;
}

export class GiveRecommendationDto {
  @IsString()
  @IsNotEmpty()
  recipientId: string; // The connection receiving the recommendation

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  positionTitle: string;

  @IsString()
  @IsOptional()
  positionId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  relationship: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  content: string;
}

export class RespondToRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  content: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  relationship?: string;
}

export class RequestRevisionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(1000)
  revisionNote: string;
}

export class ReviseRecommendationDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  content: string;
}
