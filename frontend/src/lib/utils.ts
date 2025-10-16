import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { textBlockClassMap } from './textBlockClassMap';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAppId(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('appId');
}

export function getAppArgs(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('appArgs');
}

export function getParentId(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('parentId');
}

function generateUUID(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c: string) =>
    (
      Number(c) ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))
    ).toString(16)
  );
}

export function getMachineId(): string {
  let id = localStorage.getItem('machineId');
  if (!id) {
    id = generateUUID();
    localStorage.setItem('machineId', id);
  }
  return id;
}

export function getIvyHost(): string {
  const urlParams = new URLSearchParams(window.location.search);
  const ivyHost = urlParams.get('ivyHost');
  if (ivyHost) return ivyHost;

  const metaHost = document
    .querySelector('meta[name="ivy-host"]')
    ?.getAttribute('content');
  if (metaHost) return metaHost;

  return window.location.origin;
}

/**
 * Returns the content of a meta tag named with the given key.
 * Example: getIvyMeta('ivy-version') -> "1.0.118"
 */
export function getIvyMeta(name: string): string | null {
  return (
    document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ??
    null
  );
}

export function getIvyVersion(): string | null {
  return getIvyMeta('ivy-version');
}

export function getIvyCommit(): string | null {
  return getIvyMeta('ivy-commit');
}

export function getIvyBuild(): string | null {
  return getIvyMeta('ivy-build');
}

// Global access for optional fallbacks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const __g: any = typeof window !== 'undefined' ? window : {};

// Returns a non-empty version string by checking meta, title, env, and globals
export function getIvyVersionOrEnv(): string {
  return (
    getIvyVersion() ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_IVY_VERSION) ||
    __g.__IVY_VERSION ||
    '0'
  );
}

// Returns commit from meta or env/globals; defaults to '-'
export function getIvyCommitOrEnv(): string {
  return (
    getIvyCommit() ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_IVY_COMMIT) ||
    __g.__IVY_COMMIT ||
    '-'
  );
}

// Returns build from meta or env/globals; defaults to '-'
export function getIvyBuildOrEnv(): string {
  return (
    getIvyBuild() ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_IVY_BUILD) ||
    __g.__IVY_BUILD ||
    '-'
  );
}

export function camelCase(titleCase: unknown): unknown {
  if (typeof titleCase !== 'string') {
    return titleCase;
  }
  return titleCase.charAt(0).toLowerCase() + titleCase.slice(1);
}

// Shared Ivy tag-to-class map for headings, paragraphs, lists, tables, etc.
export const ivyTagClassMap = textBlockClassMap;
