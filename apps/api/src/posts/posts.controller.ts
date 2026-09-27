import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CreateCommentDto, CreatePostDto } from './dto/post.dto';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
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
}
