import { useState } from 'react';
import type { ViewId } from './types';
import { useApp } from './context/AppContext';
import { useTheme } from './hooks/useTheme';
import { BottomNav } from './components/BottomNav';
import { WarmupView } from './features/session/WarmupView';
import { EditRoutineView } from './features/routines/EditRoutineView';
import { SettingsView } from './features/settings/SettingsView';

export function App() {
  const { settings, recovered, dismissRecovered } = useApp();
  const [view, setView] = useState<ViewId>('warmup');

  useTheme(settings.theme, settings.density);

  return (
    <div className="min-h-full">
      {/* Skip link for keyboard users */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-accent-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <main
        id="main"
        className="mx-auto w-full max-w-app px-3 pb-24"
        style={{ paddingTop: 'max(var(--safe-top), 0.75rem)' }}
      >
        {recovered && (
          <div
            role="status"
            className="mb-3 flex items-start justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200"
          >
            <span>Saved data could not be read and was restored to defaults.</span>
            <button
              type="button"
              onClick={dismissRecovered}
              className="shrink-0 font-medium underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {view === 'warmup' && <WarmupView onNavigate={setView} />}
        {view === 'edit' && <EditRoutineView />}
        {view === 'settings' && <SettingsView />}
      </main>

      <BottomNav active={view} onChange={setView} />
    </div>
  );
}
