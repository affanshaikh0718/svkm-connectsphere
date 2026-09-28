'use client';

import { useState } from 'react';
import Link from 'next/link';
import { postsService } from '@/services/posts.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CommentSection } from './comment-section';
import { formatTimeAgo } from '@/lib/utils';
import { Bookmark, Heart, MessageSquare, MoreHorizontal, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    createdAt: string;
    likeCount: number;
    commentCount: number;
    isLiked?: boolean;
    isSaved?: boolean;
    media?: { id?: string; url: string; mimeType?: string }[];
    author: {
      id: string;
      firstName: string;
      lastName: string;
      username: string;
      profile?: {
        headline?: string;
        profilePictureUrl?: string;
      };
    };
  };
}

export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(!!post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [isSaved, setIsSaved] = useState(!!post.isSaved);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    try {
      const nextLiked = !isLiked;
      setIsLiked(nextLiked);
      setLikeCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
      await postsService.likePost(post.id);
    } catch {
      // Revert on error
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleSave = async () => {
    try {
      setIsSaved(!isSaved);
      await postsService.savePost(post.id);
      toast.success(isSaved ? 'Removed from saved' : 'Post saved');
    } catch {
      setIsSaved(!isSaved);
    }
  };

  return (
    <Card className="mb-4 shadow-sm border border-border/50 hover:border-border/80 transition-all">
      <CardContent className="pt-5 pb-4">
        {/* Author Header */}
        <div className="flex items-start justify-between mb-3">
          <Link href={`/in/${post.author.username}`} className="flex gap-3 items-center group">
            <Avatar className="h-11 w-11 border">
              <AvatarImage src={post.author.profile?.profilePictureUrl} />
              <AvatarFallback className="font-semibold text-primary">
                {post.author.firstName[0]}
                {post.author.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-sm group-hover:text-primary transition-colors flex items-center gap-1.5">
                {post.author.firstName} {post.author.lastName}
                <span className="text-xs text-muted-foreground font-normal">
                  @{post.author.username}
                </span>
              </h4>
              {post.author.profile?.headline && (
                <p className="text-xs text-muted-foreground line-clamp-1 max-w-[420px]">
                  {post.author.profile.headline}
                </p>
              )}
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                {formatTimeAgo(post.createdAt)}
              </span>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="text-sm whitespace-pre-line text-foreground/90 leading-relaxed mb-4">
          {post.content}
        </div>

        {/* Attached Media (Photos / Videos) */}
        {post.media && post.media.length > 0 && (
          <div className="mb-4 space-y-2">
            {post.media.map((item, idx) => {
              const isVideo =
                item.mimeType?.startsWith('video/') ||
                /\.(mp4|webm|mov|mkv)$/i.test(item.url);
              if (isVideo) {
                return (
                  <div
                    key={item.id || idx}
                    className="rounded-xl overflow-hidden border border-border/60 bg-black/5"
                  >
                    <video
                      src={item.url}
                      controls
                      className="w-full max-h-[420px] rounded-xl object-contain bg-black"
                    />
                  </div>
                );
              }
              return (
                <div
                  key={item.id || idx}
                  className="rounded-xl overflow-hidden border border-border/60 bg-secondary/10"
                >
                  <img
                    src={item.url}
                    alt="Post media attachment"
                    className="w-full max-h-[460px] object-cover rounded-xl"
                    loading="lazy"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Engagement Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground py-2 border-y border-border/40">
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500 inline" />
            {likeCount} {likeCount === 1 ? 'like' : 'likes'}
          </span>
          <div className="flex gap-3">
            <span>{post.commentCount || 0} comments</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex-1 text-xs font-medium gap-1.5 ${
              isLiked ? 'text-red-500 font-semibold' : 'text-muted-foreground'
            }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500' : ''}`} />
            Like
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex-1 text-xs font-medium text-muted-foreground gap-1.5"
          >
            <MessageSquare className="h-4 w-4" />
            Comment
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className={`flex-1 text-xs font-medium gap-1.5 ${
              isSaved ? 'text-primary font-semibold' : 'text-muted-foreground'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-primary' : ''}`} />
            Save
          </Button>
        </div>

        {/* Expandable Comments */}
        {showComments && <CommentSection postId={post.id} />}
      </CardContent>
    </Card>
  );
}
