'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { connectionsService } from '@/services/connections.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, MapPin, MessageSquare, UserCheck, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileHeaderProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    connectionStatus?: string;
    isFollowing?: boolean;
    profile?: {
      headline?: string;
      bio?: string;
      location?: string;
      website?: string;
      profilePictureUrl?: string;
      coverImageUrl?: string;
      isOpenToWork?: boolean;
    };
  };
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const currentUser = useAuthStore((s) => s.user);
  const isMe = currentUser?.id === user.id;

  const [connectionStatus, setConnectionStatus] = useState(user.connectionStatus || 'NONE');
  const [isFollowing, setIsFollowing] = useState(!!user.isFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      await connectionsService.sendConnectionRequest(user.id);
      setConnectionStatus('PENDING');
      toast.success('Connection request sent!');
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Failed to send request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await connectionsService.unfollowUser(user.id);
        setIsFollowing(false);
        toast.success(`Unfollowed @${user.username}`);
      } else {
        await connectionsService.followUser(user.id);
        setIsFollowing(true);
        toast.success(`Following @${user.username}`);
      }
    } catch {
      toast.error('Action failed');
    }
  };

  return (
    <Card className="mb-6 overflow-hidden border-border/50 shadow-sm">
      {/* Cover Banner */}
      <div className="h-36 sm:h-44 w-full bg-gradient-to-r from-primary/30 via-primary/10 to-secondary relative">
        {user.profile?.coverImageUrl && (
          <img
            src={user.profile.coverImageUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <CardContent className="pt-0 relative px-6 pb-6">
        {/* Avatar */}
        <div className="flex justify-between items-end -mt-16 sm:-mt-20 mb-4">
          <Avatar className="h-28 w-28 sm:h-36 sm:w-36 border-4 border-background shadow-md">
            <AvatarImage src={user.profile?.profilePictureUrl} />
            <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-primary/10 text-primary">
              {user.firstName[0]}
              {user.lastName[0]}
            </AvatarFallback>
          </Avatar>

          {!isMe && (
            <div className="flex gap-2">
              <Button
                variant={isFollowing ? 'outline' : 'secondary'}
                size="sm"
                onClick={handleFollowToggle}
                className="text-xs font-medium"
              >
                {isFollowing ? 'Following' : '+ Follow'}
              </Button>

              {connectionStatus === 'ACCEPTED' ? (
                <Button size="sm" variant="outline" className="text-xs gap-1.5 text-emerald-600">
                  <UserCheck className="h-4 w-4" /> Connected
                </Button>
              ) : connectionStatus === 'PENDING' ? (
                <Button size="sm" variant="secondary" disabled className="text-xs gap-1.5">
                  <Check className="h-3.5 w-3.5" /> Request Sent
                </Button>
              ) : (
                <Button size="sm" onClick={handleConnect} disabled={isLoading} className="text-xs gap-1.5 font-semibold">
                  <UserPlus className="h-3.5 w-3.5" /> Connect
                </Button>
              )}
            </div>
          )}
        </div>

        {/* User Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {user.firstName} {user.lastName}
            </h1>
            <span className="text-sm text-muted-foreground font-normal">
              @{user.username}
            </span>
            {user.profile?.isOpenToWork && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[11px]">
                #OpenToWork
              </Badge>
            )}
          </div>

          {user.profile?.headline && (
            <p className="text-sm sm:text-base text-foreground/90 font-medium max-w-2xl leading-snug">
              {user.profile.headline}
            </p>
          )}

          {user.profile?.location && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {user.profile.location}
            </p>
          )}

          {user.profile?.bio && (
            <div className="pt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line border-t border-border/40 mt-4">
              <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">About</p>
              {user.profile.bio}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
