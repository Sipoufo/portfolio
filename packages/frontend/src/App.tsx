// App.tsx
// Top-level app. Two routes: public terminal at `/` and protected admin
// preferences window at `/admin` (with `/admin/login` for sign-in).

import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PortfolioProvider } from '@/services/portfolioStore';
import { AuthProvider, useAuth } from '@/services/auth';
import { applyTheme, getStoredTheme } from '@/services/theme';
import { TerminalPage } from '@/pages/TerminalPage';
import { AdminLoginPage } from '@/pages/AdminLoginPage';
import { AdminPage } from '@/pages/AdminPage';
import type { ReactNode } from 'react';

const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { status } = useAuth();
  if (status === 'loading') return null;
  if (status === 'guest') return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

export const App = () => {
  useEffect(() => {
    applyTheme(getStoredTheme());
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <PortfolioProvider>
          <Routes>
            <Route path="/" element={<TerminalPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminPage />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PortfolioProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
