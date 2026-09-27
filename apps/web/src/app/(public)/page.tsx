import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  Award,
  Bot,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Network,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

const SVKM_COLLEGES = [
  { name: 'MPSTME', fullName: 'Mukesh Patel School of Tech Mgmt & Engineering', location: 'Mumbai & Shirpur' },
  { name: 'DJSCE', fullName: 'Dwarkadas J. Sanghvi College of Engineering', location: 'Vile Parle, Mumbai' },
  { name: 'NMIMS', fullName: 'Narsee Monjee Institute of Management Studies', location: 'All Campuses' },
  { name: 'Mithibai College', fullName: 'Arts, Science & Commerce College', location: 'Vile Parle, Mumbai' },
  { name: 'NM College', fullName: 'Narsee Monjee College of Commerce & Economics', location: 'Vile Parle, Mumbai' },
  { name: 'PGCL', fullName: 'Pravin Gandhi College of Law', location: 'Vile Parle, Mumbai' },
  { name: 'UPG', fullName: 'Usha Pravin Gandhi College of Management', location: 'Vile Parle, Mumbai' },
  { name: 'BNCP', fullName: 'Dr. Bhanuben Nanavati College of Pharmacy', location: 'Vile Parle, Mumbai' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20">
      {/* Top Banner: 100% Free Academic Platform */}
      <div className="bg-primary/10 border-b border-primary/20 text-xs py-2 px-4 text-center font-medium text-primary flex items-center justify-center gap-2">
        <Sparkles className="h-3.5 w-3.5" />
        <span>100% Free Forever for the entire SVKM Academic Community — Students, Alumni, Faculty & Recruiters</span>
      </div>

      {/* Navigation */}
      <header className="border-b border-border/50 sticky top-0 bg-background/85 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-base shadow-sm">
              CS
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight flex items-center gap-1.5 leading-none">
                ConnectSphere
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  SVKM
                </span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">SVKM Professional Network</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-medium">
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="font-semibold shadow-sm">
                Join SVKM Network
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-16 sm:py-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold mb-6 border border-border/60">
          <GraduationCap className="h-4 w-4 text-primary" />
          <span>Shri Vile Parle Kelavani Mandal Professional Ecosystem</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.12]">
          LinkedIn for the <span className="text-primary underline decoration-primary/30 decoration-wavy">SVKM</span> Ecosystem.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Connect directly with fellow SVKM students, distinguished alumni across global tech & finance, esteemed faculty, and official campus placement recruiters.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3.5 justify-center w-full max-w-md">
          <Link href="/register" className="w-full sm:w-auto flex-1">
            <Button size="lg" className="w-full font-semibold px-8 shadow-md">
              Create Free SVKM Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto flex-1">
            <Button size="lg" variant="outline" className="w-full px-8">
              Sign In to Your Feed
            </Button>
          </Link>
        </div>

        {/* Participating SVKM Colleges Ticker/Grid */}
        <div className="mt-14 w-full">
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-4">
            Connecting premier institutions across the SVKM family (Click to Join your College)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SVKM_COLLEGES.map((col) => (
              <Link
                key={col.name}
                href={`/register?college=${encodeURIComponent(col.name)}`}
                className="group p-3 rounded-lg border border-border/60 bg-card/60 hover:bg-card hover:border-primary/50 transition-all text-left block cursor-pointer hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{col.name}</div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{col.fullName}</div>
                <div className="text-[10px] text-primary/80 mt-1 font-medium">{col.location}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* 4 Core Pillars for SVKM Ecosystem */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-16 w-full text-left">
          <Card className="border-border/60 shadow-sm bg-card hover:border-blue-500/40 transition-colors flex flex-col justify-between">
            <CardContent className="pt-6">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base mb-1.5">For Students</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Showcase technical capstones, find hackathon teammates, prepare for technical interviews, and apply for verified campus drives.
              </p>
              <div className="flex flex-col gap-2 mt-auto">
                <Link href="/register?role=STUDENT">
                  <Button size="sm" className="w-full text-xs font-semibold">
                    Join as Student <ArrowRight className="ml-1.5 h-3 w-3" />
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button size="sm" variant="ghost" className="w-full text-xs text-muted-foreground hover:text-foreground">
                    View Placement Drives
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm bg-card hover:border-emerald-500/40 transition-colors flex flex-col justify-between">
            <CardContent className="pt-6">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base mb-1.5">For Alumni</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Reconnect with your college batch, mentor promising juniors, post career opportunities, and share company referrals.
              </p>
              <div className="flex flex-col gap-2 mt-auto">
                <Link href="/register?role=ALUMNI">
                  <Button size="sm" className="w-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white">
                    Join as Alumnus <ArrowRight className="ml-1.5 h-3 w-3" />
                  </Button>
                </Link>
                <Link href="/network">
                  <Button size="sm" variant="ghost" className="w-full text-xs text-muted-foreground hover:text-foreground">
                    Connect Network
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm bg-card hover:border-purple-500/40 transition-colors flex flex-col justify-between">
            <CardContent className="pt-6">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center mb-4">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base mb-1.5">For Faculty & Staff</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Publish departmental achievements, announce inter-collegiate symposiums, and connect research scholars with industry partners.
              </p>
              <div className="flex flex-col gap-2 mt-auto">
                <Link href="/register?role=FACULTY">
                  <Button size="sm" className="w-full text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white">
                    Join as Faculty <ArrowRight className="ml-1.5 h-3 w-3" />
                  </Button>
                </Link>
                <Link href="/home">
                  <Button size="sm" variant="ghost" className="w-full text-xs text-muted-foreground hover:text-foreground">
                    Browse Announcements
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm bg-card hover:border-amber-500/40 transition-colors flex flex-col justify-between">
            <CardContent className="pt-6">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                <Briefcase className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base mb-1.5">For Recruiters</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Coordinate directly with SVKM placement teams, recruit vetted engineering & management talent, and post internship drives.
              </p>
              <div className="flex flex-col gap-2 mt-auto">
                <Link href="/register?role=RECRUITER">
                  <Button size="sm" className="w-full text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white">
                    Recruiter Sign Up <ArrowRight className="ml-1.5 h-3 w-3" />
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button size="sm" variant="ghost" className="w-full text-xs text-muted-foreground hover:text-foreground">
                    Placement Portal
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 w-full text-left">
          <Link href="/network" className="block group">
            <Card className="border-border/50 shadow-sm h-full group-hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Network className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-bold text-base group-hover:text-primary transition-colors">SVKM Social Graph</h3>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Build 1st-degree connections across SVKM colleges, chat in real-time with WebSockets, and share posts with rich engagement.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/jobs" className="block group">
            <Card className="border-border/50 shadow-sm h-full group-hover:border-emerald-500/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-bold text-base group-hover:text-emerald-600 transition-colors">Campus Placement Portal</h3>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Discover internship and full-time job openings tailored specifically for SVKM students, track statuses, and submit applications.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/home" className="block group">
            <Card className="border-border/50 shadow-sm h-full group-hover:border-purple-500/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center mb-4">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-bold text-base group-hover:text-purple-600 transition-colors">Python Intelligence Service</h3>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Feed candidate scoring, resume skill extraction, and job compatibility calculation powered by FastAPI algorithms.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 text-center text-xs text-muted-foreground bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">ConnectSphere</span>
            <span>— The Professional Networking Platform for Shri Vile Parle Kelavani Mandal (SVKM).</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-primary font-medium">100% Free Academic Project</span>
            <span>•</span>
            <span>Security & Privacy</span>
            <span>•</span>
            <span>SVKM Ecosystem</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
