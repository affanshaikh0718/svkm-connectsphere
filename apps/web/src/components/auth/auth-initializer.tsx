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
        document.cookie = 'cs_auth=true; path=/; max-age=604800; SameSite=Lax';
      } catch (err: any) {
        // Only log out if the backend explicitly reports unauthorized 401
        if (err?.response?.status === 401) {
          logout();
          document.cookie = 'cs_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
      }
    };

    validateSession();
  }, []); // Run once on mount

  return null;
}
