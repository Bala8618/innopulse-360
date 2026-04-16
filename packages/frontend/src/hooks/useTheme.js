import { useEffect, useState } from 'react';

const STORAGE_KEY = 'innopulse_theme';
const THEME_EVENT = 'innopulse-theme-change';

export function getInitialTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'auto' || saved === 'light' || saved === 'dark') return saved;
  return 'dark';
}

function resolveTheme(mode) {
  if (mode === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

function notifyThemeChange(mode) {
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { mode } }));
}

function getStoredMode() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'auto' || saved === 'light' || saved === 'dark') return saved;
  return 'dark';
}

export function applyTheme(mode) {
  const root = document.documentElement;
  const resolved = resolveTheme(mode);
  if (resolved === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export function cycleTheme(mode) {
  if (mode === 'auto') return 'light';
  if (mode === 'light') return 'dark';
  return 'auto';
}

export default function useTheme() {
  const [theme, setThemeState] = useState('dark');

  useEffect(() => {
    const next = getStoredMode();
    setThemeState(next);
    applyTheme(next);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onMediaChange = (e) => {
      const saved = getStoredMode();
      if (saved === 'auto') {
        const autoResolved = e.matches ? 'dark' : 'light';
        applyTheme('auto');
        notifyThemeChange('auto');
        setThemeState('auto');
        if (autoResolved) {
          // keep branch explicit for clarity in dev tools
        }
      }
    };

    const onThemeEvent = (e) => {
      const nextMode = e.detail?.mode || getStoredMode();
      setThemeState(nextMode);
      applyTheme(nextMode);
    };

    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        const nextTheme = e.newValue === 'dark' || e.newValue === 'light' || e.newValue === 'auto' ? e.newValue : 'auto';
        setThemeState(nextTheme);
        applyTheme(nextTheme);
      }
    };

    media.addEventListener('change', onMediaChange);
    window.addEventListener(THEME_EVENT, onThemeEvent);
    window.addEventListener('storage', onStorage);

    return () => {
      media.removeEventListener('change', onMediaChange);
      window.removeEventListener(THEME_EVENT, onThemeEvent);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const setTheme = (nextTheme) => {
    localStorage.setItem(STORAGE_KEY, nextTheme);
    setThemeState(nextTheme);
    applyTheme(nextTheme);
    notifyThemeChange(nextTheme);
  };

  return { theme, setTheme, resolvedTheme: resolveTheme(theme) };
}
