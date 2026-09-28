import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessagingService } from './messaging.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagingGateway.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private messagingService: MessagingService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      client.data.userId = payload.sub;
      client.join(`user:${payload.sub}`);
      this.logger.log(`Client connected: ${client.id}, User: ${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:conversation')
  @SubscribeMessage('join_conversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: any,
  ) {
    const conversationId = typeof body === 'string' ? body : body?.conversationId;
    if (conversationId) {
      client.join(`conversation:${conversationId}`);
    }
    return { status: 'joined', conversationId };
  }

  @SubscribeMessage('leave:conversation')
  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: any,
  ) {
    const conversationId = typeof body === 'string' ? body : body?.conversationId;
    if (conversationId) {
      client.leave(`conversation:${conversationId}`);
    }
    return { status: 'left', conversationId };
  }

  @SubscribeMessage('message:send')
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string },
  ) {
    const senderId = client.data.userId;
    if (!senderId) return;

    const message = await this.messagingService.sendMessage(
      data.conversationId,
      senderId,
      data.content,
    );

    // Broadcast to everyone in the conversation room
    this.broadcastNewMessage(data.conversationId, message);
    return message;
  }

  @SubscribeMessage('typing:start')
  @SubscribeMessage('typing_start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: any,
  ) {
    const conversationId = typeof body === 'string' ? body : body?.conversationId;
    const userId = client.data.userId;
    if (conversationId && userId) {
      client.to(`conversation:${conversationId}`).emit('typing:indicator', {
        conversationId,
        userId,
        isTyping: true,
      });
      client.to(`conversation:${conversationId}`).emit('typing_start', {
        conversationId,
        userId,
      });
    }
  }

  @SubscribeMessage('typing:stop')
  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: any,
  ) {
    const conversationId = typeof body === 'string' ? body : body?.conversationId;
    const userId = client.data.userId;
    if (conversationId && userId) {
      client.to(`conversation:${conversationId}`).emit('typing:indicator', {
        conversationId,
        userId,
        isTyping: false,
      });
      client.to(`conversation:${conversationId}`).emit('typing_stop', {
        conversationId,
        userId,
      });
    }
  }

  broadcastNewMessage(conversationId: string, message: any) {
    if (this.server) {
      this.server.to(`conversation:${conversationId}`).emit('message:received', message);
      this.server.to(`conversation:${conversationId}`).emit('new_message', message);
    }
  }
}
