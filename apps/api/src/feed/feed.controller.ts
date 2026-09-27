import { Controller, Get, Query } from '@nestjs/common';
import { FeedService } from './feed.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('feed')
export class FeedController {
  constructor(private feedService: FeedService) {}

  @Get()
  async getFeed(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.feedService.getFeed(userId, limit ? Number(limit) : 20);
  }
}
