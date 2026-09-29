import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { PostType, PostVisibility } from '@prisma/client';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty({ message: 'Post content cannot be empty' })
  @MaxLength(3000, { message: 'Post content must be under 3000 characters' })
  content: string;

  @IsEnum(PostType)
  @IsOptional()
  type?: PostType;

  @IsEnum(PostVisibility)
  @IsOptional()
  visibility?: PostVisibility;

  @IsArray()
  @IsOptional()
  mediaUrls?: string[];
}

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty({ message: 'Comment content cannot be empty' })
  @MaxLength(1000)
  content: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsOptional()
  parentCommentId?: string;
}

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  @MaxLength(3000, { message: 'Post content must be under 3000 characters' })
  content?: string;

  @IsEnum(PostVisibility)
  @IsOptional()
  visibility?: PostVisibility;
}

export class ReportPostDto {
  @IsString()
  @IsNotEmpty({ message: 'Report reason is required' })
  reason: string;
}

