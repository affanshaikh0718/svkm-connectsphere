'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [demoResetToken, setDemoResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isLoading) return;

    try {
      setIsLoading(true);
      const res: any = await authService.forgotPassword(email.trim());
      setIsSubmitted(true);
      if (res?.resetToken) {
        setDemoResetToken(res.resetToken);
      }
      toast.success('Password recovery instructions dispatched!');
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Failed to dispatch password reset request.');
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
          <h2 className="text-2xl font-bold tracking-tight">Recover Password</h2>
          <p className="text-xs text-muted-foreground">
            Enter your registered SVKM email address to receive reset instructions.
          </p>
        </div>

        <Card className="border-border/60 shadow-sm">
          {isSubmitted ? (
            <CardContent className="pt-6 pb-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">Check Your Email</h3>
                <p className="text-xs text-muted-foreground">
                  We sent password reset instructions to <span className="font-medium text-foreground">{email}</span>.
                </p>
              </div>

              {demoResetToken && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 text-left space-y-2 text-xs">
                  <span className="font-semibold text-primary flex items-center gap-1 text-[11px]">
                    <KeyRound className="h-3.5 w-3.5" /> Instant Test Reset Link
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    In development mode, you can immediately reset your password with this link:
                  </p>
                  <Link
                    href={`/reset-password?token=${demoResetToken}`}
                    className="block font-semibold text-primary hover:underline truncate"
                  >
                    Click here to reset password →
                  </Link>
                </div>
              )}

              <div className="pt-2">
                <Link href="/login">
                  <Button variant="outline" className="w-full text-xs font-semibold">
                    Return to sign in
                  </Button>
                </Link>
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-6 text-xs">
                <div className="space-y-1.5">
                  <Label htmlFor="email">SVKM or Personal Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="rohan.mehta@svkm.ac.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 pt-2">
                <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Dispatching Link...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                <div className="text-center text-xs text-muted-foreground pt-1">
                  <Link href="/login" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                    <ArrowLeft className="h-3 w-3" /> Back to sign in
                  </Link>
                </div>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
