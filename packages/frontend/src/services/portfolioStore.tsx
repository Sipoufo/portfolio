// portfolioStore.tsx
// React context holding the portfolio bundle fetched on boot. Kept simple —
// no SWR/TanStack required; the data is cached for the session.

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { PortfolioBundle } from '@portfolio/shared';
import { loadBundle } from './api';

type State =
  | { status: 'loading' }
  | { status: 'ready'; bundle: PortfolioBundle }
  | { status: 'error'; error: string };

const PortfolioContext = createContext<State>({ status: 'loading' });

export const PortfolioProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    void loadBundle()
      .then((bundle) => {
        if (!cancelled) setState({ status: 'ready', bundle });
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setState({ status: 'error', error: err instanceof Error ? err.message : 'unknown' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <PortfolioContext.Provider value={state}>{children}</PortfolioContext.Provider>;
};

export const usePortfolio = () => useContext(PortfolioContext);
