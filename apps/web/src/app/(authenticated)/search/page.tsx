'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { searchService } from '@/services/search.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Users, Briefcase, FileText, ArrowRight } from 'lucide-react';
import { getInitials } from '@/lib/utils';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;

    const performSearch = async () => {
      try {
        setIsLoading(true);
        const data = await searchService.globalSearch(query.trim());
        setResults(data);
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query]);

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="bg-card border border-border/60 p-6 rounded-xl shadow-sm">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Search Results for &ldquo;{query}&rdquo;
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Showing matching SVKM students, alumni, faculty, and campus placement drives.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : results ? (
        <div className="space-y-6">
          {/* People Section */}
          {results.users?.length > 0 && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  People ({results.users.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border/40">
                {results.users.map((u: any) => (
                  <div key={u.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {u.profile?.profilePictureUrl && (
                          <AvatarImage src={u.profile.profilePictureUrl} alt={u.firstName} />
                        )}
                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                          {getInitials(u.firstName, u.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link
                          href={`/in/${u.username}`}
                          className="font-semibold text-sm hover:underline text-foreground"
                        >
                          {u.firstName} {u.lastName}
                        </Link>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {u.profile?.headline || 'SVKM Ecosystem Member'}
                        </p>
                      </div>
                    </div>
                    <Link href={`/in/${u.username}`}>
                      <Button size="sm" variant="outline" className="text-xs">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Jobs Section */}
          {results.jobs?.length > 0 && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-emerald-600" />
                  Jobs & Placements ({results.jobs.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border/40">
                {results.jobs.map((j: any) => (
                  <div key={j.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{j.title}</h4>
                      <p className="text-xs text-muted-foreground">{j.company?.name || 'SVKM Campus Partner'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px]">
                          {j.jobType || 'Full-time'}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">{j.location}</span>
                      </div>
                    </div>
                    <Link href="/jobs">
                      <Button size="sm" className="text-xs">
                        View Job
                      </Button>
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {(!results.users || results.users.length === 0) &&
            (!results.jobs || results.jobs.length === 0) && (
              <div className="text-center py-16 bg-card border border-border/60 rounded-xl p-6">
                <Search className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <h3 className="font-bold text-base">No exact results found for &ldquo;{query}&rdquo;</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Try searching for MPSTME, DJSCE, Rohan, or engineering keywords.
                </p>
                <Link href="/network" className="mt-4 inline-block">
                  <Button size="sm" variant="outline" className="text-xs">
                    Browse All SVKM Connections <ArrowRight className="ml-1.5 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            )}
        </div>
      ) : null}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-muted-foreground">Loading search results...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
