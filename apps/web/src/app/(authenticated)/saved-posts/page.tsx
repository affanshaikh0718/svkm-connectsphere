'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Bookmark, ArrowRight, MessageSquare, Heart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, formatTimeAgo } from '@/lib/utils';

export default function SavedPostsPage() {
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get('/users/me/saved-posts');
        if (res.data?.data) {
          setSavedPosts(res.data.data);
        }
      } catch {
        // fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedPosts();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="bg-card border border-border/60 p-6 rounded-xl shadow-sm">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-primary" />
          Saved Items
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Access your bookmarked SVKM placement notices, technical articles, and discussions.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : savedPosts.length > 0 ? (
        <div className="space-y-4">
          {savedPosts.map((item: any) => {
            const post = item.post || item;
            return (
              <Card key={post.id} className="border-border/60 shadow-sm">
                <CardContent className="pt-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      {post.author?.profile?.profilePictureUrl && (
                        <AvatarImage src={post.author.profile.profilePictureUrl} />
                      )}
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                        {getInitials(post.author?.firstName || 'S', post.author?.lastName || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link
                        href={`/in/${post.author?.username}`}
                        className="font-semibold text-xs hover:underline text-foreground"
                      >
                        {post.author?.firstName} {post.author?.lastName}
                      </Link>
                      <p className="text-[11px] text-muted-foreground">
                        {formatTimeAgo(post.createdAt || new Date())}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">
                    {post.content}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-card border border-border/60 rounded-xl p-6">
          <Bookmark className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-40" />
          <h3 className="font-bold text-base">No saved posts yet</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Bookmark interesting SVKM discussions and campus placement updates from your feed.
          </p>
          <Link href="/home" className="mt-4 inline-block">
            <Button size="sm" className="text-xs">
              Go to Feed <ArrowRight className="ml-1.5 h-3 w-3" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
