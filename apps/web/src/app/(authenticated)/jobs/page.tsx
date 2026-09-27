'use client';

import { useEffect, useState } from 'react';
import { jobsService } from '@/services/jobs.service';
import { JobCard } from '@/components/jobs/job-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Briefcase, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async (searchKeyword?: string) => {
    try {
      setIsLoading(true);
      const res = await jobsService.getJobs({ keyword: searchKeyword || undefined });
      if (res.data) {
        setJobs(res.data);
      }
    } catch {
      // error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(keyword.trim());
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Search Header */}
      <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          Find your next opportunity
        </h1>
        <p className="text-xs text-muted-foreground mb-4">
          Explore job openings matched with your skills and background.
        </p>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, skill, or keyword (e.g. Full-Stack, React, NestJS)..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9 text-xs h-10"
            />
          </div>
          <Button type="submit" size="sm" className="px-5 font-semibold">
            Search
          </Button>
        </form>
      </div>

      {/* Jobs Stream */}
      <div>
        <h2 className="text-sm font-bold text-foreground mb-3">
          Recommended Jobs ({jobs.length})
        </h2>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 rounded-xl border border-border/50 bg-card space-y-3">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-dashed border-border/70">
            <p className="font-semibold text-sm">No job openings found</p>
            <p className="text-xs text-muted-foreground mt-1">Try modifying your search keywords.</p>
          </div>
        ) : (
          jobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>
    </div>
  );
}
