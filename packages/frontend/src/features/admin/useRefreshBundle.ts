// useRefreshBundle.ts
// Helper to reload portfolio data after a mutation. The portfolio store is
// fetched once on boot; after a save we just reload the page section by
// re-fetching. Sections call this so the public terminal stays in sync if
// the admin/terminal are opened in two tabs.

import { useCallback, useState } from 'react';
import { loadBundle } from '@/services/api';
import type { PortfolioBundle } from '@portfolio/shared';

export const useLocalBundle = () => {
  const [bundle, setBundle] = useState<PortfolioBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const b = await loadBundle();
      setBundle(b);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown');
    } finally {
      setLoading(false);
    }
  }, []);

  return { bundle, loading, error, refresh };
};
