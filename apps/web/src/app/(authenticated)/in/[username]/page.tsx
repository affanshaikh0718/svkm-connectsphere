'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { usersService } from '@/services/users.service';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ExperienceCard } from '@/components/profile/experience-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, GraduationCap } from 'lucide-react';

export default function UserProfilePage() {
  const params = useParams();
  const username = params?.username as string;

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const res = await usersService.getProfile(username);
        if (res) {
          setUser(res);
        }
      } catch {
        // error
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-6 px-4 space-y-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-44 w-full rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold">Profile not found</h2>
        <p className="text-xs text-muted-foreground mt-1">An account with username @{username} does not exist.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 space-y-6">
      <ProfileHeader user={user} />

      {/* Experience Section */}
      <ExperienceCard experiences={user.profile?.experiences || []} />

      {/* Education Section */}
      {user.profile?.educations && user.profile.educations.length > 0 && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.profile.educations.map((edu: any) => (
              <div key={edu.id} className="space-y-1">
                <h4 className="font-semibold text-sm text-foreground">{edu.institution}</h4>
                <p className="text-xs text-muted-foreground">
                  {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {edu.startYear} - {edu.endYear || 'Present'}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Skills Section */}
      {user.profile?.skills && user.profile.skills.length > 0 && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Skills & Expertise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.profile.skills.map((us: any) => (
                <div
                  key={us.id}
                  className="px-3 py-1.5 rounded-lg border border-border/60 bg-secondary/30 text-xs font-medium text-foreground flex items-center gap-2"
                >
                  <span>{us.skill?.name || us.customName}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
