'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { postsService } from '@/services/posts.service';
import type { Post } from '@/types';

export function useInfiniteFeed() {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam }) =>
      postsService.getFeed(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useFeedPosts() {
  const query = useInfiniteFeed();
  const posts: Post[] = query.data?.pages.flatMap((page) => page.data) ?? [];
  return { ...query, posts };
}
