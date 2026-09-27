'use client';

import { useState } from 'react';
import Link from 'next/link';
import { jobsService } from '@/services/jobs.service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ApplyModal } from './apply-modal';
import { Bookmark, Briefcase, Building2, CheckCircle2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    location?: string;
    locationType: string;
    employmentType: string;
    experienceLevel: string;
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency?: string;
    hasApplied?: boolean;
    isSaved?: boolean;
    company: {
      name: string;
      slug: string;
      logoUrl?: string;
      location?: string;
    };
    skills?: Array<{ skill: { name: string } }>;
  };
}

export function JobCard({ job }: JobCardProps) {
  const [isSaved, setIsSaved] = useState(!!job.isSaved);
  const [hasApplied, setHasApplied] = useState(!!job.hasApplied);
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaved(!isSaved);
      await jobsService.saveJob(job.id);
      toast.success(isSaved ? 'Job unsaved' : 'Job saved to your bookmarks');
    } catch {
      setIsSaved(!isSaved);
    }
  };

  return (
    <>
      <Card className="mb-4 shadow-sm border border-border/50 hover:border-primary/40 transition-all">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <Link
                  href={`/company/${job.company.slug}`}
                  className="font-medium text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  {job.company.name}
                </Link>
                <span className="text-muted-foreground text-xs">•</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {job.location || job.locationType}
                </span>
              </div>

              <h3 className="font-semibold text-base text-foreground leading-snug">
                {job.title}
              </h3>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <Badge variant="secondary" className="text-[11px] font-normal">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {job.employmentType.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className="text-[11px] font-normal">
                  {job.experienceLevel}
                </Badge>
                <Badge variant="outline" className="text-[11px] font-normal">
                  {job.locationType}
                </Badge>
                {job.salaryMin && job.salaryMax && (
                  <Badge variant="secondary" className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} {job.salaryCurrency}
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 pt-2 leading-relaxed">
                {job.description}
              </p>

              {job.skills && job.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {job.skills.slice(0, 4).map(({ skill }) => (
                    <span key={skill.name} className="px-2 py-0.5 rounded text-[10px] bg-secondary/60 text-secondary-foreground font-mono">
                      {skill.name}
                    </span>
                  ))}
                  {job.skills.length > 4 && (
                    <span className="text-[10px] text-muted-foreground self-center">
                      +{job.skills.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 items-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                className="h-8 w-8 text-muted-foreground hover:text-primary"
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-primary text-primary' : ''}`} />
              </Button>

              {hasApplied ? (
                <Badge variant="secondary" className="text-xs gap-1 py-1.5 px-3 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Applied
                </Badge>
              ) : (
                <Button size="sm" onClick={() => setIsApplyOpen(true)} className="text-xs font-semibold px-4">
                  Easy Apply
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ApplyModal
        job={job}
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        onApplied={() => setHasApplied(true)}
      />
    </>
  );
}
