'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Users2,
  FileText,
  Calendar,
  Eye,
  Plus,
  MapPin,
  GraduationCap,
  ArrowRight,
  TrendingUp,
  Loader2,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/services/users.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { getInitials, formatNumber } from '@/lib/utils';
import toast from 'react-hot-toast';

export function LeftSidebar() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: summary } = useQuery({
    queryKey: ['profile-summary'],
    queryFn: () => usersService.getProfileSummary(),
    enabled: Boolean(user),
  });

  const { data: completion } = useQuery({
    queryKey: ['profile-completion'],
    queryFn: () => usersService.getProfileCompletion(),
    enabled: Boolean(user),
  });

  if (!user) return null;

  const displayName = `${user.firstName} ${user.lastName}`;
  const initials = getInitials(user.firstName, user.lastName);
  const avatarUrl = user.profile?.profilePictureUrl || summary?.profile?.profilePictureUrl;
  const coverUrl = summary?.profile?.coverImageUrl || user.profile?.coverImageUrl;
  const headline = summary?.profile?.headline || user.profile?.headline || 'SVKM ConnectSphere Member';
  const location = summary?.profile?.location || user.profile?.location || 'Mumbai, Maharashtra, India';
  const institute = summary?.profile?.institution || user.profile?.institution || 'SVKM\'s NMIMS / MPSTME';

  const profileViewers = summary?.analytics?.profileViewers ?? 24;
  const postImpressions = summary?.analytics?.postImpressions ?? 88;
  const connectionCount = summary?.analytics?.connectionCount ?? user.profile?.connectionCount ?? 0;
  const savedCount = summary?.savedCount ?? 0;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const res = await usersService.uploadProfilePicture(file);
      if (res?.profilePictureUrl) {
        updateUser({
          profile: {
            ...user.profile,
            profilePictureUrl: res.profilePictureUrl,
          } as any,
        });
        await queryClient.invalidateQueries({ queryKey: ['profile-summary'] });
        toast.success('Profile picture updated successfully!');
      }
    } catch {
      toast.error('Failed to update profile picture');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-4">
      <Card className="overflow-hidden border-border/60 shadow-sm hover:shadow transition-shadow">
        {/* 1. User Quick Profile Header */}
        <div className="relative h-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
          {coverUrl && (
            <img
              src={coverUrl}
              alt="Profile Cover"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Profile Avatar with '+' Icon Badge for quick updates */}
        <div className="flex justify-center -mt-10 relative z-10">
          <div className="relative group">
            <Avatar className="h-20 w-20 ring-4 ring-card shadow-md transition-transform group-hover:scale-105">
              {avatarUrl && (
                <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
              )}
              <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* '+' Badge Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              title="Update profile picture"
              aria-label="Update profile picture"
              className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-primary text-primary-foreground border-2 border-card flex items-center justify-center shadow-md hover:bg-primary/90 transition-transform active:scale-95 disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
        </div>

        <CardContent className="pt-3 pb-4 px-4">
          {/* User Details */}
          <div className="text-center">
            <Link
              href={`/in/${user.username}`}
              className="font-bold text-base hover:text-primary hover:underline transition-colors block truncate"
            >
              {displayName}
            </Link>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 px-1">
              {headline}
            </p>

            {/* Location */}
            <div className="mt-1 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/70" />
              <span className="truncate max-w-[200px]">{location}</span>
            </div>

            {/* Institute badge/name */}
            <div className="mt-2.5 flex justify-center">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-xs max-w-full truncate">
                <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{institute}</span>
              </span>
            </div>
          </div>

          <Separator className="my-3.5" />

          {/* 2. Analytics Card */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1">
              Analytics
            </div>

            {/* Dynamic Profile viewers count */}
            <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-md hover:bg-accent/60 transition-colors">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <Eye className="h-3.5 w-3.5 text-blue-500" />
                Profile viewers
              </span>
              <span className="font-bold text-primary">
                {formatNumber(profileViewers)}
              </span>
            </div>

            {/* Post impressions */}
            <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-md hover:bg-accent/60 transition-colors">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                Post impressions
              </span>
              <span className="font-bold text-foreground">
                {formatNumber(postImpressions)}
              </span>
            </div>

            {/* Connections */}
            <Link
              href="/network"
              className="flex items-center justify-between text-xs px-2 py-1.5 rounded-md hover:bg-accent/60 transition-colors"
            >
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <Users className="h-3.5 w-3.5 text-indigo-500" />
                Connections
              </span>
              <span className="font-bold text-foreground">
                {formatNumber(connectionCount)}
              </span>
            </Link>

            {/* View all analytics actionable link */}
            <div className="pt-1.5 px-2">
              <Link
                href="/profile/analytics"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline group"
              >
                <span>View all analytics</span>
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <Separator className="my-3.5" />

          {/* 3. Quick Links / Navigation Menu */}
          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1">
              Quick Navigation
            </div>

            {/* Saved items */}
            <Link
              href="/saved-posts"
              className="flex items-center justify-between text-xs font-medium text-foreground hover:text-primary hover:bg-accent rounded-lg px-2 py-2 transition-colors group"
            >
              <span className="flex items-center gap-2.5">
                <Bookmark className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                Saved items
              </span>
              {savedCount > 0 ? (
                <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                  {savedCount}
                </span>
              ) : null}
            </Link>

            {/* Groups */}
            <Link
              href="/network"
              className="flex items-center justify-between text-xs font-medium text-foreground hover:text-primary hover:bg-accent rounded-lg px-2 py-2 transition-colors group"
            >
              <span className="flex items-center gap-2.5">
                <Users2 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                Groups
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                SVKM Clubs
              </span>
            </Link>

            {/* Newsletters */}
            <Link
              href="/newsletters"
              className="flex items-center justify-between text-xs font-medium text-foreground hover:text-primary hover:bg-accent rounded-lg px-2 py-2 transition-colors group"
            >
              <span className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                Newsletters
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                Weekly
              </span>
            </Link>

            {/* Events */}
            <Link
              href="/events"
              className="flex items-center justify-between text-xs font-medium text-foreground hover:text-primary hover:bg-accent rounded-lg px-2 py-2 transition-colors group"
            >
              <span className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                Events
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                Campus
              </span>
            </Link>
          </div>

          {/* Profile Strength Bar */}
          {completion && (
            <>
              <Separator className="my-3.5" />
              <div className="px-1">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground font-medium">Profile strength</span>
                  <span className="font-bold text-primary">{completion.percentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${completion.percentage}%` }}
                  />
                </div>
                {completion.percentage < 100 && completion.missingFields?.length > 0 && (
                  <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
                    Add <span className="font-semibold text-foreground">{completion.missingFields[0]}</span> to reach All-Star
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}

/**
 * Responsive Dropdown / Accordion component for Mobile views on the Home Feed
 */
export function FeedNavigationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();

  const { data: summary } = useQuery({
    queryKey: ['profile-summary'],
    queryFn: () => usersService.getProfileSummary(),
    enabled: Boolean(user),
  });

  if (!user) return null;

  const displayName = `${user.firstName} ${user.lastName}`;
  const initials = getInitials(user.firstName, user.lastName);
  const avatarUrl = user.profile?.profilePictureUrl || summary?.profile?.profilePictureUrl;
  const profileViewers = summary?.analytics?.profileViewers ?? 24;

  return (
    <div className="w-full bg-card border border-border/60 rounded-xl shadow-xs overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-accent/40 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20 shrink-0">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-foreground truncate">{displayName}</h4>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Eye className="h-3 w-3 text-blue-500" />
              <span>{profileViewers} profile viewers</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-primary shrink-0">
          <span>{isOpen ? 'Close' : 'Quick Menu'}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3 pt-0 border-t border-border/40">
          <LeftSidebar />
        </div>
      )}
    </div>
  );
}
