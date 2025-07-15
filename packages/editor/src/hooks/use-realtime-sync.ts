'use client';

import { notifications } from '@mantine/notifications';
import { useCallback, useEffect, useRef, useState } from 'react';

interface RealtimeSyncOptions {
  documentId: string;
  userId: string;
  syncInterval?: number;
  enableOptimisticUpdates?: boolean;
  conflictResolution?: 'merge' | 'overwrite' | 'prompt';
}

interface SyncState {
  isLoading: boolean;
  lastSyncTime: Date | null;
  hasUnsavedChanges: boolean;
  conflictCount: number;
}

export function useRealtimeSync(options: RealtimeSyncOptions) {
  const [syncState, setSyncState] = useState<SyncState>({
    isLoading: false,
    lastSyncTime: null,
    hasUnsavedChanges: false,
    conflictCount: 0,
  });

  const [localChanges, setLocalChanges] = useState<Record<string, any>>({});
  const [remoteChanges, _setRemoteChanges] = useState<Record<string, any>>({});
  const syncTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const syncData = useCallback(
    async (force?: boolean) => {
      if (syncState.isLoading && !force) return;

      setSyncState(prev => ({ ...prev, isLoading: true }));

      try {
        // In a real implementation, this would sync with your backend
        // For now, we'll simulate the sync process
        await new Promise(resolve => setTimeout(resolve, 500));

        // Simulate conflict detection
        const hasConflicts = Math.random() > 0.8; // 20% chance of conflicts

        if (hasConflicts && Object.keys(localChanges).length > 0) {
          handleConflicts();
        } else {
          // Successful sync
          setLocalChanges({});
          setSyncState(prev => ({
            ...prev,
            isLoading: false,
            lastSyncTime: new Date(),
            hasUnsavedChanges: false,
          }));

          notifications.show({
            title: 'Changes Synced',
            message: 'Your changes have been saved',
            color: 'green',
            autoClose: 2000,
          });
        }
      } catch (_error) {
        setSyncState(prev => ({ ...prev, isLoading: false }));
        notifications.show({
          title: 'Sync Failed',
          message: 'Could not save your changes. Retrying...',
          color: 'red',
        });

        // Retry after a delay
        setTimeout(() => syncData(true), 3000);
      }
    },
    [syncState.isLoading, localChanges],
  );

  const handleConflicts = useCallback(() => {
    setSyncState(prev => ({
      ...prev,
      conflictCount: prev.conflictCount + 1,
      isLoading: false,
    }));

    switch (options.conflictResolution) {
      case 'merge':
        // Attempt to merge changes automatically
        const mergedChanges = { ...remoteChanges, ...localChanges };
        setLocalChanges(mergedChanges);
        notifications.show({
          title: 'Changes Merged',
          message: 'Conflicts were resolved automatically',
          color: 'yellow',
        });
        break;

      case 'overwrite':
        // Local changes win
        notifications.show({
          title: 'Local Changes Kept',
          message: 'Your local changes were preserved',
          color: 'blue',
        });
        break;

      case 'prompt':
      default:
        // Prompt user to resolve conflicts
        notifications.show({
          title: 'Conflict Detected',
          message: 'Please review and resolve conflicts',
          color: 'orange',
          autoClose: false,
        });
        break;
    }
  }, [localChanges, remoteChanges, options.conflictResolution]);

  const queueChange = useCallback(
    (key: string, value: any) => {
      setLocalChanges(prev => ({ ...prev, [key]: value }));
      setSyncState(prev => ({ ...prev, hasUnsavedChanges: true }));

      if (options.enableOptimisticUpdates) {
        // Apply change immediately in the UI
        // The actual sync will happen in the background
      }

      // Debounce sync
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(() => {
        syncData();
      }, options.syncInterval || 2000);
    },
    [syncData, options],
  );

  const forcSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncData(true);
  }, [syncData]);

  const discardLocalChanges = useCallback(() => {
    setLocalChanges({});
    setSyncState(prev => ({ ...prev, hasUnsavedChanges: false }));

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    notifications.show({
      title: 'Changes Discarded',
      message: 'Local changes have been discarded',
      color: 'gray',
    });
  }, []);

  // Auto-sync on interval
  useEffect(() => {
    if (!options.syncInterval) return;

    const interval = setInterval(() => {
      if (syncState.hasUnsavedChanges) {
        syncData();
      }
    }, options.syncInterval);

    return () => clearInterval(interval);
  }, [syncData, syncState.hasUnsavedChanges, options.syncInterval]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return {
    syncState,
    localChanges,
    remoteChanges: remoteChanges,
    queueChange,
    forcSync,
    discardLocalChanges,
    syncData,
  };
}
