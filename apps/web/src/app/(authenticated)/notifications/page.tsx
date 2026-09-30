'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { notificationsService } from '@/services/notifications.service';
import { useNotificationStore } from '@/stores/notification.store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatTimeAgo } from '@/lib/utils';
import {
  Award,
  Bell,
  BellOff,
  CheckCheck,
  Heart,
  MessageSquare,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { RecommendationsInboxWidget } from '@/components/recommendations/recommendations-inbox-widget';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'recommendations'>('all');
  const { unreadCount, setUnreadCount } = useNotificationStore();

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await notificationsService.getMyNotifications();
      const list = res?.data || (Array.isArray(res) ? res : []);
      setNotifications(list);

      // Auto-sync: Reset unread notifications on opening alerts panel
      if (list.some((n: any) => !n.isRead) || unreadCount > 0) {
        notificationsService.markAllAsRead().catch(() => null);
        setUnreadCount(0);
      }
    } catch {
      // error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to update notifications');
    }
  };

  const handleNotificationClick = async (n: any) => {
    if (!n.isRead) {
      try {
        await notificationsService.markAsRead(n.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
        );
        setUnreadCount(Math.max(0, unreadCount - 1));
      } catch {
        // ignore
      }
    }

    const isRec =
      n.type?.includes('RECOMMENDATION') ||
      n.message?.toLowerCase().includes('recommendation');

    if (isRec) {
      setActiveTab('recommendations');
      return;
    }

    if (n.type?.includes('MESSAGE')) {
      router.push('/messages');
      return;
    }

    if (n.type?.includes('CONNECTION')) {
      router.push('/network');
      return;
    }

    if (n.actor?.username) {
      router.push(`/in/${n.actor.username}`);
    }
  };

  const unreadNotifs = notifications.filter((n) => !n.isRead);
  const recommendationNotifs = notifications.filter(
    (n) =>
      n.type?.includes('RECOMMENDATION') ||
      n.message?.toLowerCase().includes('recommendation')
  );

  const displayedNotifications =
    activeTab === 'unread'
      ? unreadNotifs
      : notifications;

  const getNotificationIcon = (type = '', message = '') => {
    const combined = `${type} ${message}`.toUpperCase();
    if (combined.includes('LIKE')) return <Heart className="h-3 w-3 fill-red-500 text-red-500" />;
    if (combined.includes('COMMENT')) return <MessageSquare className="h-3 w-3 text-blue-500" />;
    if (combined.includes('CONNECTION') || combined.includes('CONNECT'))
      return <UserPlus className="h-3 w-3 text-emerald-500" />;
    if (combined.includes('RECOMMENDATION')) return <Award className="h-3 w-3 text-amber-500" />;
    return <Sparkles className="h-3 w-3 text-primary" />;
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4 space-y-4">
      <Card className="border-border/50 shadow-sm overflow-hidden bg-card">
        <CardHeader className="py-4 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Activity & Alerts</CardTitle>
              <p className="text-[11px] text-muted-foreground">
                Stay updated with SVKM connections, discussions, and endorsements
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs text-muted-foreground hover:text-primary gap-1.5 h-8 font-medium"
            >
              <CheckCheck className="h-3.5 w-3.5 text-primary" /> Mark all as read
            </Button>
          </div>
        </CardHeader>

        {/* Filter Tabs */}
        <div className="px-4 pt-3 border-b border-border/30 bg-secondary/10">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 max-w-md h-8 p-0.5 bg-secondary/50 border border-border/50">
              <TabsTrigger value="all" className="text-xs font-medium gap-1.5">
                All
                {notifications.length > 0 && (
                  <Badge variant="secondary" className="text-[9px] h-3.5 px-1 rounded-full">
                    {notifications.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs font-medium gap-1.5">
                Unread
                {unreadNotifs.length > 0 && (
                  <Badge className="text-[9px] h-3.5 px-1 rounded-full bg-primary text-primary-foreground">
                    {unreadNotifs.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="recommendations"
                className="text-xs font-medium gap-1.5 text-primary"
              >
                <Award className="h-3.5 w-3.5" />
                Recommendations
                {recommendationNotifs.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-[9px] h-3.5 px-1 rounded-full bg-primary/10 text-primary"
                  >
                    {recommendationNotifs.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="p-0 pt-3 m-0 divide-y divide-border/40">
              {displayedNotifications.length === 0 ? (
                <div className="text-center py-16 px-4 space-y-2">
                  <BellOff className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                  <h4 className="text-sm font-semibold text-foreground">No alerts yet</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    When colleagues interact with your posts or send connection invites, you will see them here.
                  </p>
                </div>
              ) : (
                displayedNotifications.map((n) => {
                  const isRec =
                    n.type?.includes('RECOMMENDATION') ||
                    n.message?.toLowerCase().includes('recommendation');

                  return (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-4 flex items-start gap-3.5 transition-colors cursor-pointer ${
                        !n.isRead
                          ? 'bg-primary/5 hover:bg-primary/10'
                          : 'hover:bg-secondary/20'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage src={n.actor?.profile?.profilePictureUrl} />
                          <AvatarFallback className="text-xs font-semibold text-primary bg-primary/10">
                            {n.actor?.firstName?.[0] || 'S'}
                            {n.actor?.lastName?.[0] || 'K'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-background border shadow-xs">
                          {getNotificationIcon(n.type, n.message)}
                        </span>
                      </div>

                      <div className="flex-1 space-y-1 min-w-0">
                        <p className="text-xs text-foreground/90 leading-snug">
                          <span className="font-semibold text-foreground">
                            {n.actor ? `${n.actor.firstName} ${n.actor.lastName} ` : ''}
                          </span>
                          {n.message}
                        </p>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            {formatTimeAgo(n.createdAt)}
                          </span>
                          {isRec && (
                            <Badge
                              variant="outline"
                              className="text-[9px] text-primary border-primary/30"
                            >
                              Recommendations Inbox →
                            </Badge>
                          )}
                        </div>
                      </div>

                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                      )}
                    </div>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="unread" className="p-0 pt-3 m-0 divide-y divide-border/40">
              {unreadNotifs.length === 0 ? (
                <div className="text-center py-16 px-4 space-y-2">
                  <CheckCheck className="h-8 w-8 text-primary/40 mx-auto" />
                  <h4 className="text-sm font-semibold text-foreground">All caught up!</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    You have no unread notifications at the moment.
                  </p>
                </div>
              ) : (
                unreadNotifs.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className="p-4 flex items-start gap-3.5 transition-colors cursor-pointer bg-primary/5 hover:bg-primary/10"
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={n.actor?.profile?.profilePictureUrl} />
                        <AvatarFallback className="text-xs font-semibold text-primary bg-primary/10">
                          {n.actor?.firstName?.[0] || 'S'}
                          {n.actor?.lastName?.[0] || 'K'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-background border shadow-xs">
                        {getNotificationIcon(n.type, n.message)}
                      </span>
                    </div>

                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-xs text-foreground/90 leading-snug">
                        <span className="font-semibold text-foreground">
                          {n.actor ? `${n.actor.firstName} ${n.actor.lastName} ` : ''}
                        </span>
                        {n.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground block pt-0.5">
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>

                    <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="recommendations" className="p-0 m-0">
              <RecommendationsInboxWidget onRefreshParent={fetchNotifications} />
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}


