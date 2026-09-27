import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto, CreatePostDto } from './dto/post.dto';
import { EntityType, NotificationType, PostVisibility } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async createPost(userId: string, dto: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: {
        authorId: userId,
        content: dto.content,
        type: dto.type || 'TEXT',
        visibility: dto.visibility || PostVisibility.PUBLIC,
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

    return post;
  }

  async getPostById(postId: string, viewerId?: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, isDeleted: false },
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

  async addComment(userId: string, postId: string, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.isDeleted) throw new NotFoundException();

    const comment = await this.prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        content: dto.content,
        parentId: dto.parentId || null,
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
}
