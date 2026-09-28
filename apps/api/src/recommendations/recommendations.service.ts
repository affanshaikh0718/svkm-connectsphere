import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ConnectionStatus,
  ConversationType,
  EntityType,
  MessageType,
  NotificationType,
  RecommendationStatus,
} from '@prisma/client';
import {
  GiveRecommendationDto,
  RequestRecommendationDto,
  RequestRevisionDto,
  RespondToRequestDto,
  ReviseRecommendationDto,
} from './dto/recommendation.dto';

const USER_SELECT_FIELDS = {
  id: true,
  firstName: true,
  lastName: true,
  username: true,
  profile: {
    select: {
      headline: true,
      profilePictureUrl: true,
    },
  },
};

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Verify if two users are 1st-degree connections
   */
  async are1stDegreeConnected(userA: string, userB: string): Promise<boolean> {
    if (!userA || !userB || userA === userB) return false;
    const connection = await this.prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: userA, addresseeId: userB, status: ConnectionStatus.ACCEPTED },
          { requesterId: userB, addresseeId: userA, status: ConnectionStatus.ACCEPTED },
        ],
      },
    });
    return !!connection;
  }

  private async getUserFullName(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });
    return user ? `${user.firstName} ${user.lastName}` : 'Someone';
  }

  /**
   * Helper to append a direct message into an existing or new direct conversation
   */
  private async sendInboxNotificationMessage(
    senderId: string,
    recipientId: string,
    text: string,
  ) {
    try {
      let conversation = await this.prisma.conversation.findFirst({
        where: {
          type: ConversationType.DIRECT,
          AND: [
            { members: { some: { userId: senderId } } },
            { members: { some: { userId: recipientId } } },
          ],
        },
      });

      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            type: ConversationType.DIRECT,
            members: {
              create: [{ userId: senderId }, { userId: recipientId }],
            },
          },
        });
      }

      await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId,
          type: MessageType.SYSTEM,
          content: text,
        },
      });

      await this.prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });
    } catch (e) {
      // Non-blocking inbox message helper
    }
  }

  /**
   * 1. Request a recommendation from a 1st-degree connection
   */
  async requestRecommendation(requesterId: string, dto: RequestRecommendationDto) {
    if (requesterId === dto.targetUserId) {
      throw new BadRequestException('You cannot request a recommendation from yourself.');
    }

    const isConnected = await this.are1stDegreeConnected(requesterId, dto.targetUserId);
    if (!isConnected) {
      throw new ForbiddenException(
        'You can only request recommendations from 1st-degree connections.',
      );
    }

    const existing = await this.prisma.recommendation.findUnique({
      where: {
        senderId_recipientId_positionTitle: {
          senderId: dto.targetUserId,
          recipientId: requesterId,
          positionTitle: dto.positionTitle.trim(),
        },
      },
    });

    let recommendation;
    if (existing) {
      if (existing.status === RecommendationStatus.DISMISSED) {
        recommendation = await this.prisma.recommendation.update({
          where: { id: existing.id },
          data: {
            relationship: dto.relationship,
            requestMessage: dto.requestMessage || null,
            positionId: dto.positionId || existing.positionId,
            status: RecommendationStatus.REQUESTED,
            content: null,
            revisionNote: null,
            isHidden: false,
          },
        });
      } else {
        throw new ConflictException(
          'A recommendation or pending request for this position already exists with this connection.',
        );
      }
    } else {
      recommendation = await this.prisma.recommendation.create({
        data: {
          requesterId,
          senderId: dto.targetUserId,
          recipientId: requesterId,
          positionTitle: dto.positionTitle.trim(),
          positionId: dto.positionId || null,
          relationship: dto.relationship,
          requestMessage: dto.requestMessage || null,
          status: RecommendationStatus.REQUESTED,
        },
      });
    }

    const requesterName = await this.getUserFullName(requesterId);

    // Trigger Notification
    await this.prisma.notification.create({
      data: {
        recipientId: dto.targetUserId,
        actorId: requesterId,
        type: NotificationType.RECOMMENDATION_REQUESTED,
        entityType: EntityType.RECOMMENDATION,
        entityId: recommendation.id,
        message: `${requesterName} requested a recommendation from you for "${dto.positionTitle.trim()}"`,
      },
    });

    // Trigger Inbox direct message
    const previewMsg = dto.requestMessage ? ` "${dto.requestMessage}"` : '';
    await this.sendInboxNotificationMessage(
      requesterId,
      dto.targetUserId,
      `📋 Recommendation Request: ${requesterName} requested a recommendation for "${dto.positionTitle.trim()}".${previewMsg}`,
    );

    return recommendation;
  }

  /**
   * 2. Give a recommendation directly to a 1st-degree connection
   */
  async giveRecommendation(senderId: string, dto: GiveRecommendationDto) {
    if (senderId === dto.recipientId) {
      throw new BadRequestException('You cannot write a recommendation for yourself.');
    }

    const isConnected = await this.are1stDegreeConnected(senderId, dto.recipientId);
    if (!isConnected) {
      throw new ForbiddenException(
        'You can only give recommendations to 1st-degree connections.',
      );
    }

    const existing = await this.prisma.recommendation.findUnique({
      where: {
        senderId_recipientId_positionTitle: {
          senderId,
          recipientId: dto.recipientId,
          positionTitle: dto.positionTitle.trim(),
        },
      },
    });

    let recommendation;
    if (existing) {
      if (
        existing.status === RecommendationStatus.REQUESTED ||
        existing.status === RecommendationStatus.DISMISSED
      ) {
        recommendation = await this.prisma.recommendation.update({
          where: { id: existing.id },
          data: {
            content: dto.content.trim(),
            relationship: dto.relationship,
            positionId: dto.positionId || existing.positionId,
            status: RecommendationStatus.PENDING_APPROVAL,
            revisionNote: null,
            isHidden: false,
          },
        });
      } else {
        throw new ConflictException(
          'A recommendation for this position already exists for this connection.',
        );
      }
    } else {
      recommendation = await this.prisma.recommendation.create({
        data: {
          senderId,
          recipientId: dto.recipientId,
          positionTitle: dto.positionTitle.trim(),
          positionId: dto.positionId || null,
          relationship: dto.relationship,
          content: dto.content.trim(),
          status: RecommendationStatus.PENDING_APPROVAL,
          isHidden: false,
        },
      });
    }

    const senderName = await this.getUserFullName(senderId);

    // Trigger Notification
    await this.prisma.notification.create({
      data: {
        recipientId: dto.recipientId,
        actorId: senderId,
        type: NotificationType.RECOMMENDATION_RECEIVED,
        entityType: EntityType.RECOMMENDATION,
        entityId: recommendation.id,
        message: `${senderName} wrote you a recommendation for "${dto.positionTitle.trim()}". Please review and approve it.`,
      },
    });

    // Trigger Inbox direct message
    const snippet =
      dto.content.length > 80 ? `${dto.content.substring(0, 80)}...` : dto.content;
    await this.sendInboxNotificationMessage(
      senderId,
      dto.recipientId,
      `⭐ Recommendation Received: ${senderName} submitted a recommendation for "${dto.positionTitle.trim()}": "${snippet}". Review and accept it on your profile.`,
    );

    return recommendation;
  }

  /**
   * 3. Sender responds to a recommendation request
   */
  async respondToRequest(
    senderId: string,
    recommendationId: string,
    dto: RespondToRequestDto,
  ) {
    const recommendation = await this.prisma.recommendation.findUnique({
      where: { id: recommendationId },
    });

    if (!recommendation) {
      throw new NotFoundException('Recommendation request not found.');
    }

    if (recommendation.senderId !== senderId) {
      throw new ForbiddenException(
        'You are not authorized to respond to this recommendation request.',
      );
    }

    if (
      recommendation.status !== RecommendationStatus.REQUESTED &&
      recommendation.status !== RecommendationStatus.REVISION_REQUESTED
    ) {
      throw new BadRequestException(
        'This recommendation cannot be submitted in its current state.',
      );
    }

    const updated = await this.prisma.recommendation.update({
      where: { id: recommendationId },
      data: {
        content: dto.content.trim(),
        relationship: dto.relationship || recommendation.relationship,
        status: RecommendationStatus.PENDING_APPROVAL,
        revisionNote: null,
      },
      include: {
        sender: { select: USER_SELECT_FIELDS },
        recipient: { select: USER_SELECT_FIELDS },
      },
    });

    const senderName = await this.getUserFullName(senderId);

    // Trigger Notification
    await this.prisma.notification.create({
      data: {
        recipientId: updated.recipientId,
        actorId: senderId,
        type: NotificationType.RECOMMENDATION_RECEIVED,
        entityType: EntityType.RECOMMENDATION,
        entityId: updated.id,
        message: `${senderName} submitted your requested recommendation for "${updated.positionTitle}".`,
      },
    });

    // Trigger Inbox direct message
    await this.sendInboxNotificationMessage(
      senderId,
      updated.recipientId,
      `⭐ Recommendation Submitted: ${senderName} fulfilled your recommendation request for "${updated.positionTitle}". Please review and add it to your profile.`,
    );

    return updated;
  }

  /**
   * 4. Recipient accepts the recommendation
   */
  async acceptRecommendation(recipientId: string, recommendationId: string) {
    const recommendation = await this.prisma.recommendation.findUnique({
      where: { id: recommendationId },
    });

    if (!recommendation) {
      throw new NotFoundException('Recommendation not found.');
    }

    if (recommendation.recipientId !== recipientId) {
      throw new ForbiddenException('Only the recipient can accept this recommendation.');
    }

    const updated = await this.prisma.recommendation.update({
      where: { id: recommendationId },
      data: {
        status: RecommendationStatus.ACCEPTED,
        isHidden: false,
      },
      include: {
        sender: { select: USER_SELECT_FIELDS },
        recipient: { select: USER_SELECT_FIELDS },
      },
    });

    const recipientName = await this.getUserFullName(recipientId);

    // Trigger Notification
    await this.prisma.notification.create({
      data: {
        recipientId: updated.senderId,
        actorId: recipientId,
        type: NotificationType.RECOMMENDATION_ACCEPTED,
        entityType: EntityType.RECOMMENDATION,
        entityId: updated.id,
        message: `${recipientName} accepted your recommendation for "${updated.positionTitle}"! It is now visible on their profile.`,
      },
    });

    // Trigger Inbox direct message
    await this.sendInboxNotificationMessage(
      recipientId,
      updated.senderId,
      `🎉 Recommendation Accepted: ${recipientName} approved your recommendation for "${updated.positionTitle}" and added it to their profile. Thank you!`,
    );

    return updated;
  }

  /**
   * 5. Recipient dismisses / declines the recommendation
   */
  async dismissRecommendation(recipientId: string, recommendationId: string) {
    const recommendation = await this.prisma.recommendation.findUnique({
      where: { id: recommendationId },
    });

    if (!recommendation) {
      throw new NotFoundException('Recommendation not found.');
    }

    if (recommendation.recipientId !== recipientId) {
      throw new ForbiddenException('Only the recipient can dismiss this recommendation.');
    }

    const updated = await this.prisma.recommendation.update({
      where: { id: recommendationId },
      data: {
        status: RecommendationStatus.DISMISSED,
      },
    });

    return updated;
  }

  /**
   * 6. Recipient requests revision with a feedback note
   */
  async requestRevision(
    recipientId: string,
    recommendationId: string,
    dto: RequestRevisionDto,
  ) {
    const recommendation = await this.prisma.recommendation.findUnique({
      where: { id: recommendationId },
    });

    if (!recommendation) {
      throw new NotFoundException('Recommendation not found.');
    }

    if (recommendation.recipientId !== recipientId) {
      throw new ForbiddenException('Only the recipient can request revisions.');
    }

    const updated = await this.prisma.recommendation.update({
      where: { id: recommendationId },
      data: {
        status: RecommendationStatus.REVISION_REQUESTED,
        revisionNote: dto.revisionNote.trim(),
      },
      include: {
        sender: { select: USER_SELECT_FIELDS },
        recipient: { select: USER_SELECT_FIELDS },
      },
    });

    const recipientName = await this.getUserFullName(recipientId);

    // Trigger Notification
    await this.prisma.notification.create({
      data: {
        recipientId: updated.senderId,
        actorId: recipientId,
        type: NotificationType.RECOMMENDATION_REVISION,
        entityType: EntityType.RECOMMENDATION,
        entityId: updated.id,
        message: `${recipientName} requested a revision on your recommendation: "${dto.revisionNote.trim()}"`,
      },
    });

    // Trigger Inbox direct message
    await this.sendInboxNotificationMessage(
      recipientId,
      updated.senderId,
      `✏️ Revision Requested: ${recipientName} requested changes on your recommendation for "${updated.positionTitle}": "${dto.revisionNote.trim()}". You can update it anytime.`,
    );

    return updated;
  }

  /**
   * 7. Sender revises content
   */
  async reviseRecommendation(
    senderId: string,
    recommendationId: string,
    dto: ReviseRecommendationDto,
  ) {
    const recommendation = await this.prisma.recommendation.findUnique({
      where: { id: recommendationId },
    });

    if (!recommendation) {
      throw new NotFoundException('Recommendation not found.');
    }

    if (recommendation.senderId !== senderId) {
      throw new ForbiddenException('Only the sender can revise this recommendation.');
    }

    const updated = await this.prisma.recommendation.update({
      where: { id: recommendationId },
      data: {
        content: dto.content.trim(),
        status: RecommendationStatus.PENDING_APPROVAL,
        revisionNote: null,
      },
      include: {
        sender: { select: USER_SELECT_FIELDS },
        recipient: { select: USER_SELECT_FIELDS },
      },
    });

    const senderName = await this.getUserFullName(senderId);

    // Trigger Notification
    await this.prisma.notification.create({
      data: {
        recipientId: updated.recipientId,
        actorId: senderId,
        type: NotificationType.RECOMMENDATION_RECEIVED,
        entityType: EntityType.RECOMMENDATION,
        entityId: updated.id,
        message: `${senderName} revised their recommendation for "${updated.positionTitle}". Please review and approve it.`,
      },
    });

    // Trigger Inbox direct message
    await this.sendInboxNotificationMessage(
      senderId,
      updated.recipientId,
      `📝 Recommendation Revised: ${senderName} updated their recommendation for "${updated.positionTitle}". Please check and approve it on your profile.`,
    );

    return updated;
  }

  /**
   * 8. Recipient toggles Hide/Unhide for an accepted recommendation
   */
  async toggleHideRecommendation(recipientId: string, recommendationId: string) {
    const recommendation = await this.prisma.recommendation.findUnique({
      where: { id: recommendationId },
    });

    if (!recommendation) {
      throw new NotFoundException('Recommendation not found.');
    }

    if (recommendation.recipientId !== recipientId) {
      throw new ForbiddenException(
        'Only the recipient can toggle visibility on their profile.',
      );
    }

    return this.prisma.recommendation.update({
      where: { id: recommendationId },
      data: {
        isHidden: !recommendation.isHidden,
      },
      include: {
        sender: { select: USER_SELECT_FIELDS },
        recipient: { select: USER_SELECT_FIELDS },
      },
    });
  }

  /**
   * 9. Delete recommendation (Sender or Recipient or Requester)
   */
  async deleteRecommendation(userId: string, recommendationId: string) {
    const recommendation = await this.prisma.recommendation.findUnique({
      where: { id: recommendationId },
    });

    if (!recommendation) {
      throw new NotFoundException('Recommendation not found.');
    }

    if (
      recommendation.senderId !== userId &&
      recommendation.recipientId !== userId &&
      recommendation.requesterId !== userId
    ) {
      throw new ForbiddenException(
        'You are not authorized to delete this recommendation.',
      );
    }

    await this.prisma.recommendation.delete({
      where: { id: recommendationId },
    });

    return { success: true, id: recommendationId };
  }

  /**
   * 10. Query recommendations for a user profile
   */
  async getUserRecommendations(targetUserId: string, viewerId?: string) {
    const isOwner = viewerId === targetUserId;
    const isConnected = viewerId
      ? await this.are1stDegreeConnected(viewerId, targetUserId)
      : false;

    // Fetch received recommendations
    const received = await this.prisma.recommendation.findMany({
      where: {
        recipientId: targetUserId,
        status: RecommendationStatus.ACCEPTED,
        ...(isOwner ? {} : { isHidden: false }),
      },
      include: {
        sender: { select: USER_SELECT_FIELDS },
        recipient: { select: USER_SELECT_FIELDS },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch given recommendations
    const given = await this.prisma.recommendation.findMany({
      where: {
        senderId: targetUserId,
        status: RecommendationStatus.ACCEPTED,
      },
      include: {
        sender: { select: USER_SELECT_FIELDS },
        recipient: { select: USER_SELECT_FIELDS },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If profile owner, also load pending review queue
    let pendingApprovals: any[] = [];
    let pendingRequests: any[] = [];
    if (isOwner) {
      pendingApprovals = await this.prisma.recommendation.findMany({
        where: {
          recipientId: targetUserId,
          status: {
            in: [
              RecommendationStatus.PENDING_APPROVAL,
              RecommendationStatus.REVISION_REQUESTED,
            ],
          },
        },
        include: {
          sender: { select: USER_SELECT_FIELDS },
          recipient: { select: USER_SELECT_FIELDS },
        },
        orderBy: { updatedAt: 'desc' },
      });

      pendingRequests = await this.prisma.recommendation.findMany({
        where: {
          senderId: targetUserId,
          status: RecommendationStatus.REQUESTED,
        },
        include: {
          requester: { select: USER_SELECT_FIELDS },
          recipient: { select: USER_SELECT_FIELDS },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Fetch target user's experiences for position pickers
    const targetExperiences = await this.prisma.experience.findMany({
      where: { userId: targetUserId },
      orderBy: { startDate: 'desc' },
      select: {
        id: true,
        position: true,
        companyName: true,
        isCurrent: true,
      },
    });

    // Fetch viewer's experiences if viewer exists
    let viewerExperiences: any[] = [];
    if (viewerId && !isOwner) {
      viewerExperiences = await this.prisma.experience.findMany({
        where: { userId: viewerId },
        orderBy: { startDate: 'desc' },
        select: {
          id: true,
          position: true,
          companyName: true,
          isCurrent: true,
        },
      });
    }

    // Check if there is already a recommendation or request between viewer and target
    let existingBetweenViewerAndTarget: any = null;
    if (viewerId && !isOwner) {
      existingBetweenViewerAndTarget = await this.prisma.recommendation.findMany({
        where: {
          OR: [
            { senderId: viewerId, recipientId: targetUserId },
            { senderId: targetUserId, recipientId: viewerId },
          ],
        },
      });
    }

    return {
      received,
      given,
      pendingApprovals,
      pendingRequests,
      isOwner,
      isConnected,
      targetPositions: targetExperiences,
      viewerPositions: viewerExperiences,
      existingBetweenViewerAndTarget,
    };
  }

  /**
   * 11. Recommendations activity & inbox items for the current user
   */
  async getInbox(userId: string) {
    // Requests from connections asking me to write a recommendation for them
    const incomingRequests = await this.prisma.recommendation.findMany({
      where: {
        senderId: userId,
        status: RecommendationStatus.REQUESTED,
      },
      include: {
        requester: { select: USER_SELECT_FIELDS },
        recipient: { select: USER_SELECT_FIELDS },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Recommendations written for me that need my approval
    const pendingApprovals = await this.prisma.recommendation.findMany({
      where: {
        recipientId: userId,
        status: RecommendationStatus.PENDING_APPROVAL,
      },
      include: {
        sender: { select: USER_SELECT_FIELDS },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Recommendations I wrote where the recipient asked for revisions
    const revisionsRequested = await this.prisma.recommendation.findMany({
      where: {
        senderId: userId,
        status: RecommendationStatus.REVISION_REQUESTED,
      },
      include: {
        recipient: { select: USER_SELECT_FIELDS },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Requests I sent to others that they haven't fulfilled yet
    const sentRequests = await this.prisma.recommendation.findMany({
      where: {
        requesterId: userId,
        status: RecommendationStatus.REQUESTED,
      },
      include: {
        sender: { select: USER_SELECT_FIELDS },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      incomingRequests,
      pendingApprovals,
      revisionsRequested,
      sentRequests,
      totalActionable:
        incomingRequests.length + pendingApprovals.length + revisionsRequested.length,
    };
  }
}
