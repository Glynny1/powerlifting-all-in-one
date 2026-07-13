import { Dumbbell, PencilLine, Settings as SettingsIcon } from 'lucide-react';
import type { ViewId } from '../types';
import { cn } from '../lib/cn';

interface BottomNavProps {
  active: ViewId;
  onChange: (view: ViewId) => void;
}

const ITEMS: { id: ViewId; label: string; Icon: typeof Dumbbell }[] = [
  { id: 'warmup', label: 'Warm-Up', Icon: Dumbbell },
  { id: 'edit', label: 'Edit', Icon: PencilLine },
  { id: 'settings', label: 'Settings', Icon: SettingsIcon },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 dark:border-zinc-800
        bg-white/95 dark:bg-black/95 backdrop-blur"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      <div className="mx-auto flex max-w-app">
        {ITEMS.map(({ id, label, Icon }) => {
          const selected = id === active;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={selected ? 'page' : undefined}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 min-h-touch py-2 text-xs font-medium transition-colors',
                selected
                  ? 'text-accent-600 dark:text-accent-400'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
