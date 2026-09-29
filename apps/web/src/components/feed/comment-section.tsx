'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { postsService } from '@/services/posts.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatTimeAgo } from '@/lib/utils';
import { Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
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
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-2.5 items-start text-xs">
              <Avatar className="h-7 w-7 mt-0.5">
                <AvatarImage src={comment.author?.profile?.profilePictureUrl} />
                <AvatarFallback className="text-[10px]">
                  {comment.author?.firstName?.[0] || 'U'}
                  {comment.author?.lastName?.[0] || ''}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-secondary/30 rounded-xl p-2.5">
                <div className="flex items-center justify-between font-medium">
                  <span className="font-semibold text-foreground">
                    {comment.author?.firstName || 'User'} {comment.author?.lastName || ''}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {comment.createdAt ? formatTimeAgo(comment.createdAt) : 'Just now'}
                  </span>
                </div>
                {comment.author?.profile?.headline && (
                  <p className="text-[10px] text-muted-foreground line-clamp-1 mb-1">
                    {comment.author.profile.headline}
                  </p>
                )}
                <p className="text-foreground/90 whitespace-pre-line mt-1">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
