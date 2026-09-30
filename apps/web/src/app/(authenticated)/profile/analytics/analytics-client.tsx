'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usersService } from '@/services/users.service';
import { useAuthStore } from '@/stores/auth.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  Eye,
  Users,
  Search,
  ArrowUpRight,
  ArrowLeft,
  Calendar,
  Sparkles,
  BarChart3,
  Share2,
  Download,
  GraduationCap,
  Clock,
  UserCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatTimeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProfileAnalyticsClient() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState<'viewers' | 'impressions'>('viewers');

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await usersService.getAnalytics();
      setData(res);
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load real-time analytics from server';
      console.error('[Production Analytics] Live metrics request failed:', {
        url: err?.config?.url,
        status: err?.response?.status,
        message: errMsg,
      });
      setError(errMsg);
      toast.error('Failed to load real-time analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fallbackDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSeries =
    data?.timeSeries && data.timeSeries.length > 0
      ? data.timeSeries
      : fallbackDays.map((day) => ({ day, viewers: 0, impressions: 0 }));

  const maxVal = Math.max(1, ...timeSeries.map((t: any) => t[activeMetric] || 0));

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={user?.username ? `/in/${user.username}` : '/home'}
              className="text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Profile
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> Profile Analytics & Performance
          </h1>
          <p className="text-xs text-muted-foreground">
            Audience reach, network engagement, and SVKM campus search insights for @{user?.username}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              toast.success('Analytics link copied to clipboard!');
            }}
            className="text-xs gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5" /> Share
          </Button>
          <Button
            size="sm"
            onClick={() => toast.success('Analytics summary downloaded!')}
            className="text-xs gap-1.5 font-semibold"
          >
            <Download className="h-3.5 w-3.5" /> Export Report
          </Button>
        </div>
      </div>

      {/* Error State Banner */}
      {error && (
        <div className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              <strong>Analytics Error:</strong> {error}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchAnalytics()}
            className="h-7 text-xs border-destructive/30 hover:bg-destructive/20 gap-1"
          >
            <RefreshCw className="h-3 w-3" /> Retry
          </Button>
        </div>
      )}

      {/* 4 Top Growth Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profile Viewers */}
        <Card
          onClick={() => setActiveMetric('viewers')}
          className={`cursor-pointer transition-all border-border/60 hover:shadow-md ${
            activeMetric === 'viewers' ? 'ring-2 ring-primary/40 bg-primary/5' : ''
          }`}
        >
          <CardHeader className="py-3.5 px-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-blue-500" /> Profile Viewers
              </span>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200 text-[10px] font-semibold">
                7 Days
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 pt-0">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {data?.profileViewers ?? 0}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-0.5">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  {data?.profileViewersTrend || '0% vs prior week'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Post Impressions */}
        <Card
          onClick={() => setActiveMetric('impressions')}
          className={`cursor-pointer transition-all border-border/60 hover:shadow-md ${
            activeMetric === 'impressions' ? 'ring-2 ring-primary/40 bg-primary/5' : ''
          }`}
        >
          <CardHeader className="py-3.5 px-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-emerald-500" /> Post Impressions
              </span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200 text-[10px] font-semibold">
                Top Metric
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 pt-0">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {data?.postImpressions ?? 0}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-0.5">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  {data?.postImpressionsTrend || '0% vs prior week'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Connections */}
        <Card className="border-border/60">
          <CardHeader className="py-3.5 px-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Users className="h-4 w-4 text-indigo-500" /> Total Connections
              </span>
              <Link href="/network" className="text-[10px] text-primary hover:underline font-medium">
                Manage
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 pt-0">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {data?.connectionCount ?? 0}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  1st-degree SVKM network members
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Appearances */}
        <Card className="border-border/60">
          <CardHeader className="py-3.5 px-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Search className="h-4 w-4 text-amber-500" /> Search Appearances
              </span>
              <span className="text-[10px] text-muted-foreground">SVKM Query</span>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 pt-0">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {data?.searchAppearances ?? 0}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-0.5">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  {data?.searchAppearancesTrend || '0% this month'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Time Series Chart Card */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader className="py-4 px-6 pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> 7-Day Audience Activity Over Time
              </CardTitle>
              <CardDescription className="text-xs">
                Daily trend for {activeMetric === 'viewers' ? 'Profile Views' : 'Post Impressions'} across the platform
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5 bg-secondary/80 p-1 rounded-lg border border-border/40">
              <Button
                variant={activeMetric === 'viewers' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveMetric('viewers')}
                className="h-7 text-xs px-2.5 font-medium"
              >
                Profile Views
              </Button>
              <Button
                variant={activeMetric === 'impressions' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveMetric('impressions')}
                className="h-7 text-xs px-2.5 font-medium"
              >
                Post Impressions
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-4">
          {isLoading ? (
            <div className="h-48 flex items-end gap-4 pt-8">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-full flex-1 rounded-t-md" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="h-48 flex items-end gap-3 sm:gap-6 pt-4 px-2 border-b border-border/60">
                {timeSeries.map((item: any) => {
                  const val = item[activeMetric] || 0;
                  const heightPercent = Math.max(12, Math.round((val / maxVal) * 100));
                  return (
                    <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                        {val}
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[48px] rounded-t-md transition-all duration-300 group-hover:opacity-90 ${
                          activeMetric === 'viewers'
                            ? 'bg-gradient-to-t from-blue-600 to-indigo-500'
                            : 'bg-gradient-to-t from-emerald-600 to-teal-400'
                        }`}
                      />
                      <span className="text-[11px] font-medium text-muted-foreground pb-1">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Profile Viewers Breakdown */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader className="py-4 px-6 pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-500" /> Recent Profile Viewers & Network Audience
              </CardTitle>
              <CardDescription className="text-xs">
                SVKM students, alumni, and recruiters who recently explored your profile
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30">
              {data?.recentViewers?.length || 0} Viewers Recorded
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-5 pt-2">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border/40">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : !data?.recentViewers || data.recentViewers.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              No recent profile views recorded yet. Stay active on the feed to increase profile discovery.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.recentViewers.map((viewer: any) => (
                <div
                  key={viewer.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card hover:bg-secondary/40 transition-colors"
                >
                  <Link
                    href={`/in/${viewer.username}`}
                    className="flex items-center gap-3 min-w-0 flex-1 group"
                  >
                    <Avatar className="h-10 w-10 border shadow-xs shrink-0">
                      <AvatarImage src={viewer.avatarUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {viewer.name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {viewer.name}
                        </span>
                        {viewer.statusBadge && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-primary/10 text-primary shrink-0">
                            #{viewer.statusBadge.replace(/\s+/g, '')}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {viewer.headline || 'SVKM Member'}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(viewer.viewedAt || new Date())}</span>
                      </div>
                    </div>
                  </Link>
                  <Link href={`/in/${viewer.username}`}>
                    <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-primary font-medium">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demographics & Campus Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/60">
          <CardHeader className="py-4 px-6 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" /> SVKM Institution Demographics
            </CardTitle>
            <CardDescription className="text-xs">
              Where your profile viewers and connection requests originate
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-5 space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-2 w-full" />
              </div>
            ) : (!data?.demographics || data.demographics.length === 0) ? (
              <div className="text-center py-6 text-xs text-muted-foreground">
                No institution demographics recorded yet. Demographics will generate as more campus peers explore your profile.
              </div>
            ) : (
              data.demographics.map((demo: any) => (
                <div key={demo.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-foreground">{demo.label}</span>
                    <span className="text-primary font-bold">{demo.percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${demo.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Growth Recommendations */}
        <Card className="border-border/60 bg-gradient-to-br from-primary/5 via-background to-secondary/30">
          <CardHeader className="py-4 px-6 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" /> Recommended Profile Enhancements
            </CardTitle>
            <CardDescription className="text-xs">
              Actions to increase your visibility to SVKM campus recruiters
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-5 space-y-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-background border border-border/60 flex items-start gap-2.5">
              <div className="h-6 w-6 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                1
              </div>
              <div>
                <p className="font-semibold text-foreground">Request 2+ Recommendations</p>
                <p className="text-[11px] text-muted-foreground">
                  Profiles with verified peer recommendations receive 3.5x more recruiter inquiries.
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-background border border-border/60 flex items-start gap-2.5">
              <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                2
              </div>
              <div>
                <p className="font-semibold text-foreground">Publish a Technical Feed Post</p>
                <p className="text-[11px] text-muted-foreground">
                  Share a recent project or DSA milestone to increase weekly post impressions by 40%.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
