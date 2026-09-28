'use client';

import { useEffect, useState } from 'react';
import { postsService } from '@/services/posts.service';
import { CreatePost } from '@/components/feed/create-post';
import { PostCard } from '@/components/feed/post-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';
import { LeftSidebar, FeedNavigationDropdown } from '@/components/layout/sidebar-left';
import { RightSidebar } from '@/components/layout/right-sidebar';

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      setIsLoading(true);
      const res = await postsService.getFeed();
      setPosts(Array.isArray(res?.data) ? res.data : []);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Mobile User Navigation Dropdown */}
      <div className="lg:hidden mb-4">
        <FeedNavigationDropdown />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 justify-center items-start">
        {/* Left Sidebar: LinkedIn-style User Profile Navigation */}
        <div className="hidden lg:block w-72 shrink-0 sticky top-20">
          <LeftSidebar />
        </div>

        {/* Center Main Feed Stream */}
        <div className="w-full max-w-2xl flex-1">
          {/* Create Post Card */}
          <CreatePost onPostCreated={fetchFeed} />

          {/* Feed Divider Indicator */}
          <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground justify-center">
            <span className="h-px bg-border flex-1" />
            <span className="flex items-center gap-1 font-medium">
              <Sparkles className="h-3 w-3 text-primary" /> Sorted by Relevance
            </span>
            <span className="h-px bg-border flex-1" />
          </div>

          {/* Feed Stream */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl border border-border/50 bg-card space-y-3">
                  <div className="flex gap-3 items-center">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border/70 bg-card/50">
              <h3 className="font-semibold text-base mb-1">Your feed is waiting for updates</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Connect with colleagues or follow companies to see what they are discussing.
              </p>
            </div>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>

        {/* Right Sidebar: SVKM Trending Topics & Partner Organizations */}
        <div className="hidden xl:block w-72 shrink-0 sticky top-20">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
