import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { PostsService } from './posts.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CreateCommentDto, CreatePostDto } from './dto/post.dto';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post('media')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = join(process.cwd(), 'uploads', 'posts');
          if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname || '.jpg');
          cb(null, `media-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for video/photos
    }),
  )
  async uploadMedia(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const mediaUrl = `http://localhost:4000/uploads/posts/${file.filename}`;
    const isVideo = file.mimetype?.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.filename);
    return {
      url: mediaUrl,
      filename: file.filename,
      mimetype: file.mimetype,
      isVideo,
    };
  }

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async createPost(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePostDto,
  ) {
    return this.postsService.createPost(userId, dto);
  }

  @Public()
  @Get(':id')
  async getPostById(
    @Param('id') id: string,
    @CurrentUser('id') viewerId?: string,
  ) {
    return this.postsService.getPostById(id, viewerId);
  }

  @Delete(':id')
  async deletePost(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.postsService.deletePost(id, userId);
  }

  @Post(':id/like')
  async likePost(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.postsService.likePost(userId, id);
  }

  @Public()
  @Get(':id/comments')
  async getComments(
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    return this.postsService.getComments(id, cursor, limit);
  }

  @Post(':id/comments')
  async addComment(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.postsService.addComment(userId, id, dto);
  }

  @Post(':id/save')
  async toggleSavePost(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.postsService.toggleSavePost(userId, id);
  }

  @Get('user/saved')
  async getSavedPosts(@CurrentUser('id') userId: string) {
    return this.postsService.getSavedPosts(userId);
  }

  @Public()
  @Get('user/:userId')
  async getUserPosts(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.postsService.getUserPosts(userId, limit ? Number(limit) : 20);
  }
}
