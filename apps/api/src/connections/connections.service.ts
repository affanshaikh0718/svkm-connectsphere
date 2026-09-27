import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConnectionStatus, FollowTargetType, NotificationType, EntityType } from '@prisma/client';

@Injectable()
export class ConnectionsService {
  constructor(private prisma: PrismaService) {}

  async sendRequest(requesterId: string, addresseeId: string, message?: string) {
    if (requesterId === addresseeId) {
      throw new BadRequestException('You cannot send a connection request to yourself');
    }

    // Check if either user is blocked
    const block = await this.prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: requesterId, blockedId: addresseeId },
          { blockerId: addresseeId, blockedId: requesterId },
        ],
      },
    });

    if (block) {
      throw new ForbiddenException('Unable to connect with this user');
    }

    // Check existing relationship
    const existing = await this.prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId },
        ],
      },
    });

    if (existing) {
      if (existing.status === ConnectionStatus.ACCEPTED) {
        throw new ConflictException('You are already connected with this user');
      }
      if (existing.status === ConnectionStatus.PENDING) {
        throw new ConflictException('A connection request is already pending between you');
      }
    }

    const connection = await this.prisma.connection.create({
      data: {
        requesterId,
        addresseeId,
        status: ConnectionStatus.PENDING,
        message,
      },
    });

    // Notify addressee
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
      select: { firstName: true, lastName: true },
    });

    await this.prisma.notification.create({
      data: {
        recipientId: addresseeId,
        actorId: requesterId,
        type: NotificationType.CONNECTION_REQUEST,
        entityType: EntityType.CONNECTION,
        entityId: connection.id,
        message: `${requester?.firstName} ${requester?.lastName} sent you a connection request`,
      },
    });

    return connection;
  }

  async acceptRequest(userId: string, connectionId: string) {
    const conn = await this.prisma.connection.findUnique({ where: { id: connectionId } });
    if (!conn) throw new NotFoundException('Connection request not found');

    if (conn.addresseeId !== userId) {
      throw new ForbiddenException('Only the recipient can accept this connection request');
    }

    const updated = await this.prisma.connection.update({
      where: { id: connectionId },
      data: { status: ConnectionStatus.ACCEPTED },
    });

    // Notify requester
    const acceptor = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });

    await this.prisma.notification.create({
      data: {
        recipientId: conn.requesterId,
        actorId: userId,
        type: NotificationType.CONNECTION_ACCEPTED,
        entityType: EntityType.CONNECTION,
        entityId: conn.id,
        message: `${acceptor?.firstName} ${acceptor?.lastName} accepted your connection request`,
      },
    });

    return updated;
  }

  async rejectRequest(userId: string, connectionId: string) {
    const conn = await this.prisma.connection.findUnique({ where: { id: connectionId } });
    if (!conn) throw new NotFoundException('Connection request not found');

    if (conn.addresseeId !== userId) {
      throw new ForbiddenException('Only the recipient can reject this request');
    }

    return this.prisma.connection.update({
      where: { id: connectionId },
      data: { status: ConnectionStatus.REJECTED },
    });
  }

  async removeConnection(userId: string, targetUserId: string) {
    const conn = await this.prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId: targetUserId, status: ConnectionStatus.ACCEPTED },
          { requesterId: targetUserId, addresseeId: userId, status: ConnectionStatus.ACCEPTED },
        ],
      },
    });

    if (!conn) throw new NotFoundException('Active connection not found');

    await this.prisma.connection.delete({ where: { id: conn.id } });
    return { message: 'Connection removed successfully' };
  }

  async getMyConnections(userId: string) {
    const connections = await this.prisma.connection.findMany({
      where: {
        OR: [
          { requesterId: userId, status: ConnectionStatus.ACCEPTED },
          { addresseeId: userId, status: ConnectionStatus.ACCEPTED },
        ],
      },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: { select: { headline: true, profilePictureUrl: true } },
          },
        },
        addressee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: { select: { headline: true, profilePictureUrl: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return connections.map((c) => {
      const isRequester = c.requesterId === userId;
      return {
        connectionId: c.id,
        connectedSince: c.updatedAt,
        user: isRequester ? c.addressee : c.requester,
      };
    });
  }

  async getPendingRequests(userId: string) {
    const received = await this.prisma.connection.findMany({
      where: {
        addresseeId: userId,
        status: ConnectionStatus.PENDING,
      },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: { select: { headline: true, profilePictureUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const sent = await this.prisma.connection.findMany({
      where: {
        requesterId: userId,
        status: ConnectionStatus.PENDING,
      },
      include: {
        addressee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: { select: { headline: true, profilePictureUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { received, sent };
  }

  async getSuggestions(userId: string) {
    // Return active users who aren't the current user and aren't already connected
    const existing = await this.prisma.connection.findMany({
      where: {
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      select: { requesterId: true, addresseeId: true },
    });

    const excludedIds = new Set<string>([userId]);
    existing.forEach((c) => {
      excludedIds.add(c.requesterId);
      excludedIds.add(c.addresseeId);
    });

    return this.prisma.user.findMany({
      where: {
        id: { notIn: Array.from(excludedIds) },
        status: 'ACTIVE',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        profile: {
          select: {
            headline: true,
            profilePictureUrl: true,
            location: true,
          },
        },
      },
      take: 12,
    });
  }

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) throw new BadRequestException('Cannot follow yourself');

    return this.prisma.follow.upsert({
      where: {
        followerId_followingId_followingType: {
          followerId,
          followingId,
          followingType: FollowTargetType.USER,
        },
      },
      update: {},
      create: {
        followerId,
        followingId,
        followingType: FollowTargetType.USER,
      },
    });
  }

  async unfollowUser(followerId: string, followingId: string) {
    await this.prisma.follow.deleteMany({
      where: {
        followerId,
        followingId,
        followingType: FollowTargetType.USER,
      },
    });
    return { message: 'Unfollowed successfully' };
  }
}
