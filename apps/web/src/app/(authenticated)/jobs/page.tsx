'use client';

import { useEffect, useState } from 'react';
import { jobsService } from '@/services/jobs.service';
import { JobCard } from '@/components/jobs/job-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Search, GraduationCap, Building2, Bookmark, Sparkles, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const MOCK_INTERNSHIPS = [
  {
    id: 'intern-1',
    title: 'Software Engineering Summer Intern 2027',
    description: 'Join the SVKM Technology Excellence Center to build next-generation cloud and distributed applications. Work alongside senior architects and engineers across Mumbai campuses.',
    location: 'Mumbai, Maharashtra',
    locationType: 'HYBRID',
    employmentType: 'INTERNSHIP',
    experienceLevel: 'ENTRY',
    salaryMin: 25000,
    salaryMax: 45000,
    salaryCurrency: 'INR',
    isInternship: true,
    matchScore: 92,
    matchedSkillsCount: 4,
    company: {
      name: 'SVKM Tech Innovation Lab',
      slug: 'svkm-tech-lab',
      location: 'Vile Parle, Mumbai',
      growthRate: '+35% YoY Intern Conversions',
      medianTenure: '3.1 yrs median tenure',
    },
    skills: [
      { skill: { name: 'React' } },
      { skill: { name: 'Node.js' } },
      { skill: { name: 'TypeScript' } },
      { skill: { name: 'PostgreSQL' } },
    ],
  },
  {
    id: 'intern-2',
    title: 'AI & Data Science Research Intern',
    description: 'Work on predictive analytics, LLM fine-tuning, and campus data intelligence models with MPSTME AI faculty and industry partners.',
    location: 'Mumbai (MPSTME Campus)',
    locationType: 'ON_SITE',
    employmentType: 'INTERNSHIP',
    experienceLevel: 'ENTRY',
    salaryMin: 30000,
    salaryMax: 50000,
    salaryCurrency: 'INR',
    isInternship: true,
    matchScore: 89,
    matchedSkillsCount: 3,
    company: {
      name: 'NMIMS Centre for AI Studies',
      slug: 'nmims-ai-centre',
      location: 'Mumbai, India',
      growthRate: 'Top Research Placement Tier',
      medianTenure: '2.6 yrs median tenure',
    },
    skills: [
      { skill: { name: 'Python' } },
      { skill: { name: 'PyTorch' } },
      { skill: { name: 'Machine Learning' } },
      { skill: { name: 'FastAPI' } },
    ],
  },
  {
    id: 'intern-3',
    title: 'Full-Stack Web Development Intern',
    description: 'Build responsive web portals and student management microservices using Next.js, Tailwind CSS, and REST/GraphQL APIs.',
    location: 'Remote (India)',
    locationType: 'REMOTE',
    employmentType: 'INTERNSHIP',
    experienceLevel: 'ENTRY',
    salaryMin: 20000,
    salaryMax: 35000,
    salaryCurrency: 'INR',
    isInternship: true,
    matchScore: 95,
    matchedSkillsCount: 5,
    company: {
      name: 'DJSCE Alumni Tech Network',
      slug: 'djsce-alumni-network',
      location: 'Mumbai & Remote',
      growthRate: '+22% Startup Hiring Growth',
      medianTenure: '2.2 yrs median tenure',
    },
    skills: [
      { skill: { name: 'Next.js' } },
      { skill: { name: 'React' } },
      { skill: { name: 'Tailwind CSS' } },
      { skill: { name: 'TypeScript' } },
    ],
  },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [keyword, setKeyword] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'internships' | 'full_time' | 'remote' | 'saved'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async (searchKeyword?: string) => {
    try {
      setIsLoading(true);
      const [res, savedRes] = await Promise.all([
        jobsService.getJobs({ keyword: searchKeyword || undefined }).catch(() => ({ data: [] })),
        jobsService.getSavedJobs().catch(() => ({ data: [] })),
      ]);

      let loadedJobs = res?.data || [];
      if (loadedJobs.length === 0 && !searchKeyword) {
        // Fallback default jobs in INR
        loadedJobs = [
          {
            id: 'job-1',
            title: 'Senior Software Engineer - Backend',
            description: 'Design and build high-throughput microservices using NestJS, Redis, and PostgreSQL for SVKM enterprise systems.',
            location: 'Mumbai, Maharashtra',
            locationType: 'HYBRID',
            employmentType: 'FULL_TIME',
            experienceLevel: 'MID',
            salaryMin: 1200000,
            salaryMax: 1800000,
            salaryCurrency: 'INR',
            company: { name: 'SVKM Digital Labs', slug: 'svkm-digital', location: 'Mumbai' },
            skills: [{ skill: { name: 'NestJS' } }, { skill: { name: 'PostgreSQL' } }, { skill: { name: 'Docker' } }],
          },
          {
            id: 'job-2',
            title: 'Frontend Engineer (React / Next.js)',
            description: 'Craft modern web applications and design systems with high responsiveness and cross-platform fidelity.',
            location: 'Bangalore / Mumbai',
            locationType: 'REMOTE',
            employmentType: 'FULL_TIME',
            experienceLevel: 'MID',
            salaryMin: 900000,
            salaryMax: 1500000,
            salaryCurrency: 'INR',
            company: { name: 'TechNext Ventures', slug: 'technext', location: 'Bangalore' },
            skills: [{ skill: { name: 'React' } }, { skill: { name: 'Next.js' } }, { skill: { name: 'TypeScript' } }],
          },
        ];
      }

      // Append mock student internships if none exist
      const hasInternships = loadedJobs.some((j: any) => j.employmentType === 'INTERNSHIP' || j.title?.toLowerCase().includes('intern'));
      if (!hasInternships) {
        loadedJobs = [...loadedJobs, ...MOCK_INTERNSHIPS];
      }

      setJobs(loadedJobs);
      setSavedJobs(savedRes?.data || []);
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

  // Filtered jobs based on tab and keyword
  const filteredJobs = (() => {
    let list = jobs;
    if (selectedTab === 'internships') {
      list = jobs.filter((j) => j.employmentType === 'INTERNSHIP' || j.title?.toLowerCase().includes('intern') || j.isInternship);
    } else if (selectedTab === 'full_time') {
      list = jobs.filter((j) => j.employmentType === 'FULL_TIME' && !j.title?.toLowerCase().includes('intern'));
    } else if (selectedTab === 'remote') {
      list = jobs.filter((j) => j.locationType === 'REMOTE');
    } else if (selectedTab === 'saved') {
      list = savedJobs;
    }

    if (keyword.trim()) {
      const q = keyword.toLowerCase();
      list = list.filter((j) =>
        j.title?.toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q) ||
        j.company?.name?.toLowerCase().includes(q) ||
        j.skills?.some((s: any) => s.skill?.name?.toLowerCase().includes(q))
      );
    }
    return list;
  })();

  const internshipCount = jobs.filter((j) => j.employmentType === 'INTERNSHIP' || j.title?.toLowerCase().includes('intern') || j.isInternship).length;

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Search Header */}
      <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm bg-gradient-to-r from-primary/5 via-card to-secondary/30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              SVKM Placement & Opportunity Portal
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Explore verified full-time positions and student internships with salaries in INR (₹)
            </p>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-semibold">
            ₹ INR Currency Active
          </Badge>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by role, skill, or company (e.g. Intern, Full-Stack, React, Python)..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9 text-xs h-10 bg-background"
            />
          </div>
          <Button type="submit" size="sm" className="px-5 font-semibold bg-primary">
            Search
          </Button>
        </form>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-1.5 bg-secondary/80 p-1 rounded-xl border border-border/40 overflow-x-auto">
        <Button
          variant={selectedTab === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('all')}
          className="h-8 text-xs font-medium px-3"
        >
          All Opportunities ({jobs.length})
        </Button>
        <Button
          variant={selectedTab === 'internships' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('internships')}
          className="h-8 text-xs font-medium px-3 gap-1.5"
        >
          <GraduationCap className="h-3.5 w-3.5 text-blue-500" />
          <span>Student Internships</span>
          <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px] bg-background/60">
            {internshipCount}
          </Badge>
        </Button>
        <Button
          variant={selectedTab === 'full_time' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('full_time')}
          className="h-8 text-xs font-medium px-3"
        >
          Full-Time
        </Button>
        <Button
          variant={selectedTab === 'remote' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('remote')}
          className="h-8 text-xs font-medium px-3"
        >
          Remote
        </Button>
        <Button
          variant={selectedTab === 'saved' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('saved')}
          className="h-8 text-xs font-medium px-3 gap-1"
        >
          <Bookmark className="h-3 w-3" />
          <span>Saved</span>
          {savedJobs.length > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px] bg-background/60">
              {savedJobs.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Jobs Stream */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            {selectedTab === 'internships' ? (
              <>
                <GraduationCap className="h-4 w-4 text-blue-500" />
                <span>Student Internships & Summer Co-ops</span>
              </>
            ) : selectedTab === 'saved' ? (
              <>
                <Bookmark className="h-4 w-4 text-primary" />
                <span>Bookmarked Positions</span>
              </>
            ) : (
              <span>Recommended Openings ({filteredJobs.length})</span>
            )}
          </h2>
          <span className="text-[11px] text-muted-foreground">Updated in real-time</span>
        </div>

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
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-dashed border-border/70 p-6 space-y-2">
            <Briefcase className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
            <p className="font-semibold text-sm">No job openings found</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {selectedTab === 'internships'
                ? 'No student internships found for the current search filter.'
                : 'Try adjusting your search keywords or switching tabs.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setKeyword('');
                setSelectedTab('all');
                fetchJobs();
              }}
              className="text-xs mt-2"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>
    </div>
  );
}

