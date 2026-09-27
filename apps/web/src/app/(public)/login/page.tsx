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
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password || isLoading) return;

    try {
      setIsLoading(true);
      const res = await authService.login({ identifier, password });
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

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
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
