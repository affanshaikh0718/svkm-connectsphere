'use client';

import { useEffect } from 'react';
import { useSocketStore } from '@/stores/socket.store';
import { useAuthStore } from '@/stores/auth.store';

export function useSocket() {
  const { socket, isConnected, connect, disconnect } = useSocketStore();
  const { accessToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && accessToken && !socket?.connected) {
      connect(accessToken);
    }

    return () => {
      // Don't disconnect on component unmount — keep connection alive
    };
  }, [isAuthenticated, accessToken, connect, socket]);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnect();
    }
  }, [isAuthenticated, disconnect]);

  return { socket, isConnected };
}
