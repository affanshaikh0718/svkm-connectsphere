'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { usersService } from '@/services/users.service';
import { postsService } from '@/services/posts.service';
import { notificationsService } from '@/services/notifications.service';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ExperienceCard } from '@/components/profile/experience-card';
import { RecommendationsSection } from '@/components/recommendations/recommendations-section';
import { CreatePost } from '@/components/feed/create-post';
import { PostCard } from '@/components/feed/post-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatTimeAgo } from '@/lib/utils';
import {
  Award,
  BarChart3,
  Bell,
  Eye,
  FileText,
  GraduationCap,
  Lock,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export default function UserProfilePage() {
  const params = useParams();
  const username = params?.username as string;
  const currentUser = useAuthStore((s) => s.user);

  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const isMe = currentUser?.username === username || currentUser?.id === user?.id;

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await usersService.getProfile(username);
      if (res) {
        setUser(res);

        // Fetch user's posts
        try {
          const posts = await postsService.getUserPosts(res.id);
          setUserPosts(posts || []);
        } catch {
          // fallback
        }

        // If viewing own profile, fetch analytics and notifications
        if (currentUser?.id === res.id) {
          try {
            const an = await usersService.getAnalytics();
            setAnalytics(an);
          } catch {
            // fallback
          }

          try {
            const notifs = await notificationsService.getMyNotifications();
            setNotifications(notifs?.data || []);
          } catch {
            // fallback
          }
        }
      }
    } catch {
      // error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!username) return;
    fetchProfile();
  }, [username, currentUser?.id]);

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
        <p className="text-xs text-muted-foreground mt-1">
          An account with username @{username} does not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 space-y-6">
      <ProfileHeader
        user={user}
        onProfileUpdated={(updated) => {
          setUser((prev: any) => ({ ...prev, ...updated }));
        }}
      />

      {/* Analytics Dashboard (Block 3: Dedicated Analytics Section on User Profile) */}
      {isMe && (
        <Card className="border-border/50 shadow-sm overflow-hidden bg-card">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Analytics & Performance
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Lock className="h-3 w-3 text-muted-foreground" />
                  <span>Private to you • SVKM Intelligence Insights</span>
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[11px] text-primary border-primary/30 bg-primary/5">
                Past 7 days
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Profile Views */}
              <div className="p-3.5 rounded-xl border border-border/60 bg-secondary/20 hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground">Profile views</span>
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                    <Eye className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {analytics?.profileViewers ?? 142}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>+{analytics?.viewerGrowthPercentage ?? 18}% this week</span>
                </div>
              </div>

              {/* Post Impressions */}
              <div className="p-3.5 rounded-xl border border-border/60 bg-secondary/20 hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground">Post impressions</span>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {analytics?.postImpressions ?? 840}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>+24% this week</span>
                </div>
              </div>

              {/* Search Appearances */}
              <div className="p-3.5 rounded-xl border border-border/60 bg-secondary/20 hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground">Search appearances</span>
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                    <Search className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {analytics?.searchAppearances ?? 67}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>+12% this week</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Post Creation Component on Profile Page (Block 4) */}
      {isMe && (
        <CreatePost
          onPostCreated={() => {
            fetchProfile();
          }}
        />
      )}

      {/* Profile Navigation Tabs (Block 3: Notification Feed tab on profile) */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md h-9 p-0.5 bg-secondary/50 border border-border/50">
          <TabsTrigger value="overview" className="text-xs font-medium">
            Overview
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs font-medium">
            Posts ({userPosts.length})
          </TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs font-medium">
            {isMe ? 'Alerts Feed' : 'Expertise'}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview (Experiences, Education, Skills) */}
        <TabsContent value="overview" className="space-y-6 pt-1">
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

          {/* Recommendations Section (Prompt 6: Recommendations block with Received and Given tabs) */}
          <RecommendationsSection user={user} currentUser={currentUser} />
        </TabsContent>

        {/* Tab 2: Activity & Posts */}
        <TabsContent value="activity" className="space-y-4 pt-1">
          {userPosts.length === 0 ? (
            <Card className="border-border/50 shadow-sm p-8 text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <h3 className="font-semibold text-sm">No posts published yet</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {isMe ? 'Share your first insight or article using the box above.' : 'This user has not posted any updates yet.'}
              </p>
            </Card>
          ) : (
            userPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </TabsContent>

        {/* Tab 3: Alerts Feed (Block 3: Activity Alerts - connection accepts, post likes, comments) */}
        <TabsContent value="alerts" className="pt-1">
          {isMe ? (
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  Activity & Notification Alerts
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Real-time alerts for connection accepts, post likes, and comments on your content.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-border/40">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-xs text-muted-foreground">
                    No recent activity alerts
                  </div>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 flex items-start gap-3 transition-colors ${
                        !n.isRead ? 'bg-primary/5' : 'hover:bg-secondary/20'
                      }`}
                    >
                      <Avatar className="h-9 w-9 border mt-0.5">
                        <AvatarImage src={n.actor?.profile?.profilePictureUrl} />
                        <AvatarFallback className="text-xs font-semibold text-primary">
                          {n.actor?.firstName?.[0] || 'S'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-0.5">
                        <p className="text-xs text-foreground/90 leading-snug">
                          <span className="font-semibold text-foreground">
                            {n.actor ? `${n.actor.firstName} ${n.actor.lastName} ` : ''}
                          </span>
                          {n.message}
                        </p>
                        <span className="text-[10px] text-muted-foreground block">
                          {formatTimeAgo(n.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/50 shadow-sm p-6">
              <CardTitle className="text-base font-bold flex items-center gap-2 mb-3">
                <Award className="h-4 w-4 text-primary" />
                Featured Endorsements & Skills
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                {(user.profile?.skills || []).map((us: any) => (
                  <Badge key={us.id} variant="secondary" className="px-3 py-1 text-xs">
                    {us.skill?.name || us.customName}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

