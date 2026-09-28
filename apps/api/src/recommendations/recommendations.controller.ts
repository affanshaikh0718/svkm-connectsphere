import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  GiveRecommendationDto,
  RequestRecommendationDto,
  RequestRevisionDto,
  RespondToRequestDto,
  ReviseRecommendationDto,
} from './dto/recommendation.dto';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  /**
   * Request a recommendation from a 1st-degree connection
   */
  @Post('request')
  async requestRecommendation(
    @CurrentUser('id') requesterId: string,
    @Body() dto: RequestRecommendationDto,
  ) {
    return this.recommendationsService.requestRecommendation(requesterId, dto);
  }

  /**
   * Directly write / give a recommendation to a 1st-degree connection
   */
  @Post('give')
  async giveRecommendation(
    @CurrentUser('id') senderId: string,
    @Body() dto: GiveRecommendationDto,
  ) {
    return this.recommendationsService.giveRecommendation(senderId, dto);
  }

  /**
   * Fulfill/respond to a recommendation request
   */
  @Put(':id/respond')
  async respondToRequest(
    @CurrentUser('id') senderId: string,
    @Param('id') id: string,
    @Body() dto: RespondToRequestDto,
  ) {
    return this.recommendationsService.respondToRequest(senderId, id, dto);
  }

  /**
   * Recipient accepts recommendation
   */
  @Put(':id/accept')
  async acceptRecommendation(
    @CurrentUser('id') recipientId: string,
    @Param('id') id: string,
  ) {
    return this.recommendationsService.acceptRecommendation(recipientId, id);
  }

  /**
   * Recipient dismisses / declines recommendation
   */
  @Put(':id/dismiss')
  async dismissRecommendation(
    @CurrentUser('id') recipientId: string,
    @Param('id') id: string,
  ) {
    return this.recommendationsService.dismissRecommendation(recipientId, id);
  }

  /**
   * Recipient requests revisions with a feedback note
   */
  @Put(':id/request-revision')
  async requestRevision(
    @CurrentUser('id') recipientId: string,
    @Param('id') id: string,
    @Body() dto: RequestRevisionDto,
  ) {
    return this.recommendationsService.requestRevision(recipientId, id, dto);
  }

  /**
   * Sender revises recommendation content
   */
  @Put(':id/revise')
  async reviseRecommendation(
    @CurrentUser('id') senderId: string,
    @Param('id') id: string,
    @Body() dto: ReviseRecommendationDto,
  ) {
    return this.recommendationsService.reviseRecommendation(senderId, id, dto);
  }

  /**
   * Recipient toggles hide/unhide on accepted recommendation
   */
  @Put(':id/toggle-hide')
  async toggleHideRecommendation(
    @CurrentUser('id') recipientId: string,
    @Param('id') id: string,
  ) {
    return this.recommendationsService.toggleHideRecommendation(recipientId, id);
  }

  /**
   * Delete recommendation or request
   */
  @Delete(':id')
  async deleteRecommendation(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.recommendationsService.deleteRecommendation(userId, id);
  }

  /**
   * Get user recommendations inbox (incoming requests, pending approvals, revisions)
   */
  @Get('inbox')
  async getInbox(@CurrentUser('id') userId: string) {
    return this.recommendationsService.getInbox(userId);
  }

  /**
   * Get public or owner view of recommendations for a profile
   */
  @Get('user/:userId')
  async getUserRecommendations(
    @Param('userId') targetUserId: string,
    @CurrentUser('id') viewerId?: string,
  ) {
    return this.recommendationsService.getUserRecommendations(targetUserId, viewerId);
  }
}
