import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { MessagingGateway } from './messaging.gateway';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class CreateConversationDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  recipientId?: string;
}

@Controller(['conversations', 'messages/conversations'])
export class MessagingController {
  constructor(
    private messagingService: MessagingService,
    private messagingGateway: MessagingGateway,
  ) {}

  @Get()
  async getMyConversations(@CurrentUser('id') userId: string) {
    return this.messagingService.getMyConversations(userId);
  }

  @Post()
  async getOrCreateConversation(
    @CurrentUser('id') currentUserId: string,
    @Body() dto: CreateConversationDto,
  ) {
    const targetUserId = dto.userId || dto.recipientId;
    if (!targetUserId) {
      throw new BadRequestException('Target user ID (userId or recipientId) is required');
    }
    return this.messagingService.getOrCreateDirectConversation(currentUserId, targetUserId);
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
    @Body() dto: SendMessageDto,
  ) {
    const message = await this.messagingService.sendMessage(conversationId, userId, dto.content);
    this.messagingGateway.broadcastNewMessage(conversationId, message);
    return message;
  }

  @Post(':id/read')
  async markRead(
    @CurrentUser('id') userId: string,
    @Param('id') conversationId: string,
  ) {
    return this.messagingService.markRead(conversationId, userId);
  }
}

@Controller('messages')
export class MessagesAuxController {
  constructor(private messagingService: MessagingService) {}

  @Get('unread-count')
  async getUnreadCount(@CurrentUser('id') userId: string) {
    return this.messagingService.getUnreadCount(userId);
  }
}
