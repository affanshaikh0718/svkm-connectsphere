import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationType, MessageStatus, MessageType } from '@prisma/client';

@Injectable()
export class MessagingService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateDirectConversation(userA: string, userB: string) {
    if (userA === userB) throw new ForbiddenException('Cannot message yourself');

    // Find if a direct conversation already exists between these two users
    const existing = await this.prisma.conversation.findFirst({
      where: {
        type: ConversationType.DIRECT,
        AND: [
          { members: { some: { userId: userA } } },
          { members: { some: { userId: userB } } },
        ],
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                profile: { select: { headline: true, profilePictureUrl: true } },
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (existing) return existing;

    // Create new direct conversation
    const newConv = await this.prisma.conversation.create({
      data: {
        type: ConversationType.DIRECT,
        members: {
          create: [{ userId: userA }, { userId: userB }],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                profile: { select: { headline: true, profilePictureUrl: true } },
              },
            },
          },
        },
      },
    });

    // Include an automated welcome/helper bot message for the new chat
    try {
      const welcomeMsg = await this.prisma.message.create({
        data: {
          conversationId: newConv.id,
          senderId: userA,
          type: MessageType.SYSTEM,
          content: '👋 Connected on SVKM ConnectSphere! Say hello or share your portfolio and projects to break the ice.',
        },
      });
      return {
        ...newConv,
        messages: [welcomeMsg],
      };
    } catch {
      return {
        ...newConv,
        messages: [],
      };
    }
  }

  async getMyConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                profile: { select: { headline: true, profilePictureUrl: true } },
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getConversationMessages(conversationId: string, userId: string) {
    const isMember = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (!isMember) {
      const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
      if (!conv) {
        throw new NotFoundException('Conversation not found');
      }
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    // Mark as read
    await this.prisma.conversationMember.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastReadAt: new Date() },
    });

    return this.prisma.message.findMany({
      where: { conversationId, isDeleted: false },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: { select: { profilePictureUrl: true, headline: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
  }

  async sendMessage(conversationId: string, senderId: string, content: string, type: MessageType = MessageType.TEXT) {
    if (!content || !content.trim()) {
      throw new BadRequestException('Message content cannot be empty');
    }

    const isMember = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId, userId: senderId },
      },
    });

    if (!isMember) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: content.trim(),
        type,
        status: MessageStatus.SENT,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: { select: { profilePictureUrl: true, headline: true } },
          },
        },
      },
    });

    // Touch conversation updatedAt
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async markRead(conversationId: string, userId: string) {
    try {
      await this.prisma.conversationMember.update({
        where: { conversationId_userId: { conversationId, userId } },
        data: { lastReadAt: new Date() },
      });
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  async getUnreadCount(userId: string) {
    const memberships = await this.prisma.conversationMember.findMany({
      where: { userId },
      select: { conversationId: true, lastReadAt: true },
    });

    let unreadCount = 0;
    for (const m of memberships) {
      const count = await this.prisma.message.count({
        where: {
          conversationId: m.conversationId,
          senderId: { not: userId },
          createdAt: { gt: m.lastReadAt },
        },
      });
      if (count > 0) unreadCount++;
    }

    return { count: unreadCount };
  }
}
