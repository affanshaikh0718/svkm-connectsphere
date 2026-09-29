'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Sparkles, UserCheck } from 'lucide-react';
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

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (idVal: string, passVal: string) => {
    if (!idVal || !passVal || isLoading) return;

    try {
      setIsLoading(true);
      const res = await authService.login({ identifier: idVal, password: passVal });
      if (res?.user && res?.accessToken) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        toast.success(`Welcome back, ${res.user.firstName}!`);
        router.push('/home');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Invalid credentials. Please try again.');
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
        <div className="text-center space-y-1">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-2">
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
          <h2 className="text-2xl font-bold tracking-tight">Sign in</h2>
          <p className="text-xs text-muted-foreground">Sign in to your SVKM Professional Network</p>
        </div>

        {/* 1-Click Quick Demo Login */}
        <Card className="border-primary/20 bg-primary/5 shadow-none">
          <CardHeader className="py-3 px-4 pb-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-primary">
              <Sparkles className="h-3.5 w-3.5" /> 1-Click Quick Demo Logins
            </CardTitle>
            <CardDescription className="text-[11px]">
              Click any role to log in immediately with pre-configured SVKM test accounts:
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
                  <span className={`text-[9px] px-1 py-0.2 rounded border font-medium ${demo.color}`}>
                    {demo.badge}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground truncate">{demo.college}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Regular Login Form */}
        <Card className="border-border/60 shadow-sm">
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="identifier">Email or Username</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="name@example.com or username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <span className="text-[11px] text-primary hover:underline cursor-pointer">
                    Forgot password?
                  </span>
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
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
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
