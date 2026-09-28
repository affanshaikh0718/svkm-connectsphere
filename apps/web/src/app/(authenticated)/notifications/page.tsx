'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { notificationsService } from '@/services/notifications.service';
import { useNotificationStore } from '@/stores/notification.store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatTimeAgo } from '@/lib/utils';
import { Award, Bell, CheckCheck, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { RecommendationsInboxWidget } from '@/components/recommendations/recommendations-inbox-widget';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'recommendations'>('all');
  const { setUnreadCount } = useNotificationStore();

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await notificationsService.getMyNotifications();
      if (res.data) {
        setNotifications(res.data);
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

  const recommendationNotifs = notifications.filter(
    (n) =>
      n.type?.includes('RECOMMENDATION') ||
      n.message?.toLowerCase().includes('recommendation')
  );

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4 space-y-4">
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="py-4 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-bold">Activity & Inbox</CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs text-muted-foreground hover:text-primary gap-1 h-8"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
            </Button>
          </div>
        </CardHeader>

        {/* Tabs for Feed vs Recommendations Inbox */}
        <div className="px-4 pt-3 border-b border-border/30 bg-secondary/10">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 max-w-xs h-8 p-0.5 bg-secondary/50 border border-border/50">
              <TabsTrigger value="all" className="text-xs font-medium gap-1.5">
                All Notifications
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
              {notifications.length === 0 ? (
                <div className="text-center py-16 text-xs text-muted-foreground">
                  No notifications at this time
                </div>
              ) : (
                notifications.map((n) => {
                  const isRec =
                    n.type?.includes('RECOMMENDATION') ||
                    n.message?.toLowerCase().includes('recommendation');

                  return (
                    <div
                      key={n.id}
                      className={`p-4 flex items-start gap-3 transition-colors ${
                        !n.isRead ? 'bg-primary/5' : 'hover:bg-secondary/20'
                      }`}
                    >
                      <Avatar className="h-10 w-10 mt-0.5 border">
                        <AvatarImage src={n.actor?.profile?.profilePictureUrl} />
                        <AvatarFallback className="text-xs font-semibold text-primary">
                          {n.actor?.firstName?.[0] || 'C'}
                          {n.actor?.lastName?.[0] || 'S'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
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
                              onClick={() => setActiveTab('recommendations')}
                              className="text-[9px] text-primary border-primary/30 cursor-pointer hover:bg-primary/10"
                            >
                              View in Recommendations Inbox →
                            </Badge>
                          )}
                        </div>
                      </div>
                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      )}
                    </div>
                  );
                })
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

