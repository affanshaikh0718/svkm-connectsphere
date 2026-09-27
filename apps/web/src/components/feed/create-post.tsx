'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { postsService } from '@/services/posts.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Image as ImageIcon, Send, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreatePostProps {
  onPostCreated?: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await postsService.createPost({
        content: content.trim(),
        visibility: 'PUBLIC',
      });
      setContent('');
      toast.success('Post published successfully!');
      onPostCreated?.();
    } catch {
      toast.error('Failed to publish post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="mb-6 shadow-sm border border-border/50">
      <CardContent className="pt-5">
        <div className="flex gap-3">
          <Avatar className="h-11 w-11 border">
            <AvatarImage src={user.profile?.profilePictureUrl} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {user.firstName[0]}
              {user.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <form onSubmit={handleSubmit}>
              <Textarea
                placeholder="What do you want to talk about? Share an insight, project or achievement..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className="resize-none border-border/60 focus-visible:ring-primary/20 text-sm"
              />
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/40">
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <span className="flex items-center gap-1 px-2 py-1 rounded bg-secondary/50">
                    <Sparkles className="h-3 w-3 text-primary" /> Ranked by AI & Relevance
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!content.trim() || isSubmitting}
                    className="font-medium px-4"
                  >
                    {isSubmitting ? 'Posting...' : 'Post'}
                    <Send className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
