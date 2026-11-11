'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx>({ theme: 'dark', toggle: () => {} });
export const useTheme = () => useContext(Ctx);

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    const cookieMatch = document.cookie.match(/(?:^|;\s*)theme=([^;]*)/);
    const cookieTheme = cookieMatch ? (cookieMatch[1] as Theme) : null;
    const stored = cookieTheme || (localStorage.getItem('theme') as Theme | null);
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    return stored ?? system;
  } catch {
    return 'dark';
  }
}

function setThemeCookie(t: string): void {
  try {
    document.cookie = `theme=${t}; path=/; max-age=31536000; SameSite=Lax`;
    localStorage.setItem('theme', t);
  } catch {}
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  function apply(t: Theme) {
    setTheme(t);
    document.documentElement.classList.toggle('dark', t === 'dark');
    setThemeCookie(t);
  }

  return (
    <Ctx.Provider value={{ theme, toggle: () => apply(theme === 'dark' ? 'light' : 'dark') }}>
      {children}
    </Ctx.Provider>
  );
}
