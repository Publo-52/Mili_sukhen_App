'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';

import { setAdminLoggedIn } from '@/lib/storage';

export interface UserInfo {
  name: string;
  role: 'mili' | 'sukhen' | 'guest';
  avatar?: string;
}

export interface SessionInfo {
  id: string;
  userName: string;
  userRole: 'mili' | 'sukhen' | 'guest';
  avatar?: string;
  deviceName: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  user: UserInfo | null;
  session: SessionInfo | null;
  isAdmin: boolean;
  isMili: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  user: null,
  session: null,
  isAdmin: false,
  isMili: false,
  loading: true,
  logout: async () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setIsAuthenticated(true);
          setUser(data.user);
          setSession(data.session || null);
          try {
            localStorage.setItem('mili_user', JSON.stringify(data.user));
          } catch {}
          if (
            data.user?.role === 'sukhen' ||
            data.user?.role === 'mili' ||
            data.session?.userRole === 'sukhen' ||
            data.session?.userRole === 'mili'
          ) {
            setAdminLoggedIn(true);
            try {
              localStorage.setItem('mili_admin_authenticated', 'true');
            } catch {}
          }
          return;
        }
      }

      // If server says not authenticated, clear client state completely
      try {
        localStorage.removeItem('mili_user');
        localStorage.removeItem('mili_session_ref');
        localStorage.removeItem('mili_admin_logged_in');
        localStorage.removeItem('mili_admin_authenticated');
      } catch {}

      setAdminLoggedIn(false);
      setIsAuthenticated(false);
      setUser(null);
      setSession(null);
    } catch {
      // On network failure or error, ensure state remains safe
      setIsAuthenticated(false);
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    try {
      localStorage.removeItem('mili_user');
      localStorage.removeItem('mili_session_ref');
      localStorage.removeItem('mili_admin_logged_in');
      localStorage.removeItem('mili_admin_authenticated');
    } catch {}
    setAdminLoggedIn(false);
    setIsAuthenticated(false);
    setUser(null);
    setSession(null);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-changed'));
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    refresh();
    const handleAuthChange = () => refresh();
    window.addEventListener('auth-changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    const interval = setInterval(refresh, 60 * 1000);
    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
      clearInterval(interval);
    };
  }, [refresh]);

  const isAdmin = user?.role === 'sukhen' || user?.role === 'mili';
  const isMili = user?.role === 'mili';

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, session, isAdmin, isMili, loading, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
