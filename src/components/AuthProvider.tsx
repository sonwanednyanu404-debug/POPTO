'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setToken, setLoading } = useAuthStore();

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('popto_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setToken(token);
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('popto_token');
          setToken(null);
        }
      } catch {
        localStorage.removeItem('popto_token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [setUser, setToken, setLoading]);

  return <>{children}</>;
}
