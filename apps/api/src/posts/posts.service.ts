import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto, CreatePostDto, ReportPostDto, UpdatePostDto } from './dto/post.dto';
import { EntityType, NotificationType, PostVisibility, ReportCategory, UserRole } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async createPost(userId: string, dto: CreatePostDto) {
    const mediaCreate = dto.mediaUrls && dto.mediaUrls.length > 0
      ? {
          create: dto.mediaUrls.map((url, idx) => ({
            url,
            s3Key: `media-${Date.now()}-${idx}`,
            mimeType: url.endsWith('.mp4') || url.endsWith('.webm') ? 'video/mp4' : 'image/jpeg',
            size: 1024,
            order: idx,
          })),
        }
      : undefined;

    const postType = dto.type || (dto.mediaUrls && dto.mediaUrls.length > 0 ? 'IMAGE' : 'TEXT');

    const post = await this.prisma.post.create({
      data: {
        authorId: userId,
        content: dto.content,
        type: postType,
        visibility: dto.visibility || PostVisibility.PUBLIC,
        media: mediaCreate,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: { select: { headline: true, profilePictureUrl: true } },
          },
        },
        media: true,
      },
    });

    return post;
  }

  async getPostById(postId: string, viewerId?: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, isDeleted: false },
      include: {
        media: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: { select: { headline: true, profilePictureUrl: true } },
          },
        },
        comments: {
          where: { isDeleted: false, parentId: null },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                profile: { select: { headline: true, profilePictureUrl: true } },
              },
            },
            replies: {
              include: {
                author: {
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
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!post) throw new NotFoundException('Post not found');

    let isLiked = false;
    let isSaved = false;

    if (viewerId) {
      const like = await this.prisma.postLike.findUnique({
        where: { userId_postId: { userId: viewerId, postId } },
      });
      isLiked = !!like;

      const saved = await this.prisma.savedPost.findUnique({
        where: { userId_postId: { userId: viewerId, postId } },
      });
      isSaved = !!saved;
    }

    return {
      ...post,
      isLiked,
      isSaved,
    };
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException();

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.post.update({
      where: { id: postId },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return { message: 'Post deleted successfully' };
  }

  async updatePost(postId: string, userId: string, dto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.isDeleted) throw new NotFoundException('Post not found');

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: {
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(dto.visibility !== undefined ? { visibility: dto.visibility } : {}),
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: { select: { headline: true, profilePictureUrl: true } },
          },
        },
        media: true,
      },
    });

    return updated;
  }

  async reportPost(userId: string, postId: string, dto: ReportPostDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.isDeleted) throw new NotFoundException('Post not found');

    let category: ReportCategory = ReportCategory.OTHER;
    const reasonUpper = (dto.reason || '').toUpperCase();
    if (reasonUpper.includes('SPAM')) category = ReportCategory.SPAM;
    else if (reasonUpper.includes('HARASS')) category = ReportCategory.HARASSMENT;
    else if (reasonUpper.includes('FAKE')) category = ReportCategory.FAKE_ACCOUNT;
    else if (reasonUpper.includes('COPYRIGHT')) category = ReportCategory.COPYRIGHT;
    else if (reasonUpper.includes('INAPPROPRIATE')) category = ReportCategory.INAPPROPRIATE;
    else if (reasonUpper.includes('SCAM')) category = ReportCategory.SCAM;

    await this.prisma.report.create({
      data: {
        reporterId: userId,
        targetType: EntityType.POST,
        targetId: postId,
        category,
        description: dto.reason,
      },
    });

    return { message: 'Report submitted successfully' };
  }

  async likePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.isDeleted) throw new NotFoundException();

    const existingLike = await this.prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existingLike) {
      // Unlike
      await this.prisma.postLike.delete({ where: { userId_postId: { userId, postId } } });
      await this.prisma.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      });
      return { isLiked: false };
    }

    // Like
    await this.prisma.postLike.create({
      data: { userId, postId },
    });
    await this.prisma.post.update({
      where: { id: postId },
      data: { likeCount: { increment: 1 } },
    });

    // Notify author if liker is not author
    if (post.authorId !== userId) {
      const liker = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true },
      });

      await this.prisma.notification.create({
        data: {
          recipientId: post.authorId,
          actorId: userId,
          type: NotificationType.POST_LIKED,
          entityType: EntityType.POST,
          entityId: postId,
          message: `${liker?.firstName} ${liker?.lastName} liked your post`,
        },
      });
    }

    return { isLiked: true };
  }

  async getComments(postId: string, cursor?: string, limit = 50, currentUserId?: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.isDeleted) throw new NotFoundException('Post not found');

    const comments = await this.prisma.comment.findMany({
      where: {
        postId,
        isDeleted: false,
      },
      include: {
        author: {
          select: {
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
          },
        },
        likes: currentUserId
          ? { where: { userId: currentUserId }, select: { userId: true } }
          : false,
        _count: {
          select: { likes: true, replies: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit) || 50,
    });

    return comments.map((c: any) => ({
      ...c,
      isLiked: Array.isArray(c.likes) && c.likes.length > 0,
      likeCount: c.likeCount || c._count?.likes || 0,
      replyCount: c._count?.replies || 0,
    }));
  }

  async likeComment(userId: string, postId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.isDeleted) throw new NotFoundException('Comment not found');

    const existing = await this.prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });

    if (!existing) {
      await this.prisma.commentLike.create({
        data: { userId, commentId },
      });
      await this.prisma.comment.update({
        where: { id: commentId },
        data: { likeCount: { increment: 1 } },
      });
    }

    const updated = await this.prisma.comment.findUnique({ where: { id: commentId } });
    return { isLiked: true, likeCount: updated?.likeCount || 1 };
  }

  async unlikeComment(userId: string, postId: string, commentId: string) {
    const existing = await this.prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });

    if (existing) {
      await this.prisma.commentLike.delete({
        where: { userId_commentId: { userId, commentId } },
      });
      const current = await this.prisma.comment.findUnique({ where: { id: commentId } });
      if (current && current.likeCount > 0) {
        await this.prisma.comment.update({
          where: { id: commentId },
          data: { likeCount: { decrement: 1 } },
        });
      }
    }

    const updated = await this.prisma.comment.findUnique({ where: { id: commentId } });
    return { isLiked: false, likeCount: updated?.likeCount || 0 };
  }

  async toggleCommentLike(userId: string, postId: string, commentId: string) {
    const existing = await this.prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });
    if (existing) {
      return this.unlikeComment(userId, postId, commentId);
    }
    return this.likeComment(userId, postId, commentId);
  }

  async deleteComment(userId: string, postId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: { select: { authorId: true } } },
    });
    if (!comment || comment.isDeleted) throw new NotFoundException('Comment not found');

    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    const isAuthor = comment.authorId === userId;
    const isPostAuthor = comment.post?.authorId === userId;
    const isAdmin = user?.role === UserRole.ADMIN;

    if (!isAuthor && !isPostAuthor && !isAdmin) {
      throw new ForbiddenException('You do not have permission to delete this comment');
    }

    await this.prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted: true },
    });

    const targetPostId = postId || comment.postId;
    const post = await this.prisma.post.findUnique({ where: { id: targetPostId } });
    if (post && post.commentCount > 0) {
      await this.prisma.post.update({
        where: { id: targetPostId },
        data: { commentCount: { decrement: 1 } },
      });
    }

    return { success: true, message: 'Comment deleted successfully' };
  }

  async addComment(userId: string, postId: string, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.isDeleted) throw new NotFoundException('Post not found');

    const comment = await this.prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        content: dto.content,
        parentId: dto.parentId || dto.parentCommentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profile: { select: { headline: true, profilePictureUrl: true } },
          },
        },
      },
    });

    await this.prisma.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    });

    // Notify author
    if (post.authorId !== userId) {
      const commenter = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true },
      });

      await this.prisma.notification.create({
        data: {
          recipientId: post.authorId,
          actorId: userId,
          type: NotificationType.POST_COMMENTED,
          entityType: EntityType.POST,
          entityId: postId,
          message: `${commenter?.firstName} ${commenter?.lastName} commented on your post`,
        },
      });
    }

    return comment;
  }

  async toggleSavePost(userId: string, postId: string) {
    const existing = await this.prisma.savedPost.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await this.prisma.savedPost.delete({ where: { userId_postId: { userId, postId } } });
      return { isSaved: false, message: 'Post removed from saved items' };
    }

    await this.prisma.savedPost.create({
      data: { userId, postId },
    });
    return { isSaved: true, message: 'Post saved successfully' };
  }

  async getSavedPosts(userId: string) {
    const items = await this.prisma.savedPost.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: {
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
      orderBy: { savedAt: 'desc' },
    });

    return items.map((i) => i.post);
  }

  async getUserPosts(authorId: string, limit = 20) {
    return this.prisma.post.findMany({
      where: { authorId, isDeleted: false },
      include: {
        media: true,
        author: {
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
      take: limit,
    });
  }
}
