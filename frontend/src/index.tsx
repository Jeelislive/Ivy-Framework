import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './components/App';
import { logger } from '@/lib/logger';
import {
  getIvyVersionOrEnv,
  getIvyCommitOrEnv,
  getIvyBuildOrEnv,
  getIvyHost,
} from '@/lib/utils';

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find root element');

interface WindowWithReactRoot extends Window {
  __reactRoot?: ReturnType<typeof createRoot>;
}

let root = (window as WindowWithReactRoot).__reactRoot;
if (!root) {
  root = createRoot(container);
  (window as WindowWithReactRoot).__reactRoot = root;
}

try {
  const info = {
    framework: 'Ivy',
    version: getIvyVersionOrEnv(),
    commit: getIvyCommitOrEnv(),
    build: getIvyBuildOrEnv(),
    host: getIvyHost(),
    mode: import.meta.env.MODE,
  } as const;
  logger.info('Using framework:', info);
} catch (e) {
  console.info('Ivy: failed to log version info', e);
}

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
