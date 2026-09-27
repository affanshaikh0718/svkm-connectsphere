'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { useSocket } from '@/hooks/use-socket';

export function AuthInitializer() {
  const { setUser, setAccessToken, logout, isAuthenticated, accessToken } = useAuthStore();
  // Initialize socket if authenticated
  useSocket();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Validate the stored session on mount
    const validateSession = async () => {
      try {
        const user = await authService.getMe();
        setUser(user);
      } catch {
        logout();
      }
    };

    validateSession();
  }, []); // Run once on mount

  return null;
}
