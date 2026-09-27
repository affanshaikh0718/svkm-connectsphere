import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('conversations')
export class MessagingController {
  constructor(private messagingService: MessagingService) {}

  @Get()
  async getMyConversations(@CurrentUser('id') userId: string) {
    return this.messagingService.getMyConversations(userId);
  }

  @Post('direct/:recipientId')
  async getOrCreateDirect(
    @CurrentUser('id') userId: string,
    @Param('recipientId') recipientId: string,
  ) {
    return this.messagingService.getOrCreateDirectConversation(userId, recipientId);
  }

  @Get(':id/messages')
  async getMessages(
    @CurrentUser('id') userId: string,
    @Param('id') conversationId: string,
  ) {
    return this.messagingService.getConversationMessages(conversationId, userId);
  }

  @Post(':id/messages')
  async sendMessage(
    @CurrentUser('id') userId: string,
    @Param('id') conversationId: string,
    @Body('content') content: string,
  ) {
    return this.messagingService.sendMessage(conversationId, userId, content);
  }
}
