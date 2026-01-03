'use client';

/**
 * Theme Provider
 *
 * Handles dark/light mode with localStorage persistence.
 * Prevents flash on page load by using a script in the layout.
 */

import { createContext, useContext, useLayoutEffect, useMemo, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'sovereign-watch-theme';

// Subscribe to localStorage changes for theme
function subscribeToTheme(callback: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

// Get theme from localStorage or system preference
function getThemeSnapshot(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Server snapshot returns default
function getServerSnapshot(): Theme {
  return 'light';
}

// Use useSyncExternalStore for hydration-safe mounted state
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Use useSyncExternalStore for theme to avoid setState in effects
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerSnapshot);
  const isMounted = useIsMounted();

  // Sync DOM class with theme - useLayoutEffect runs synchronously before paint
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const setTheme = useMemo(() => (newTheme: Theme) => {
    localStorage.setItem(STORAGE_KEY, newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    // Trigger storage event for useSyncExternalStore to pick up
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: newTheme }));
  }, []);

  const toggleTheme = useMemo(() => () => {
    const currentTheme = getThemeSnapshot();
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
  }, [setTheme]);

  // Prevent flash by not rendering until mounted
  if (!isMounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

