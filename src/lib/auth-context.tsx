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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
      if (data.authenticated && data.session) {
        setUser(data.user || {
          name: data.session.userName || 'Mili',
          role: data.session.userRole || 'mili',
          avatar: data.session.avatar || '👑',
        });
        setSession(data.session);
        if (data.user?.role === 'sukhen' || data.session.userRole === 'sukhen') {
          setAdminLoggedIn(true);
        }
      } else {
        setUser(null);
        setSession(null);
      }
    } catch {
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
    localStorage.removeItem('mili_session_ref');
    setAdminLoggedIn(false);
    setIsAuthenticated(false);
    setUser(null);
    setSession(null);
    window.location.href = '/login';
  }, []);

  useEffect(() => {
    refresh();
    // Refresh session status every 5 minutes
    const interval = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  const isAdmin = user?.role === 'sukhen';
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
