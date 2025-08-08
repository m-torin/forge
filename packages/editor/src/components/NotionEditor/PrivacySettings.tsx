'use client';

import { useLocalStorage } from '@mantine/hooks';
import {
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconDatabase,
  IconDownload,
  IconFileExport,
  IconLock,
  IconSettings,
  IconShield,
  IconTrash,
} from '@tabler/icons-react';
import { clsx } from 'clsx';
import { useState } from 'react';

export interface PrivacyPreferences {
  enableAnalytics: boolean;
  enableCrashReporting: boolean;
  enableAutoSave: boolean;
  enableRecovery: boolean;
  dataRetentionDays: number;
  enableExportHistory: boolean;
  enableDocumentHistory: boolean;
}

export interface DataStorageInfo {
  documentsCount: number;
  documentsSize: number;
  historyCount: number;
  historySize: number;
  preferencesSize: number;
  totalSize: number;
  lastCleanup?: string;
}

export interface PrivacySettingsProps {
  storageInfo: DataStorageInfo;
  onClearAllData: () => void;
  onExportAllData: () => void;
  onClearHistory: () => void;
  className?: string;
}

export function PrivacySettings({
  storageInfo,
  onClearAllData,
  onExportAllData,
  onClearHistory,
  className,
}: PrivacySettingsProps) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'storage' | 'export'>('privacy');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Privacy preferences
  const [privacyPreferences, setPrivacyPreferences] = useLocalStorage<PrivacyPreferences>({
    key: 'notion-editor-privacy-preferences',
    defaultValue: {
      enableAnalytics: false,
      enableCrashReporting: false,
      enableAutoSave: true,
      enableRecovery: true,
      dataRetentionDays: 30,
      enableExportHistory: true,
      enableDocumentHistory: true,
    },
    serialize: JSON.stringify,
    deserialize: value =>
      value === undefined
        ? {
            enableAnalytics: false,
            enableCrashReporting: false,
            enableAutoSave: true,
            enableRecovery: true,
            dataRetentionDays: 30,
            enableExportHistory: true,
            enableDocumentHistory: true,
          }
        : JSON.parse(value),
  });

  const updatePreference = (key: keyof PrivacyPreferences, value: any) => {
    setPrivacyPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleClearAllData = () => {
    if (showClearConfirm) {
      onClearAllData();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 5000);
    }
  };

  const tabs = [
    { id: 'privacy', label: 'Privacy', icon: IconShield },
    { id: 'storage', label: 'Storage', icon: IconDatabase },
    { id: 'export', label: 'Export', icon: IconFileExport },
  ];

  return (
    <div className={clsx('privacy-settings rounded-lg border border-gray-200 bg-white', className)}>
      <div className="border-b border-gray-200 p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <IconSettings size={20} />
          Privacy & Data Settings
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Control how your data is stored and managed locally
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  'flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700',
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-start gap-3">
                <IconLock size={20} className="mt-0.5 text-green-600" />
                <div>
                  <h3 className="font-medium text-green-900">Fully Local & Private</h3>
                  <p className="mt-1 text-sm text-green-700">
                    All your data is stored locally in your browser. Nothing is sent to external
                    servers.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Data Collection</h3>

              <div className="space-y-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={privacyPreferences.enableAnalytics}
                    onChange={e => updatePreference('enableAnalytics', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Usage Analytics</div>
                    <div className="text-sm text-gray-500">
                      Collect anonymous usage statistics to improve the editor (currently disabled)
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={privacyPreferences.enableCrashReporting}
                    onChange={e => updatePreference('enableCrashReporting', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Crash Reporting</div>
                    <div className="text-sm text-gray-500">
                      Send error reports to help fix bugs (currently disabled)
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Local Storage</h3>

              <div className="space-y-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={privacyPreferences.enableAutoSave}
                    onChange={e => updatePreference('enableAutoSave', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Auto-save Documents</div>
                    <div className="text-sm text-gray-500">
                      Automatically save your work to local storage
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={privacyPreferences.enableRecovery}
                    onChange={e => updatePreference('enableRecovery', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Crash Recovery</div>
                    <div className="text-sm text-gray-500">
                      Save drafts to recover work after unexpected closures
                    </div>
                  </div>
                </label>

                <div>
                  <label className="mb-2 block font-medium text-gray-900">
                    Data Retention Period
                  </label>
                  <select
                    value={privacyPreferences.dataRetentionDays}
                    onChange={e => updatePreference('dataRetentionDays', parseInt(e.target.value))}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value={7}>7 days</option>
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                    <option value={365}>1 year</option>
                    <option value={-1}>Never delete</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    How long to keep old document versions and history
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="space-y-6">
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 font-medium text-gray-900">Storage Usage</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Documents</div>
                  <div className="font-medium">
                    {storageInfo.documentsCount} files ({formatBytes(storageInfo.documentsSize)})
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">History</div>
                  <div className="font-medium">
                    {storageInfo.historyCount} entries ({formatBytes(storageInfo.historySize)})
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Preferences</div>
                  <div className="font-medium">{formatBytes(storageInfo.preferencesSize)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Total Usage</div>
                  <div className="font-medium text-blue-600">
                    {formatBytes(storageInfo.totalSize)}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Storage Management</h3>

              <div className="space-y-3">
                <button
                  onClick={onClearHistory}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm transition-colors hover:bg-gray-50"
                >
                  <IconClock size={16} />
                  Clear History & Logs
                </button>

                <button
                  onClick={onExportAllData}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm transition-colors hover:bg-gray-50"
                >
                  <IconDownload size={16} />
                  Export All Data
                </button>

                <button
                  onClick={handleClearAllData}
                  className={clsx(
                    'flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors',
                    showClearConfirm
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'border border-red-300 text-red-600 hover:bg-red-50',
                  )}
                >
                  {showClearConfirm ? (
                    <>
                      <IconCheck size={16} />
                      Confirm: Clear All Data
                    </>
                  ) : (
                    <>
                      <IconTrash size={16} />
                      Clear All Data
                    </>
                  )}
                </button>

                {showClearConfirm && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <div className="flex items-start gap-2">
                      <IconAlertTriangle size={16} className="mt-0.5 text-red-600" />
                      <div className="text-sm text-red-700">
                        <strong>Warning:</strong> This will permanently delete all your documents,
                        settings, and history. This action cannot be undone.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {storageInfo.lastCleanup && (
              <div className="text-sm text-gray-500">
                Last cleanup: {new Date(storageInfo.lastCleanup).toLocaleDateString()}
              </div>
            )}
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-6">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <IconFileExport size={20} className="mt-0.5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">Data Portability</h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Export your data in standard formats or create complete backups
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Export Options</h3>

              <div className="space-y-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={privacyPreferences.enableExportHistory}
                    onChange={e => updatePreference('enableExportHistory', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Track Export History</div>
                    <div className="text-sm text-gray-500">
                      Keep a record of exported files and their formats
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={privacyPreferences.enableDocumentHistory}
                    onChange={e => updatePreference('enableDocumentHistory', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Document Version History</div>
                    <div className="text-sm text-gray-500">
                      Keep track of document changes and versions
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="mb-4 font-medium text-gray-900">Available Export Formats</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="font-medium">Markdown (.md)</div>
                  <div className="text-gray-500">Universal text format</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="font-medium">HTML (.html)</div>
                  <div className="text-gray-500">Web-ready format</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="font-medium">JSON (.json)</div>
                  <div className="text-gray-500">Structured data format</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="font-medium">Backup (.json)</div>
                  <div className="text-gray-500">Complete backup with metadata</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
