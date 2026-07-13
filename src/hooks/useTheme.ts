import { useEffect } from 'react';
import type { Density, ThemeMode } from '../types';

/**
 * Applies the resolved theme (light/dark) and density to the document root.
 * Uses the `class` dark-mode strategy and reacts to system changes when the
 * user has selected "system".
 */
export function useTheme(theme: ThemeMode, density: Density): void {
  useEffect(() => {
    const root = document.documentElement;

    const apply = () => {
      const prefersDark =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
      root.classList.toggle('dark', isDark);
    };

    apply();

    if (theme === 'system' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => apply();
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
    return undefined;
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.density = density;
  }, [density]);
}
