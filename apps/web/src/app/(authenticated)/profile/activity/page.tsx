'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { postsService } from '@/services/posts.service';
import { PostCard } from '@/components/feed/post-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  ArrowLeft,
  MessageSquare,
  Bookmark,
  Sparkles,
  Share2,
  Image as ImageIcon,
  Layers,
  Search,
  PlusCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserActivityPage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'saved'>('posts');
  const [searchQuery, setSearchQuery] = useState('');

  const loadUserActivity = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const [userPosts, savedRes] = await Promise.all([
        postsService.getUserPosts(user.id, 50).catch(() => []),
        postsService.getFeed().catch(() => ({ data: [] })),
      ]);

      setPosts(userPosts || []);
      // Extract saved posts
      const saved = ((savedRes as any)?.data || []).filter((p: any) => p.isSaved);
      setSavedPosts(saved);
    } catch {
      toast.error('Failed to load activity');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserActivity();
  }, [user?.id]);

  const handlePostDeleted = (deletedId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
    setSavedPosts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  const handlePostUpdated = (updated: any) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
    setSavedPosts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
  };

  // Filters
  const mediaPosts = posts.filter((p) => p.media && p.media.length > 0);

  const displayedList = (() => {
    let list: any[] = [];
    if (activeTab === 'posts') list = posts;
    else if (activeTab === 'media') list = mediaPosts;
    else if (activeTab === 'saved') list = savedPosts;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.content?.toLowerCase().includes(q));
    }
    return list;
  })();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={user?.username ? `/in/${user.username}` : '/home'}
              className="text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Profile
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-brand-600" /> Posts & Activity
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage your SVKM campus broadcasts, technical articles, and saved network insights
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/home">
            <Button size="sm" className="text-xs gap-1.5 font-semibold bg-primary">
              <PlusCircle className="h-3.5 w-3.5" /> Create New Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-1 bg-secondary/80 p-1 rounded-xl border border-border/40 overflow-x-auto">
          <Button
            variant={activeTab === 'posts' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('posts')}
            className="h-8 text-xs px-3 font-medium gap-1.5"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>All Posts</span>
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px] bg-background/60">
              {posts.length}
            </Badge>
          </Button>

          <Button
            variant={activeTab === 'media' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('media')}
            className="h-8 text-xs px-3 font-medium gap-1.5"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Images & Media</span>
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px] bg-background/60">
              {mediaPosts.length}
            </Badge>
          </Button>

          <Button
            variant={activeTab === 'saved' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('saved')}
            className="h-8 text-xs px-3 font-medium gap-1.5"
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Saved Items</span>
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px] bg-background/60">
              {savedPosts.length}
            </Badge>
          </Button>
        </div>

        {/* Filter search */}
        <div className="relative sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search activity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Post List Content */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-5 space-y-3">
                <div className="flex gap-3 items-center">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full" />
              </Card>
            ))}
          </div>
        ) : displayedList.length === 0 ? (
          <Card className="border-border/60 p-10 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              {activeTab === 'posts' ? (
                <FileText className="h-6 w-6" />
              ) : activeTab === 'media' ? (
                <ImageIcon className="h-6 w-6" />
              ) : (
                <Bookmark className="h-6 w-6" />
              )}
            </div>
            <h3 className="text-base font-bold text-foreground">
              {activeTab === 'posts'
                ? 'No posts published yet'
                : activeTab === 'media'
                ? 'No media uploads found'
                : 'No saved posts'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {activeTab === 'posts'
                ? 'Share project updates, technical insights, or campus announcements with the SVKM community.'
                : activeTab === 'media'
                ? 'Posts with screenshots, project demos, or infographics will appear here.'
                : 'Bookmark posts from the home feed to access them anytime.'}
            </p>
            {activeTab === 'posts' && (
              <Link href="/home">
                <Button size="sm" className="text-xs mt-2">
                  Share Your First Post
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          displayedList.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
            />
          ))
        )}
      </div>
    </div>
  );
}
