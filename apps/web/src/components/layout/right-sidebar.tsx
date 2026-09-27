'use client';

import Link from 'next/link';
import { TrendingUp, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { companiesService } from '@/services/companies.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { companiesService as cs } from '@/services/companies.service';

const TRENDING_TOPICS = [
  { tag: '#SVKMPlacements2026', posts: 1420 },
  { tag: '#MPSTMEHackathon', posts: 980 },
  { tag: '#DJSCECodingLeague', posts: 840 },
  { tag: '#NMIMSAlumniMentorship', posts: 620 },
  { tag: '#SVKMInternships', posts: 510 },
];

export function RightSidebar() {
  const { data: companies, isLoading } = useQuery({
    queryKey: ['suggested-companies'],
    queryFn: () => companiesService.getSuggestedCompanies(5),
  });

  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());

  const handleFollow = async (id: string) => {
    try {
      if (followedIds.has(id)) {
        await cs.unfollowCompany(id);
        setFollowedIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
      } else {
        await cs.followCompany(id);
        setFollowedIds((prev) => new Set(prev).add(id));
        toast.success('Following organization');
      }
    } catch {
      toast.error('Action failed');
    }
  };

  return (
    <aside className="w-72 shrink-0 space-y-4">
      {/* Trending */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Trending Across SVKM
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-2">
            {TRENDING_TOPICS.map((topic) => (
              <li key={topic.tag}>
                <Link
                  href={`/search?q=${encodeURIComponent(topic.tag)}`}
                  className="block hover:bg-accent rounded p-1.5 transition-colors"
                >
                  <p className="text-sm font-medium text-primary">{topic.tag}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(topic.posts)} SVKM discussions
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Companies to follow */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">SVKM Partner Organizations</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-24 mb-1" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                  <Skeleton className="h-6 w-14" />
                </div>
              ))}
            </div>
          ) : companies && companies.length > 0 ? (
            <ul className="space-y-3">
              {companies.map((company) => (
                <li key={company.id} className="flex items-center gap-2">
                  <Link href={`/company/${company.slug}`}>
                    <Avatar className="h-8 w-8 rounded">
                      {company.logoUrl && (
                        <AvatarImage src={company.logoUrl} alt={company.name} />
                      )}
                      <AvatarFallback className="rounded text-xs bg-muted">
                        {company.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/company/${company.slug}`}
                      className="text-xs font-medium hover:underline block truncate"
                    >
                      {company.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(company.followerCount)} followers
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={() => handleFollow(company.id)}
                  >
                    {followedIds.has(company.id) ? 'Following' : <><Plus className="h-3 w-3 mr-1" />Follow</>}
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">
              No suggestions available
            </p>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
