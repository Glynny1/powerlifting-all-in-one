import { useState } from 'react';
import { Download, RotateCcw, Upload } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Toggle } from '../../components/Toggle';
import { SegmentedControl } from '../../components/SegmentedControl';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ImportDialog } from './ImportDialog';
import { buildExportBundle, bundleToJson, defaultExportFilename, downloadJson } from '../../lib/importExport';
import type { Density, ThemeMode } from '../../types';

function SettingRow({ children }: { children: React.ReactNode }) {
  return <div className="border-t border-zinc-100 py-3 first:border-t-0 dark:border-zinc-800">{children}</div>;
}

export function SettingsView() {
  const { settings, updateSettings, data, session, replaceAllData, resetAppToDefaults } = useApp();
  const [importOpen, setImportOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [includeSessionInExport, setIncludeSessionInExport] = useState(false);

  const doExport = () => {
    const bundle = buildExportBundle(data, session, includeSessionInExport);
    downloadJson(defaultExportFilename(), bundleToJson(bundle));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight">Settings</h1>

      {/* Appearance */}
      <section className="surface p-3">
        <h2 className="mb-1 font-semibold">Appearance</h2>
        <SettingRow>
          <span className="field-label">Theme</span>
          <SegmentedControl<ThemeMode>
            ariaLabel="Theme"
            value={settings.theme}
            onChange={(v) => updateSettings({ theme: v })}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ]}
          />
        </SettingRow>
        <SettingRow>
          <span className="field-label">Density</span>
          <SegmentedControl<Density>
            ariaLabel="Density"
            value={settings.density}
            onChange={(v) => updateSettings({ density: v })}
            options={[
              { value: 'comfortable', label: 'Comfortable' },
              { value: 'compact', label: 'Compact' },
            ]}
          />
        </SettingRow>
      </section>

      {/* Feedback */}
      <section className="surface p-3">
        <h2 className="mb-1 font-semibold">Feedback</h2>
        <SettingRow>
          <Toggle
            id="set-sound"
            checked={settings.sound}
            onChange={(v) => updateSettings({ sound: v })}
            label="Sound"
            description="Subtle chime when a timer finishes"
          />
        </SettingRow>
        <SettingRow>
          <Toggle
            id="set-vibration"
            checked={settings.vibration}
            onChange={(v) => updateSettings({ vibration: v })}
            label="Vibration"
            description="Vibrate on supported devices when a timer finishes"
          />
        </SettingRow>
      </section>

      {/* Behaviour */}
      <section className="surface p-3">
        <h2 className="mb-1 font-semibold">Behaviour</h2>
        <SettingRow>
          <Toggle
            id="set-collapse"
            checked={settings.autoCollapseCompleted}
            onChange={(v) => updateSettings({ autoCollapseCompleted: v })}
            label="Auto-collapse completed stages"
          />
        </SettingRow>
        <SettingRow>
          <Toggle
            id="set-opennext"
            checked={settings.autoOpenNext}
            onChange={(v) => updateSettings({ autoOpenNext: v })}
            label="Automatically open the next stage"
          />
        </SettingRow>
        <SettingRow>
          <Toggle
            id="set-confirm-reset"
            checked={settings.confirmResetSession}
            onChange={(v) => updateSettings({ confirmResetSession: v })}
            label="Confirm before resetting a session"
          />
        </SettingRow>
        <SettingRow>
          <Toggle
            id="set-confirm-delete"
            checked={settings.confirmDeleteRoutine}
            onChange={(v) => updateSettings({ confirmDeleteRoutine: v })}
            label="Confirm before deleting a routine"
          />
        </SettingRow>
      </section>

      {/* Data */}
      <section className="surface p-3">
        <h2 className="mb-1 font-semibold">Data</h2>
        <SettingRow>
          <Toggle
            id="export-session"
            checked={includeSessionInExport}
            onChange={setIncludeSessionInExport}
            label="Include session progress in export"
            description="Off by default — export contains routines and settings only"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" className="btn-secondary" onClick={doExport}>
              <Download className="h-4 w-4" /> Export
            </button>
            <button type="button" className="btn-secondary" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4" /> Import
            </button>
          </div>
        </SettingRow>
        <SettingRow>
          <button type="button" className="btn-ghost w-full text-red-600 dark:text-red-400" onClick={() => setConfirmReset(true)}>
            <RotateCcw className="h-4 w-4" /> Reset app to defaults
          </button>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Restores the two default routines and clears all custom data and progress.
          </p>
        </SettingRow>
      </section>

      <p className="pb-2 text-center text-xs text-zinc-400 dark:text-zinc-600">
        All data is stored locally in this browser. No account or server required.
      </p>

      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} onImport={replaceAllData} />

      <ConfirmDialog
        open={confirmReset}
        title="Reset app to defaults?"
        message="This permanently deletes your custom routines, settings, and session progress, and restores the defaults."
        confirmLabel="Reset everything"
        destructive
        onConfirm={() => {
          resetAppToDefaults();
          setConfirmReset(false);
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
