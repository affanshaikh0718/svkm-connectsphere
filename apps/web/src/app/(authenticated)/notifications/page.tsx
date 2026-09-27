'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { notificationsService } from '@/services/notifications.service';
import { useNotificationStore } from '@/stores/notification.store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTimeAgo } from '@/lib/utils';
import { Bell, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4">
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="py-4 border-b border-border/40 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Notifications
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-xs text-muted-foreground hover:text-primary gap-1"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
          </Button>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border/40">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-xs text-muted-foreground">
              No notifications at this time
            </div>
          ) : (
            notifications.map((n) => (
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
                  <span className="text-[10px] text-muted-foreground block">
                    {formatTimeAgo(n.createdAt)}
                  </span>
                </div>
                {!n.isRead && (
                  <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
