'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notificationsService } from '@/services/notifications.service';
import { useNotificationStore } from '@/stores/notification.store';
import { useSocket } from './use-socket';
import type { Notification } from '@/types';

export function useNotifications() {
  const { socket } = useSocket();
  const { setUnreadCount, addNotification, notifications, unreadCount } = useNotificationStore();

  // Fetch initial unread count
  const { data: unreadCountData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsService.getUnreadCount(),
    refetchInterval: 1000 * 30, // Poll every 30 seconds as fallback
  });

  useEffect(() => {
    if (unreadCountData !== undefined) {
      setUnreadCount(unreadCountData);
    }
  }, [unreadCountData, setUnreadCount]);

  // Real-time notifications via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      addNotification(notification);
    };

    socket.on('notification', handleNewNotification);

    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, [socket, addNotification]);

  return { notifications, unreadCount };
}
