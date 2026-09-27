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

  useEffect(() => {
    if (initialRole && ['STUDENT', 'ALUMNI', 'FACULTY', 'RECRUITER'].includes(initialRole.toUpperCase())) {
      setRoleType(initialRole.toUpperCase());
    }
    if (initialCollege) {
      const match = SVKM_INSTITUTIONS.find((inst) =>
        inst.toLowerCase().includes(initialCollege.toLowerCase())
      );
      if (match) setInstitution(match);
    }
  }, [initialRole, initialCollege]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !username || !email || !password || isLoading) return;

    try {
      setIsLoading(true);
      const res = await authService.register({
        firstName,
        lastName,
        username,
        email,
        password,
        institution,
        roleType,
      });

      if (res?.user && res?.accessToken) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        toast.success(`Welcome to ConnectSphere SVKM, ${res.user.firstName}!`);
        router.push('/home');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-1">
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
        <h2 className="text-2xl font-bold tracking-tight">Join the SVKM Professional Network</h2>
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <GraduationCap className="h-3.5 w-3.5 text-primary" />
          100% Free for SVKM Students, Alumni, Faculty & Recruiters
        </p>
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
              <Label htmlFor="email">SVKM or Personal Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="rohan.mehta@svkm.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
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
