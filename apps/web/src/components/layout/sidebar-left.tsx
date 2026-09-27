'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Bookmark, Users, Eye } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/services/users.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { getInitials, formatNumber } from '@/lib/utils';

export function LeftSidebar() {
  const { user } = useAuthStore();

  const { data: completion, isLoading: completionLoading } = useQuery({
    queryKey: ['profile-completion'],
    queryFn: () => usersService.getProfileCompletion(),
    enabled: Boolean(user),
  });

  if (!user) return null;

  const displayName = `${user.firstName} ${user.lastName}`;
  const initials = getInitials(user.firstName, user.lastName);
  const avatarUrl = user.profile?.profilePictureUrl;
  const headline = user.profile?.headline ?? 'Add a headline to your profile';

  return (
    <aside className="w-64 shrink-0">
      <Card className="overflow-hidden">
        {/* Cover */}
        <div className="relative h-16 bg-gradient-to-r from-brand-500 to-brand-700" />

        {/* Avatar */}
        <div className="flex justify-center -mt-8 relative z-10">
          <Avatar className="h-16 w-16 ring-4 ring-background">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="text-lg bg-brand-100 text-brand-700">{initials}</AvatarFallback>
          </Avatar>
        </div>

        <CardContent className="pt-2 pb-4">
          <div className="text-center mb-3">
            <Link
              href={`/in/${user.username}`}
              className="font-semibold text-sm hover:text-primary hover:underline transition-colors"
            >
              {displayName}
            </Link>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{headline}</p>
            <div className="mt-2 flex justify-center">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                🎓 SVKM Verified
              </span>
            </div>
          </div>

          <Separator className="my-3" />

          {/* Stats */}
          <div className="space-y-2">
            <Link
              href="/network"
              className="flex items-center justify-between text-xs hover:bg-accent rounded p-1 transition-colors"
            >
              <span className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                Connections
              </span>
              <span className="font-semibold text-primary">
                {formatNumber(user.profile?.connectionCount ?? 0)}
              </span>
            </Link>

            <div className="flex items-center justify-between text-xs hover:bg-accent rounded p-1 transition-colors cursor-default">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Eye className="h-3.5 w-3.5" />
                Profile views
              </span>
              <span className="font-semibold text-primary">--</span>
            </div>
          </div>

          <Separator className="my-3" />

          {/* Profile Completion */}
          {completionLoading ? (
            <Skeleton className="h-12" />
          ) : completion ? (
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Profile strength</span>
                <span className="font-semibold text-primary">{completion.percentage}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${completion.percentage}%` }}
                />
              </div>
              {completion.percentage < 100 && completion.missingFields.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Add {completion.missingFields[0]} to improve your profile
                </p>
              )}
            </div>
          ) : null}

          <Separator className="my-3" />

          <Link
            href="/saved-posts"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded p-1 transition-colors"
          >
            <Bookmark className="h-3.5 w-3.5" />
            Saved items
          </Link>
        </CardContent>
      </Card>
    </aside>
  );
}
