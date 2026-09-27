import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('connections')
export class ConnectionsController {
  constructor(private connectionsService: ConnectionsService) {}

  @Get()
  async getMyConnections(@CurrentUser('id') userId: string) {
    return this.connectionsService.getMyConnections(userId);
  }

  @Get('pending')
  async getPendingRequests(@CurrentUser('id') userId: string) {
    return this.connectionsService.getPendingRequests(userId);
  }

  @Get('suggestions')
  async getSuggestions(@CurrentUser('id') userId: string) {
    return this.connectionsService.getSuggestions(userId);
  }

  @Post('request/:userId')
  async sendRequest(
    @CurrentUser('id') requesterId: string,
    @Param('userId') addresseeId: string,
    @Body('message') message?: string,
  ) {
    return this.connectionsService.sendRequest(requesterId, addresseeId, message);
  }

  @Put(':id/accept')
  async acceptRequest(
    @CurrentUser('id') userId: string,
    @Param('id') connectionId: string,
  ) {
    return this.connectionsService.acceptRequest(userId, connectionId);
  }

  @Put(':id/reject')
  async rejectRequest(
    @CurrentUser('id') userId: string,
    @Param('id') connectionId: string,
  ) {
    return this.connectionsService.rejectRequest(userId, connectionId);
  }

  @Delete(':userId')
  async removeConnection(
    @CurrentUser('id') userId: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.connectionsService.removeConnection(userId, targetUserId);
  }

  @Post('follow/:userId')
  async follow(
    @CurrentUser('id') followerId: string,
    @Param('userId') followingId: string,
  ) {
    return this.connectionsService.followUser(followerId, followingId);
  }

  @Delete('follow/:userId')
  async unfollow(
    @CurrentUser('id') followerId: string,
    @Param('userId') followingId: string,
  ) {
    return this.connectionsService.unfollowUser(followerId, followingId);
  }
}
