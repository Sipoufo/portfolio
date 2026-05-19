// main.tsx
// Application entry point. Mounts <App /> inside React 19 strict mode.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './features/i18n';
import './styles/globals.css';
import { App } from './App';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
