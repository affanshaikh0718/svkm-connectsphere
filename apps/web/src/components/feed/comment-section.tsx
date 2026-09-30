'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { postsService } from '@/services/posts.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatTimeAgo } from '@/lib/utils';
import { Loader2, Send, Heart, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  likeCount?: number;
  isLiked?: boolean;
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
}

interface CommentSectionProps {
  postId: string;
  initialComments?: Comment[];
}

export function CommentSection({ postId, initialComments = [] }: CommentSectionProps) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const res = await postsService.getComments(postId);
        if (!isMounted) return;
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data?.comments)
          ? res.data.comments
          : [];
        setComments(list);
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchComments();
    return () => {
      isMounted = false;
    };
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await postsService.addComment(postId, { content: newComment.trim() });
      if (res) {
        const safeComment: Comment = {
          ...res,
          likeCount: 0,
          isLiked: false,
          author: res.author || {
            id: user?.id || '',
            firstName: user?.firstName || 'User',
            lastName: user?.lastName || '',
            username: user?.username || 'user',
            profile: {
              headline: user?.profile?.headline,
              profilePictureUrl: user?.profile?.profilePictureUrl,
            },
          },
        };
        setComments((prev) => [safeComment, ...prev]);
      }
      setNewComment('');
      toast.success('Comment posted');
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = async (commentId: string) => {
    if (!user) {
      toast.error('Please sign in to react to comments');
      return;
    }
    const current = comments.find((c) => c.id === commentId);
    if (!current) return;
    const isLiked = !current.isLiked;
    const likeCount = Math.max(0, (current.likeCount || 0) + (isLiked ? 1 : -1));

    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, isLiked, likeCount } : c))
    );

    try {
      if (isLiked) {
        await postsService.likeComment(postId, commentId);
      } else {
        await postsService.unlikeComment(postId, commentId);
      }
    } catch {
      // Revert optimistic update on error
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? current : c))
      );
      toast.error('Failed to update comment reaction');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    const prevComments = [...comments];
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    try {
      await postsService.deleteComment(postId, commentId);
      toast.success('Comment deleted');
    } catch {
      setComments(prevComments);
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="pt-3 border-t border-border/40 mt-3 space-y-4">
      {/* Add comment input */}
      {user && (
        <form onSubmit={handleSubmit} className="flex gap-2.5 items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profile?.profilePictureUrl} />
            <AvatarFallback className="text-xs">
              {user.firstName[0]}
              {user.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 relative">
            <Input
              placeholder="Add a thoughtful comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="text-xs pr-9 h-9 rounded-full bg-secondary/30"
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              disabled={!newComment.trim() || isSubmitting}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full text-primary"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </form>
      )}

      {/* List comments */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center gap-1.5 py-4 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((comment) => {
            const isAuthor = user?.id && comment.author?.id === user.id;
            const isAdmin = user?.role === 'ADMIN';
            const canDelete = isAuthor || isAdmin;

            return (
              <div key={comment.id} className="flex gap-2.5 items-start text-xs group">
                <Avatar className="h-7 w-7 mt-0.5">
                  <AvatarImage src={comment.author?.profile?.profilePictureUrl} />
                  <AvatarFallback className="text-[10px]">
                    {comment.author?.firstName?.[0] || 'U'}
                    {comment.author?.lastName?.[0] || ''}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-secondary/30 rounded-xl p-2.5 space-y-1">
                  <div className="flex items-center justify-between font-medium">
                    <span className="font-semibold text-foreground">
                      {comment.author?.firstName || 'User'} {comment.author?.lastName || ''}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {comment.createdAt ? formatTimeAgo(comment.createdAt) : 'Just now'}
                    </span>
                  </div>
                  {comment.author?.profile?.headline && (
                    <p className="text-[10px] text-muted-foreground line-clamp-1">
                      {comment.author.profile.headline}
                    </p>
                  )}
                  <p className="text-foreground/90 whitespace-pre-line py-0.5">{comment.content}</p>

                  {/* Comment Actions: Like & Delete */}
                  <div className="flex items-center gap-3 pt-1 border-t border-border/20 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(comment.id)}
                      className={`inline-flex items-center gap-1 transition-colors hover:text-rose-500 ${
                        comment.isLiked ? 'text-rose-500 font-semibold' : 'text-muted-foreground'
                      }`}
                    >
                      <Heart
                        className={`h-3 w-3 ${comment.isLiked ? 'fill-current text-rose-500' : ''}`}
                      />
                      <span>{comment.likeCount || 0}</span>
                    </button>

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors ml-auto opacity-70 group-hover:opacity-100"
                        title="Delete comment"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="text-[10px]">Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
