'use client';

import { useEffect, useState, useMemo } from 'react';
import { jobsService } from '@/services/jobs.service';
import { JobCard } from '@/components/jobs/job-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  Search,
  GraduationCap,
  Building2,
  Bookmark,
  Sparkles,
  Code2,
  BrainCircuit,
  Boxes,
  Palette,
  Clock,
  Globe2,
  SlidersHorizontal,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export interface ComprehensiveJob {
  id: string;
  title: string;
  category: 'software' | 'datascience' | 'product' | 'design';
  description: string;
  location: string;
  locationType: 'ON_SITE' | 'HYBRID' | 'REMOTE';
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
  experienceLevel: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD';
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  isInternship?: boolean;
  matchScore: number;
  matchedSkillsCount: number;
  company: {
    name: string;
    slug: string;
    location: string;
    growthRate?: string;
    medianTenure?: string;
  };
  skills: Array<{ skill: { name: string } }>;
}

const RICH_DUMMY_JOBS: ComprehensiveJob[] = [
  // ─── 1. SOFTWARE ENGINEERING ────────────────────────────────────────────────
  {
    id: 'job-se-1',
    title: 'Senior Backend Engineer (Distributed Systems)',
    category: 'software',
    description:
      'Architect and scale high-throughput campus microservices, streaming event pipelines, and PostgreSQL/Redis data clusters for SVKM ConnectSphere.',
    location: 'Mumbai, Maharashtra',
    locationType: 'HYBRID',
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    salaryMin: 1800000,
    salaryMax: 2800000,
    salaryCurrency: 'INR',
    matchScore: 94,
    matchedSkillsCount: 4,
    company: {
      name: 'SVKM Digital Labs',
      slug: 'svkm-digital-labs',
      location: 'Vile Parle, Mumbai',
      growthRate: '+38% YoY Engineering Growth',
      medianTenure: '3.4 yrs median tenure',
    },
    skills: [
      { skill: { name: 'NestJS' } },
      { skill: { name: 'PostgreSQL' } },
      { skill: { name: 'Redis' } },
      { skill: { name: 'Docker' } },
      { skill: { name: 'TypeScript' } },
    ],
  },
  {
    id: 'job-se-2',
    title: 'Graduate Software Engineer — 2026 SVKM Campus Drive',
    category: 'software',
    description:
      'Premier campus recruitment drive for final year B.Tech/B.E. students of MPSTME and DJSCE. Work on core enterprise software solutions and cloud apps.',
    location: 'Mumbai (Hybrid)',
    locationType: 'HYBRID',
    employmentType: 'FULL_TIME',
    experienceLevel: 'ENTRY',
    salaryMin: 850000,
    salaryMax: 1400000,
    salaryCurrency: 'INR',
    matchScore: 96,
    matchedSkillsCount: 5,
    company: {
      name: 'Tata Consultancy Services',
      slug: 'tcs-campus',
      location: 'Mumbai, India',
      growthRate: '+15% Annual Campus Hiring',
      medianTenure: '4.1 yrs median tenure',
    },
    skills: [
      { skill: { name: 'Java' } },
      { skill: { name: 'Data Structures' } },
      { skill: { name: 'Algorithms' } },
      { skill: { name: 'SQL' } },
    ],
  },
  {
    id: 'intern-se-1',
    title: 'Full-Stack Web Engineering Intern (Next.js & NestJS)',
    category: 'software',
    description:
      'Summer research and development internship for SVKM students. Build open-source college portals, attendance engines, and high-performance WebSockets.',
    location: 'Vile Parle, Mumbai',
    locationType: 'ON_SITE',
    employmentType: 'INTERNSHIP',
    experienceLevel: 'ENTRY',
    salaryMin: 30000,
    salaryMax: 45000,
    salaryCurrency: 'INR',
    isInternship: true,
    matchScore: 98,
    matchedSkillsCount: 5,
    company: {
      name: 'DJ Labs & SVKM Incubator',
      slug: 'dj-labs',
      location: 'DJSCE Campus, Mumbai',
      growthRate: '+45% Startup Incubation Rate',
      medianTenure: '2.5 yrs median tenure',
    },
    skills: [
      { skill: { name: 'Next.js' } },
      { skill: { name: 'React' } },
      { skill: { name: 'NestJS' } },
      { skill: { name: 'TypeScript' } },
      { skill: { name: 'Tailwind CSS' } },
    ],
  },
  {
    id: 'part-se-1',
    title: 'Part-Time React & Frontend Student Mentor',
    category: 'software',
    description:
      'Guide junior engineering cohorts through hands-on React & Next.js web application projects. 15 hours/week flexible schedule suited for students.',
    location: 'Remote (India)',
    locationType: 'REMOTE',
    employmentType: 'PART_TIME',
    experienceLevel: 'MID',
    salaryMin: 22000,
    salaryMax: 35000,
    salaryCurrency: 'INR',
    matchScore: 89,
    matchedSkillsCount: 3,
    company: {
      name: 'CodeCraft SVKM Academy',
      slug: 'codecraft-academy',
      location: 'Remote / Mumbai',
      growthRate: '+60% Student Mentorship Growth',
      medianTenure: '2.0 yrs median tenure',
    },
    skills: [
      { skill: { name: 'React' } },
      { skill: { name: 'JavaScript' } },
      { skill: { name: 'CSS' } },
      { skill: { name: 'Git' } },
    ],
  },
  {
    id: 'job-se-3',
    title: 'Cloud Infrastructure & DevOps Engineer',
    category: 'software',
    description:
      'Deploy and maintain AWS Kubernetes infrastructure, Terraform provisioning, and CI/CD automated deployment pipelines for student web applications.',
    location: 'Mumbai, Maharashtra',
    locationType: 'HYBRID',
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    salaryMin: 1400000,
    salaryMax: 2200000,
    salaryCurrency: 'INR',
    matchScore: 86,
    matchedSkillsCount: 3,
    company: {
      name: 'CloudScale Technologies',
      slug: 'cloudscale-tech',
      location: 'Andheri East, Mumbai',
      growthRate: '+25% Cloud Engineering Hiring',
      medianTenure: '3.0 yrs median tenure',
    },
    skills: [
      { skill: { name: 'Docker' } },
      { skill: { name: 'Kubernetes' } },
      { skill: { name: 'AWS' } },
      { skill: { name: 'Terraform' } },
      { skill: { name: 'Linux' } },
    ],
  },

  // ─── 2. DATA SCIENCE & AI ────────────────────────────────────────────────────
  {
    id: 'intern-ds-1',
    title: 'AI & Data Science Research Intern (LLMs & PyTorch)',
    category: 'datascience',
    description:
      'Summer fellowship at NMIMS Centre for AI Studies. Conduct fine-tuning of open-weights LLMs, build campus RAG semantic pipelines, and publish joint research papers.',
    location: 'Mumbai (MPSTME Campus)',
    locationType: 'HYBRID',
    employmentType: 'INTERNSHIP',
    experienceLevel: 'ENTRY',
    salaryMin: 35000,
    salaryMax: 55000,
    salaryCurrency: 'INR',
    isInternship: true,
    matchScore: 93,
    matchedSkillsCount: 4,
    company: {
      name: 'NMIMS Centre for AI Studies',
      slug: 'nmims-ai-centre',
      location: 'MPSTME Campus, Mumbai',
      growthRate: 'Tier 1 Academic Research Lab',
      medianTenure: '2.8 yrs median tenure',
    },
    skills: [
      { skill: { name: 'Python' } },
      { skill: { name: 'PyTorch' } },
      { skill: { name: 'Machine Learning' } },
      { skill: { name: 'FastAPI' } },
      { skill: { name: 'LangChain' } },
    ],
  },
  {
    id: 'job-ds-1',
    title: 'Senior Data Scientist — Predictive Analytics & ML',
    category: 'datascience',
    description:
      'Lead algorithmic modeling and predictive intelligence engines across millions of telecom and digital services records. Strong background in statistics and ML.',
    location: 'Navi Mumbai, Maharashtra',
    locationType: 'ON_SITE',
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    salaryMin: 2200000,
    salaryMax: 3600000,
    salaryCurrency: 'INR',
    matchScore: 91,
    matchedSkillsCount: 4,
    company: {
      name: 'Jio Platforms Analytics',
      slug: 'jio-platforms',
      location: 'Navi Mumbai',
      growthRate: '+40% Enterprise Data Expansion',
      medianTenure: '3.6 yrs median tenure',
    },
    skills: [
      { skill: { name: 'Python' } },
      { skill: { name: 'Data Science' } },
      { skill: { name: 'SQL' } },
      { skill: { name: 'Spark' } },
      { skill: { name: 'TensorFlow' } },
    ],
  },
  {
    id: 'part-ds-1',
    title: 'Part-Time Data Analytics Assistant',
    category: 'datascience',
    description:
      'Clean and structure research datasets, build automated dashboard reports, and generate statistical insights for academic publications.',
    location: 'Remote (India)',
    locationType: 'REMOTE',
    employmentType: 'PART_TIME',
    experienceLevel: 'ENTRY',
    salaryMin: 20000,
    salaryMax: 32000,
    salaryCurrency: 'INR',
    matchScore: 88,
    matchedSkillsCount: 3,
    company: {
      name: 'SVKM Academic Research Cell',
      slug: 'svkm-research-cell',
      location: 'Mumbai / Remote',
      growthRate: '+30% Grants & Projects Funded',
      medianTenure: '2.1 yrs median tenure',
    },
    skills: [
      { skill: { name: 'Python' } },
      { skill: { name: 'Pandas' } },
      { skill: { name: 'Tableau' } },
      { skill: { name: 'SQL' } },
    ],
  },

  // ─── 3. PRODUCT MANAGEMENT ──────────────────────────────────────────────────
  {
    id: 'job-pm-1',
    title: 'Associate Product Manager (APM) — Campus Tech Suite',
    category: 'product',
    description:
      'Drive student lifecycle features, placement portal roadmap, and user discovery interviews across SVKM academic campuses. Work closely with design and engineering.',
    location: 'Mumbai, Maharashtra',
    locationType: 'HYBRID',
    employmentType: 'FULL_TIME',
    experienceLevel: 'ENTRY',
    salaryMin: 1200000,
    salaryMax: 1800000,
    salaryCurrency: 'INR',
    matchScore: 90,
    matchedSkillsCount: 3,
    company: {
      name: 'SVKM Placement & Tech Cell',
      slug: 'svkm-placement-cell',
      location: 'Vile Parle, Mumbai',
      growthRate: '+28% Student Experience Scale',
      medianTenure: '3.2 yrs median tenure',
    },
    skills: [
      { skill: { name: 'Product Management' } },
      { skill: { name: 'Agile' } },
      { skill: { name: 'User Research' } },
      { skill: { name: 'Analytics' } },
    ],
  },
  {
    id: 'intern-pm-1',
    title: 'Product Management Intern (EdTech & Gamification)',
    category: 'product',
    description:
      'Collaborate with student founders to formulate PRDs, user journey maps, and growth loops for campus networking products.',
    location: 'Mumbai & Remote',
    locationType: 'HYBRID',
    employmentType: 'INTERNSHIP',
    experienceLevel: 'ENTRY',
    salaryMin: 28000,
    salaryMax: 42000,
    salaryCurrency: 'INR',
    isInternship: true,
    matchScore: 87,
    matchedSkillsCount: 3,
    company: {
      name: 'ConnectSphere Labs',
      slug: 'connectsphere-labs',
      location: 'Mumbai, India',
      growthRate: 'Fast-Growing SVKM Incubated Venture',
      medianTenure: '2.0 yrs median tenure',
    },
    skills: [
      { skill: { name: 'Product Strategy' } },
      { skill: { name: 'Figma' } },
      { skill: { name: 'Wireframing' } },
      { skill: { name: 'Jira' } },
    ],
  },
  {
    id: 'job-pm-2',
    title: 'Technical Product Specialist — FinTech Solutions',
    category: 'product',
    description:
      'Lead payment gateway integrations, developer API documentation, and banking compliance workflows at Kotak Mahindra Bank BKC.',
    location: 'BKC, Mumbai',
    locationType: 'ON_SITE',
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    salaryMin: 1500000,
    salaryMax: 2400000,
    salaryCurrency: 'INR',
    matchScore: 85,
    matchedSkillsCount: 3,
    company: {
      name: 'Kotak Mahindra Bank',
      slug: 'kotak-bank',
      location: 'Bandra Kurla Complex, Mumbai',
      growthRate: '+20% FinTech Digital Scale',
      medianTenure: '3.8 yrs median tenure',
    },
    skills: [
      { skill: { name: 'API Design' } },
      { skill: { name: 'Product Management' } },
      { skill: { name: 'Fintech' } },
      { skill: { name: 'SQL' } },
    ],
  },

  // ─── 4. UI/UX & DESIGN ──────────────────────────────────────────────────────
  {
    id: 'job-ux-1',
    title: 'Senior Product Designer (UI/UX & Design Systems)',
    category: 'design',
    description:
      'Create high-fidelity component libraries, micro-interactions, and frictionless checkout/navigation flows for fast-growing quick commerce consumers.',
    location: 'Mumbai, Maharashtra',
    locationType: 'HYBRID',
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    salaryMin: 1600000,
    salaryMax: 2600000,
    salaryCurrency: 'INR',
    matchScore: 92,
    matchedSkillsCount: 4,
    company: {
      name: 'Zepto Design Studio',
      slug: 'zepto-design',
      location: 'Mumbai, India',
      growthRate: '+50% Product Design Team Growth',
      medianTenure: '2.7 yrs median tenure',
    },
    skills: [
      { skill: { name: 'Figma' } },
      { skill: { name: 'Design Systems' } },
      { skill: { name: 'UI/UX Design' } },
      { skill: { name: 'Prototyping' } },
    ],
  },
  {
    id: 'intern-ux-1',
    title: 'UI/UX & Interaction Design Intern',
    category: 'design',
    description:
      'Shape modern web and mobile user experiences for campus student communities. Build component styles, interactive Figma prototypes, and conduct usability testing.',
    location: 'Remote (India)',
    locationType: 'REMOTE',
    employmentType: 'INTERNSHIP',
    experienceLevel: 'ENTRY',
    salaryMin: 25000,
    salaryMax: 38000,
    salaryCurrency: 'INR',
    isInternship: true,
    matchScore: 95,
    matchedSkillsCount: 4,
    company: {
      name: 'SVKM Design Collective',
      slug: 'svkm-design-collective',
      location: 'Vile Parle, Mumbai & Remote',
      growthRate: '+35% Creative Projects Expansion',
      medianTenure: '2.2 yrs median tenure',
    },
    skills: [
      { skill: { name: 'Figma' } },
      { skill: { name: 'UI/UX Design' } },
      { skill: { name: 'User Research' } },
      { skill: { name: 'Wireframing' } },
    ],
  },
  {
    id: 'part-ux-1',
    title: 'Part-Time Visual Brand & Graphic Designer',
    category: 'design',
    description:
      'Craft campus fest identity graphics, marketing banners, and social collateral for SVKM festivals and department publications. 12-16 hrs/week.',
    location: 'Mumbai, Maharashtra',
    locationType: 'HYBRID',
    employmentType: 'PART_TIME',
    experienceLevel: 'ENTRY',
    salaryMin: 18000,
    salaryMax: 28000,
    salaryCurrency: 'INR',
    matchScore: 88,
    matchedSkillsCount: 3,
    company: {
      name: 'Mithibai Creative Media Cell',
      slug: 'mithibai-media',
      location: 'Mithibai Campus, Mumbai',
      growthRate: 'Premier College Creative Bureau',
      medianTenure: '2.0 yrs median tenure',
    },
    skills: [
      { skill: { name: 'Adobe Photoshop' } },
      { skill: { name: 'Illustrator' } },
      { skill: { name: 'Figma' } },
      { skill: { name: 'Visual Design' } },
    ],
  },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'software' | 'datascience' | 'product' | 'design'>('all');
  const [selectedTab, setSelectedTab] = useState<'all' | 'internships' | 'full_time' | 'part_time' | 'remote' | 'saved'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async (searchKeyword?: string) => {
    try {
      setIsLoading(true);
      const [res, savedRes] = await Promise.all([
        jobsService.getJobs({ keyword: searchKeyword || undefined }).catch(() => ({ data: [] })),
        jobsService.getSavedJobs().catch(() => ({ data: [] })),
      ]);

      const loadedJobs = res?.data || [];
      // Combine API results with rich dummy listings ensuring unique IDs
      const combined = [...loadedJobs];
      for (const dummy of RICH_DUMMY_JOBS) {
        if (!combined.some((j) => j.id === dummy.id || j.title === dummy.title)) {
          combined.push(dummy);
        }
      }

      setJobs(combined);
      setSavedJobs(savedRes?.data || []);
    } catch {
      setJobs(RICH_DUMMY_JOBS);
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

  // Filtered jobs based on tab, category, and keyword
  const filteredJobs = useMemo(() => {
    let list = jobs;

    // Filter by Tab
    if (selectedTab === 'internships') {
      list = list.filter(
        (j) =>
          j.employmentType === 'INTERNSHIP' ||
          j.title?.toLowerCase().includes('intern') ||
          j.isInternship
      );
    } else if (selectedTab === 'full_time') {
      list = list.filter(
        (j) =>
          j.employmentType === 'FULL_TIME' &&
          !j.title?.toLowerCase().includes('intern')
      );
    } else if (selectedTab === 'part_time') {
      list = list.filter((j) => j.employmentType === 'PART_TIME');
    } else if (selectedTab === 'remote') {
      list = list.filter((j) => j.locationType === 'REMOTE');
    } else if (selectedTab === 'saved') {
      list = savedJobs;
    }

    // Filter by Domain Category
    if (selectedCategory !== 'all') {
      list = list.filter((j) => {
        if (j.category === selectedCategory) return true;
        const text = `${j.title} ${j.description} ${JSON.stringify(j.skills || [])}`.toLowerCase();
        if (selectedCategory === 'software') {
          return text.includes('software') || text.includes('backend') || text.includes('frontend') || text.includes('developer') || text.includes('devops') || text.includes('engineer');
        }
        if (selectedCategory === 'datascience') {
          return text.includes('data') || text.includes('ai') || text.includes('learning') || text.includes('python') || text.includes('analytics');
        }
        if (selectedCategory === 'product') {
          return text.includes('product') || text.includes('apm') || text.includes('strategy');
        }
        if (selectedCategory === 'design') {
          return text.includes('design') || text.includes('ux') || text.includes('ui') || text.includes('figma');
        }
        return true;
      });
    }

    // Filter by Search Keyword
    if (keyword.trim()) {
      const q = keyword.toLowerCase();
      list = list.filter(
        (j) =>
          j.title?.toLowerCase().includes(q) ||
          j.description?.toLowerCase().includes(q) ||
          j.company?.name?.toLowerCase().includes(q) ||
          j.location?.toLowerCase().includes(q) ||
          j.skills?.some((s: any) => s.skill?.name?.toLowerCase().includes(q) || s.name?.toLowerCase().includes(q))
      );
    }

    return list;
  }, [jobs, savedJobs, selectedTab, selectedCategory, keyword]);

  const internshipCount = jobs.filter(
    (j) => j.employmentType === 'INTERNSHIP' || j.title?.toLowerCase().includes('intern') || j.isInternship
  ).length;

  const fullTimeCount = jobs.filter(
    (j) => j.employmentType === 'FULL_TIME' && !j.title?.toLowerCase().includes('intern')
  ).length;

  const partTimeCount = jobs.filter((j) => j.employmentType === 'PART_TIME').length;

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Search Header Banner */}
      <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm bg-gradient-to-r from-primary/10 via-card to-secondary/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2.5 tracking-tight text-foreground">
              <Briefcase className="h-6 w-6 text-primary" />
              SVKM Placement & Career Opportunities
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Explore verified Full-Time roles, Part-Time positions, and Student Summer Internships in ₹ INR
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-semibold px-2.5 py-1">
              ₹ INR Currency Active
            </Badge>
            <Badge variant="secondary" className="text-xs font-medium px-2.5 py-1">
              {jobs.length} Active Listings
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by role, company, skill (e.g. Next.js, Data Science, APM, Figma, Python)..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-10 text-xs sm:text-sm h-11 bg-background/90 border-border/80 shadow-inner rounded-xl"
            />
          </div>
          <Button type="submit" size="default" className="px-6 font-semibold bg-primary hover:bg-primary/90 rounded-xl h-11">
            Search
          </Button>
        </form>
      </div>

      {/* Domain Category Filter Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span className="font-semibold flex items-center gap-1.5 text-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
            Filter by Domain:
          </span>
          <span>{filteredJobs.length} results matching</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className="h-8 text-xs rounded-full px-3.5 font-medium transition-all"
          >
            All Domains
          </Button>
          <Button
            variant={selectedCategory === 'software' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('software')}
            className="h-8 text-xs rounded-full px-3.5 font-medium flex items-center gap-1.5 transition-all"
          >
            <Code2 className="h-3.5 w-3.5 text-blue-500" />
            Software Engineering
          </Button>
          <Button
            variant={selectedCategory === 'datascience' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('datascience')}
            className="h-8 text-xs rounded-full px-3.5 font-medium flex items-center gap-1.5 transition-all"
          >
            <BrainCircuit className="h-3.5 w-3.5 text-purple-500" />
            AI & Data Science
          </Button>
          <Button
            variant={selectedCategory === 'product' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('product')}
            className="h-8 text-xs rounded-full px-3.5 font-medium flex items-center gap-1.5 transition-all"
          >
            <Boxes className="h-3.5 w-3.5 text-amber-500" />
            Product Management
          </Button>
          <Button
            variant={selectedCategory === 'design' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('design')}
            className="h-8 text-xs rounded-full px-3.5 font-medium flex items-center gap-1.5 transition-all"
          >
            <Palette className="h-3.5 w-3.5 text-pink-500" />
            UI/UX & Design
          </Button>
        </div>
      </div>

      {/* Type Tabs Filter Bar */}
      <div className="flex items-center gap-1.5 bg-secondary/70 p-1.5 rounded-xl border border-border/50 overflow-x-auto">
        <Button
          variant={selectedTab === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('all')}
          className="h-8 text-xs font-medium px-3.5 rounded-lg"
        >
          All Opportunities ({jobs.length})
        </Button>
        <Button
          variant={selectedTab === 'internships' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('internships')}
          className="h-8 text-xs font-medium px-3.5 gap-1.5 rounded-lg"
        >
          <GraduationCap className="h-3.5 w-3.5 text-blue-500" />
          <span>Student Internships</span>
          <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px] bg-background/80 font-bold">
            {internshipCount}
          </Badge>
        </Button>
        <Button
          variant={selectedTab === 'full_time' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('full_time')}
          className="h-8 text-xs font-medium px-3.5 rounded-lg"
        >
          Full-Time ({fullTimeCount})
        </Button>
        <Button
          variant={selectedTab === 'part_time' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('part_time')}
          className="h-8 text-xs font-medium px-3.5 gap-1 rounded-lg"
        >
          <Clock className="h-3.5 w-3.5 text-amber-500" />
          <span>Part-Time ({partTimeCount})</span>
        </Button>
        <Button
          variant={selectedTab === 'remote' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('remote')}
          className="h-8 text-xs font-medium px-3.5 gap-1 rounded-lg"
        >
          <Globe2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>Remote</span>
        </Button>
        <Button
          variant={selectedTab === 'saved' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('saved')}
          className="h-8 text-xs font-medium px-3.5 gap-1.5 rounded-lg ml-auto"
        >
          <Bookmark className="h-3.5 w-3.5 text-primary" />
          <span>Saved</span>
          {savedJobs.length > 0 && (
            <Badge variant="secondary" className="ml-0.5 px-1.5 py-0 text-[10px] bg-background/80 font-bold">
              {savedJobs.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Jobs Stream */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            {selectedTab === 'internships' ? (
              <>
                <GraduationCap className="h-4 w-4 text-blue-500" />
                <span>Student Internships & Co-ops ({filteredJobs.length})</span>
              </>
            ) : selectedTab === 'saved' ? (
              <>
                <Bookmark className="h-4 w-4 text-primary" />
                <span>Bookmarked Positions ({filteredJobs.length})</span>
              </>
            ) : (
              <span>Opportunities & Openings ({filteredJobs.length})</span>
            )}
          </h2>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" /> Match Score Ranked
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-5 rounded-xl border border-border/50 bg-card space-y-3">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border/70 p-6 space-y-3">
            <Briefcase className="h-10 w-10 text-muted-foreground mx-auto opacity-40" />
            <p className="font-semibold text-base">No matching job openings found</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {keyword
                ? `No roles matched "${keyword}". Try searching for general terms like "Intern", "Engineer", "Python", or "Design".`
                : 'No positions found for this filter criteria. Try selecting another tab or category.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setKeyword('');
                setSelectedCategory('all');
                setSelectedTab('all');
                fetchJobs();
              }}
              className="text-xs mt-2"
            >
              Reset All Filters
            </Button>
          </div>
        ) : (
          filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>
    </div>
  );
}
