// auth.tsx
// Admin auth context. Pings GET /api/auth/me on mount; the JWT cookie is set
// by the browser so we never see the token in JS land.

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from './api';

type User = { sub: string; email: string };

type Ctx = {
  user: User | null;
  status: 'loading' | 'authed' | 'guest';
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<Ctx | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Ctx['status']>('loading');

  const refresh = async () => {
    try {
      const me = await api.me();
      setUser(me);
      setStatus('authed');
    } catch {
      setUser(null);
      setStatus('guest');
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const login = async (email: string, password: string) => {
    await api.login({ email, password });
    await refresh();
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setStatus('guest');
  };

  return (
    <AuthContext.Provider value={{ user, status, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): Ctx => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
};
