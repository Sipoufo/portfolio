// AdminLoginPage.tsx
// Small macOS-styled authentication window. Redirects to /admin on success.

import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '@/services/auth';
import { Wallpaper } from '@/components/macos/Wallpaper';
import { MenuBar } from '@/components/macos/MenuBar';
import { TrafficLights } from '@/components/macos/TrafficLights';
import { Button, Input } from '@/components/ui/Field';

export const AdminLoginPage = () => {
  const nav = useNavigate();
  const { login, status } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === 'authed') nav('/admin', { replace: true });
  }, [status, nav]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      nav('/admin', { replace: true });
    } catch (err) {
      const status = (err as Error & { status?: number }).status;
      setError(status === 401 ? 'Identifiants invalides.' : 'Connexion impossible.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Wallpaper />
      <MenuBar />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div
          className="w-full max-w-sm rounded-xl overflow-hidden"
          style={{
            background: 'var(--color-term-bg-translucent)',
            border: '1px solid var(--color-window-border)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.45), 0 4px 12px rgba(0,0,0,0.25)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          }}
        >
          <div
            className="h-7 flex items-center px-3"
            style={{
              background: 'var(--color-window-titlebar)',
              color: 'var(--color-window-titlebar-fg)',
              borderBottom: '1px solid var(--color-window-border)',
            }}
          >
            <TrafficLights />
            <div className="flex-1 text-center text-xs font-medium">Authentification</div>
            <div className="w-12" />
          </div>

          <form onSubmit={submit} className="px-6 py-6 flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-12 h-12 rounded-full grid place-items-center"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--color-term-fg)' }}
              >
                <Lock size={20} />
              </div>
              <div className="text-sm" style={{ color: 'var(--color-term-fg)' }}>
                Portfolio · Admin
              </div>
            </div>

            <Input
              type="email"
              placeholder="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <div className="text-xs" style={{ color: 'var(--color-term-error)' }}>
                {error}
              </div>
            )}

            <Button type="submit" disabled={busy} className="w-full">
              {busy ? '…' : 'Se connecter'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
