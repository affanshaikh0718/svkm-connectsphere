import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import axios from 'axios';
import { ConnectionStatus, PostVisibility } from '@prisma/client';

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  async getFeed(userId: string, limit = 20) {
    // 1. Fetch user's direct connections
    const connections = await this.prisma.connection.findMany({
      where: {
        OR: [
          { requesterId: userId, status: ConnectionStatus.ACCEPTED },
          { addresseeId: userId, status: ConnectionStatus.ACCEPTED },
        ],
      },
      select: { requesterId: true, addresseeId: true },
    });

    const connectionIds = new Set<string>();
    connections.forEach((c) => {
      connectionIds.add(c.requesterId === userId ? c.addresseeId : c.requesterId);
    });

    // 2. Fetch followed users
    const follows = await this.prisma.follow.findMany({
      where: { followerId: userId, followingType: 'USER' },
      select: { followingId: true },
    });
    const followIds = new Set(follows.map((f) => f.followingId));

    // 3. Fetch candidate posts (created within last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const candidatePosts = await this.prisma.post.findMany({
      where: {
        isDeleted: false,
        createdAt: { gte: sevenDaysAgo },
        OR: [
          { authorId: userId }, // user's own posts
          { authorId: { in: Array.from(connectionIds) } }, // connection posts
          { authorId: { in: Array.from(followIds) }, visibility: PostVisibility.PUBLIC },
          { visibility: PostVisibility.PUBLIC }, // public posts
        ],
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
      take: 100, // candidates for ranking
      orderBy: { createdAt: 'desc' },
    });

    if (candidatePosts.length === 0) {
      return { posts: [] };
    }

    // 4. Fetch viewer's skills for interest matching
    const userSkills = await this.prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true },
    });
    const skillsList = userSkills.map((us) => us.skill.name);

    // 5. Call Python Intelligence Service for feed ranking
    const pythonUrl = this.configService.get<string>('pythonService.url') || 'http://localhost:8000';
    const secret = this.configService.get<string>('pythonService.secret');

    const formattedCandidates = candidatePosts.map((p) => {
      let relationship = 'NONE';
      if (p.authorId === userId || connectionIds.has(p.authorId)) {
        relationship = 'CONNECTION';
      } else if (followIds.has(p.authorId)) {
        relationship = 'FOLLOW';
      }

      // Simple tag extraction from post content (hashtags or words)
      const tags = (p.content.match(/#(\w+)/g) || []).map((t) => t.substring(1));

      return {
        post_id: p.id,
        author_id: p.authorId,
        created_at: p.createdAt.toISOString(),
        like_count: p.likeCount,
        comment_count: p.commentCount,
        share_count: p.shareCount,
        author_relationship: relationship,
        post_tags: tags,
      };
    });

    try {
      const response = await axios.post(
        `${pythonUrl}/feed/rank`,
        {
          user_id: userId,
          candidate_posts: formattedCandidates,
          user_context: {
            skills: skillsList,
            recent_post_interactions: [],
            author_interaction_counts: {},
            hidden_post_ids: [],
          },
        },
        {
          headers: {
            'X-Service-Secret': secret,
            'Content-Type': 'application/json',
          },
          timeout: 1500, // 1.5s max timeout
        },
      );

      const rankedResults = response.data?.ranked_posts || [];
      const scoreMap = new Map<string, any>();
      rankedResults.forEach((r: any) => {
        scoreMap.set(r.post_id, r);
      });

      // Sort candidate posts by Python score
      candidatePosts.sort((a, b) => {
        const scoreA = scoreMap.get(a.id)?.score ?? 0;
        const scoreB = scoreMap.get(b.id)?.score ?? 0;
        return scoreB - scoreA;
      });

      this.logger.log(`Feed ranked via Python service for user ${userId} in ${response.data?.processing_time_ms}ms`);
    } catch (err) {
      this.logger.warn(`Python feed service unavailable (${err.message}). Falling back to chronological order.`);
    }

    // Attach viewer's like/save status to the top posts
    const topPosts = candidatePosts.slice(0, limit);
    const postIds = topPosts.map((p) => p.id);

    const [userLikes, userSaves] = await Promise.all([
      this.prisma.postLike.findMany({
        where: { userId, postId: { in: postIds } },
        select: { postId: true },
      }),
      this.prisma.savedPost.findMany({
        where: { userId, postId: { in: postIds } },
        select: { postId: true },
      }),
    ]);

    const likedSet = new Set(userLikes.map((l) => l.postId));
    const savedSet = new Set(userSaves.map((s) => s.postId));

    const enrichedPosts = topPosts.map((p) => ({
      ...p,
      isLiked: likedSet.has(p.id),
      isSaved: savedSet.has(p.id),
    }));

    return {
      posts: enrichedPosts,
    };
  }
}
