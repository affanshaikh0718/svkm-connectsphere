'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Briefcase,
  Building2,
  Eye,
  EyeOff,
  GraduationCap,
  Shield,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = [
  {
    role: 'Student',
    name: 'Rohan Mehta',
    college: 'MPSTME (B.Tech)',
    identifier: 'rohanmehta',
    password: 'Password@123',
    badge: 'Student',
    color: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900',
  },
  {
    role: 'Alumna',
    name: 'Ananya Deshmukh',
    college: 'DJSCE Alumna @ Microsoft',
    identifier: 'ananyadeshmukh',
    password: 'Password@123',
    badge: 'Alumni',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900',
  },
  {
    role: 'Recruiter',
    name: 'Vikram Shah',
    college: 'Campus Lead @ TCS',
    identifier: 'vikramshah',
    password: 'Password@123',
    badge: 'Recruiter',
    color: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-900',
  },
  {
    role: 'Admin',
    name: 'SVKM Administrator',
    college: 'Placement Cell Lead',
    identifier: 'admin@svkm.ac.in',
    password: 'Admin@123',
    badge: 'Admin',
    color: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900',
  },
];

const ROLE_CUSTOMIZATIONS: Record<
  string,
  { title: string; subtitle: string; icon: any; placeholder: string; badge: string }
> = {
  alumni: {
    title: 'SVKM Alumni Portal',
    subtitle: 'Reconnect with classmates, mentor students & access global alumni networks',
    icon: GraduationCap,
    placeholder: 'alumni.name@svkm.ac.in or username',
    badge: 'Alumni Gateway',
  },
  faculty: {
    title: 'Faculty & Academic Staff Gateway',
    subtitle: 'Access departmental research, curriculum discussions & student interactions',
    icon: BookOpen,
    placeholder: 'faculty.name@svkm.ac.in',
    badge: 'Faculty Portal',
  },
  student: {
    title: 'Student Connect Hub',
    subtitle: 'Access peer networks, study circles, internships & campus opportunities',
    icon: GraduationCap,
    placeholder: 'student.sapid@svkm.ac.in',
    badge: 'Student Hub',
  },
  recruiter: {
    title: 'SVKM Employer & Talent Portal',
    subtitle: 'Hire top engineering, business & pharmacy graduates from SVKM institutes',
    icon: Briefcase,
    placeholder: 'recruiter@company.com',
    badge: 'Placement & Recruiting',
  },
  admin: {
    title: 'SVKM Institute Administration',
    subtitle: 'Institute governance, placement management & campus moderation',
    icon: Shield,
    placeholder: 'admin@svkm.ac.in',
    badge: 'Admin Console',
  },
};

const COLLEGE_CUSTOMIZATIONS: Record<string, { label: string; badge: string }> = {
  engineering: { label: 'MPSTME & DJSCE Engineering Division', badge: 'Engineering & Tech' },
  mpstme: { label: 'Mukesh Patel School of Technology (MPSTME)', badge: 'MPSTME' },
  djsce: { label: 'Dwarkadas J. Sanghvi College of Engineering (DJSCE)', badge: 'DJSCE' },
  management: { label: 'NMIMS School of Business Management', badge: 'Management' },
  pharmacy: { label: 'SPPSPTM School of Pharmacy', badge: 'Pharmacy' },
  law: { label: 'Kirit P. Mehta School of Law', badge: 'Law' },
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setAccessToken } = useAuthStore();

  const roleParam = searchParams.get('role')?.toLowerCase();
  const collegeParam = searchParams.get('college')?.toLowerCase();
  const isDevMode =
    process.env.NEXT_PUBLIC_ENABLE_DEMO_ACCOUNTS === 'true' ||
    searchParams.get('dev') === 'true' ||
    searchParams.get('demo') === 'true';

  const roleConfig = roleParam ? ROLE_CUSTOMIZATIONS[roleParam] : null;
  const collegeConfig = collegeParam ? COLLEGE_CUSTOMIZATIONS[collegeParam] : null;

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogin = async (idVal: string, passVal: string) => {
    if (!idVal || !passVal || isLoading) return;

    try {
      setIsLoading(true);
      const res = await authService.login({ identifier: idVal, password: passVal });
      if (res?.user && res?.accessToken) {
        setUser(res.user);
        setAccessToken(res.accessToken);

        // Set frontend auth cookies for Next.js middleware
        const maxAge = 7 * 24 * 60 * 60;
        document.cookie = `cs_auth=true; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `refreshToken=${res.refreshToken || res.accessToken || 'active'}; path=/; max-age=${maxAge}; SameSite=Lax`;

        toast.success(`Welcome back, ${res.user.firstName}!`);

        const fromParam = searchParams.get('from');
        const target =
          fromParam && fromParam.startsWith('/') && !fromParam.startsWith('/login')
            ? fromParam
            : '/home';

        window.location.href = target;
        return;
      }
    } catch (err: any) {
      console.error('[ConnectSphere Auth Error] Login failed:', {
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        errorData: err?.response?.data,
        message: err?.message,
      });
      const errorMsg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        (err?.message === 'Network Error'
          ? 'Network Error: Backend API server unreachable. Check NEXT_PUBLIC_API_URL or CORS.'
          : 'Invalid credentials. Please try again.');
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(identifier, password);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Branding & Dynamic Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-1">
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

          {/* Dynamic Role / College Banner */}
          {(roleConfig || collegeConfig) && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
              {roleConfig?.icon && <roleConfig.icon className="h-3.5 w-3.5" />}
              <span>{roleConfig?.badge || collegeConfig?.badge}</span>
              {collegeConfig && roleConfig && (
                <>
                  <span className="opacity-40">•</span>
                  <span>{collegeConfig.badge}</span>
                </>
              )}
            </div>
          )}

          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {roleConfig?.title || collegeConfig?.label || 'Sign in'}
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {roleConfig?.subtitle ||
              (collegeConfig
                ? `Authorized access for ${collegeConfig.label}`
                : 'Sign in to your SVKM Professional Network')}
          </p>
        </div>

        {/* Active Session Indicator */}
        {currentUser && (
          <div className="p-3 bg-secondary/80 rounded-xl border border-border/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <UserCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="truncate">
                Signed in as{' '}
                <strong className="text-foreground">
                  {currentUser.firstName} {currentUser.lastName}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-2">
              <Link href="/home" className="text-primary font-semibold hover:underline">
                Go to Feed →
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="text-muted-foreground hover:text-destructive text-[11px]"
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        {/* Demo Accounts (Hidden in production; visible only with NEXT_PUBLIC_ENABLE_DEMO_ACCOUNTS=true or ?dev=true / ?demo=true) */}
        {isDevMode && (
          <Card className="border-primary/30 bg-primary/5 shadow-none">
            <CardHeader className="py-3 px-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> 1-Click Quick Demo Logins
                </CardTitle>
                <Badge variant="outline" className="text-[9px] px-1 py-0 text-primary border-primary/30">
                  DEV MODE
                </Badge>
              </div>
              <CardDescription className="text-[11px]">
                Pre-configured SVKM test accounts (visible in dev mode):
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-3 pt-0 grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((demo) => (
                <button
                  key={demo.identifier}
                  type="button"
                  onClick={() => {
                    setIdentifier(demo.identifier);
                    setPassword(demo.password);
                    handleLogin(demo.identifier, demo.password);
                  }}
                  disabled={isLoading}
                  className="flex flex-col text-left p-2.5 rounded-lg border bg-background/80 hover:bg-background hover:border-primary/50 transition-all text-xs group"
                >
                  <div className="flex items-center justify-between w-full mb-0.5">
                    <span className="font-semibold truncate text-[11px] group-hover:text-primary">
                      {demo.name}
                    </span>
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded border font-medium ${demo.color}`}
                    >
                      {demo.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate">{demo.college}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Regular Login Form */}
        <Card className="border-border/60 shadow-sm">
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="identifier">
                  {roleConfig ? `${roleConfig.badge} Email or Username` : 'Email or Username'}
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder={roleConfig?.placeholder || 'name@svkm.ac.in or username'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-[11px] text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>

              <div className="text-center text-xs text-muted-foreground pt-1">
                New to ConnectSphere?{' '}
                <Link href="/register" className="font-semibold text-primary hover:underline">
                  Join now
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-xs text-muted-foreground">
          Loading login portal...
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}

