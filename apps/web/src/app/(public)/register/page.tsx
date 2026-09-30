'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

const SVKM_INSTITUTIONS = [
  'Mukesh Patel School of Technology Management & Engineering (MPSTME)',
  'Dwarkadas J. Sanghvi College of Engineering (DJSCE)',
  'Narsee Monjee Institute of Management Studies (NMIMS)',
  'Mithibai College of Arts, Science & Commerce',
  'Narsee Monjee College of Commerce & Economics (NM College)',
  'Pravin Gandhi College of Law (PGCL)',
  'Jitendra Chauhan College of Law (JCCL)',
  'Usha Pravin Gandhi College of Management (UPG)',
  'Dr. Bhanuben Nanavati College of Pharmacy (BNCP)',
  'Shri Bhagubhai Mafatlal Polytechnic (SBMP)',
  'Other SVKM Institution / Industry Recruiter',
];

const ROLE_CONFIGS: Record<string, { title: string; subtitle: string; badge: string; benefits: string[] }> = {
  STUDENT: {
    title: 'Join SVKM as a Student',
    subtitle: 'Connect with alumni mentors, discover campus placements, and showcase projects across MPSTME, DJSCE, NMIMS & Mithibai.',
    badge: 'Student Community',
    benefits: ['Campus Placements & Internships', 'Alumni Mentorship Network', 'Verified Skill Endorsements'],
  },
  ALUMNI: {
    title: 'Welcome Back, SVKM Alum',
    subtitle: 'Give back to your alma mater, mentor junior students, hire fresh SVKM talent, and network with fellow alumni.',
    badge: 'Alumni Network',
    benefits: ['Hire Top SVKM Graduates', 'Exclusive SVKM Alumni Directory', 'Mentor Current Students'],
  },
  FACULTY: {
    title: 'SVKM Faculty & Staff Onboarding',
    subtitle: 'Coordinate departmental projects, publish academic announcements, and guide student career development.',
    badge: 'Faculty Portal',
    benefits: ['Campus & Department Updates', 'Placement Cell Coordination', 'Academic Research Groups'],
  },
  RECRUITER: {
    title: 'Hire SVKM Talent Directly',
    subtitle: 'Post jobs, review verified student profiles from top SVKM engineering and management institutions, and hire faster.',
    badge: 'Recruiter Portal',
    benefits: ['50,000+ Verified SVKM Students', 'Instant Placement Filtering', 'Direct Messaging with Candidates'],
  },
};

import { isSvkmEmail, getSvkmDomainError, SVKM_ALLOWED_DOMAINS } from '@/lib/svkm-domains';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setAccessToken } = useAuthStore();

  const initialRole = searchParams.get('role');
  const initialCollege = searchParams.get('college');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState(SVKM_INSTITUTIONS[0]);
  const [roleType, setRoleType] = useState('STUDENT');
  const [isLoading, setIsLoading] = useState(false);

  const emailTrimmed = email.trim();
  const isEmailValidSvkm = emailTrimmed.length > 0 && isSvkmEmail(emailTrimmed);

  useEffect(() => {
    if (initialRole) {
      const normalized = initialRole.toUpperCase();
      if (['STUDENT', 'ALUMNI', 'FACULTY', 'RECRUITER'].includes(normalized)) {
        setRoleType(normalized);
      }
    }
    if (initialCollege) {
      const match = SVKM_INSTITUTIONS.find((inst) =>
        inst.toLowerCase().includes(initialCollege.toLowerCase())
      );
      if (match) setInstitution(match);
    }
  }, [initialRole, initialCollege]);

  const activeConfig = ROLE_CONFIGS[roleType] || ROLE_CONFIGS.STUDENT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !username || !email || !password || isLoading) return;

    if (!isSvkmEmail(email)) {
      toast.error(getSvkmDomainError());
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        institution,
        roleType,
      });

      if (res?.user && res?.accessToken) {
        setUser(res.user);
        setAccessToken(res.accessToken);

        const maxAge = 7 * 24 * 60 * 60;
        document.cookie = `cs_auth=true; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `refreshToken=${res.refreshToken || res.accessToken || 'active'}; path=/; max-age=${maxAge}; SameSite=Lax`;

        toast.success(`Welcome to ConnectSphere SVKM, ${res.user.firstName}!`);
        window.location.href = '/home';
        return;
      }
    } catch (err: any) {
      console.error('[ConnectSphere Auth Error] Registration failed:', {
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        errorData: err?.response?.data,
        message: err?.message,
      });
      const errorMsg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        (err?.message === 'Network Error'
          ? 'Network Error: Backend API unreachable. Check NEXT_PUBLIC_API_URL or CORS.'
          : 'Registration failed. Please check inputs.');
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-1.5">
        <Link href="/" className="inline-flex items-center gap-2 mb-2">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-base shadow-sm">
            CS
          </div>
          <span className="font-extrabold text-xl tracking-tight text-foreground flex items-center gap-1.5">
            ConnectSphere
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              SVKM
            </span>
          </span>
        </Link>
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold mb-1">
          {activeConfig.badge}
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{activeConfig.title}</h2>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          {activeConfig.subtitle}
        </p>

        {/* Dynamic Role Benefits */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          {activeConfig.benefits.map((benefit) => (
            <span
              key={benefit}
              className="text-[10px] font-medium bg-secondary/80 text-secondary-foreground px-2 py-0.5 rounded border border-border/40"
            >
              ✓ {benefit}
            </span>
          ))}
        </div>
      </div>

      <Card className="border-border/60 shadow-sm">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3.5 pt-6 text-xs">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  placeholder="Rohan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  placeholder="Mehta"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="rohanmehta"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="email">Official SVKM Institutional Email</Label>
                {emailTrimmed && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                      isEmailValidSvkm
                        ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30'
                        : 'text-amber-600 bg-amber-500/10 border-amber-500/30'
                    }`}
                  >
                    {isEmailValidSvkm ? '✓ Verified SVKM Domain' : 'SVKM Domain Required'}
                  </span>
                )}
              </div>
              <Input
                id="email"
                type="email"
                placeholder="rohan.mehta@djsce.ac.in or @nmims.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={
                  emailTrimmed && !isEmailValidSvkm
                    ? 'border-amber-500/50 focus-visible:ring-amber-500'
                    : ''
                }
              />
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="text-[10px] text-muted-foreground mr-1">Allowed:</span>
                {['@djsce.ac.in', '@nmims.edu', '@mpstme.nmims.edu', '@mithibai.ac.in', '@nmcollege.in', '@svkm.ac.in'].map((dom) => (
                  <button
                    key={dom}
                    type="button"
                    onClick={() => {
                      const prefix = email.includes('@') ? email.split('@')[0] : email;
                      setEmail(`${prefix || 'user'}${dom}`);
                    }}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors border border-border/40"
                  >
                    {dom}
                  </button>
                ))}
              </div>
            </div>

            {/* SVKM College Selection */}
            <div className="space-y-1.5">
              <Label htmlFor="institution">SVKM Institution / College</Label>
              <select
                id="institution"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              >
                {SVKM_INSTITUTIONS.map((inst) => (
                  <option key={inst} value={inst}>
                    {inst}
                  </option>
                ))}
              </select>
            </div>

            {/* Role / Persona */}
            <div className="space-y-1.5">
              <Label htmlFor="roleType">I am a</Label>
              <select
                id="roleType"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={roleType}
                onChange={(e) => setRoleType(e.target.value)}
              >
                <option value="STUDENT">SVKM Student</option>
                <option value="ALUMNI">SVKM Alumnus / Alumna</option>
                <option value="FACULTY">SVKM Faculty / Staff Member</option>
                <option value="RECRUITER">Campus Recruiter / Placement Partner</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password (8+ characters)</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
              {isLoading ? 'Creating SVKM account...' : 'Agree & Join SVKM Network'}
            </Button>

            <div className="text-center text-xs text-muted-foreground pt-1">
              Already registered?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
      <Suspense fallback={<div className="text-xs text-muted-foreground">Loading registration...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
