'use client';

import { useDebouncedValue, useDidUpdate, useThrottledValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface AutoSaveOptions {
  delay?: number; // Debounce delay in ms
  // Core configuration
  enabled?: boolean;
  mode?: 'debounce' | 'throttle';

  // Save behavior
  saveOnBlur?: boolean;
  saveOnUnmount?: boolean;
  validateBeforeSave?: boolean;

  // UI feedback
  showNotifications?: boolean;
  showSaveIndicator?: boolean;

  onSaveError?: (error: Error) => void;
  // Callbacks
  onSaveStart?: () => void;
  onSaveSuccess?: (data: any) => void;

  // Advanced
  conflictResolution?: 'local' | 'remote' | 'merge';
  retryAttempts?: number;
  retryDelay?: number;
}

interface AutoSaveState {
  conflictDetected: boolean;
  error: Error | null;
  lastSaved: Date | null;
  retryCount: number;
  status: 'idle' | 'saving' | 'saved' | 'error';
}

export function useAutoSave<T extends Record<string, any>>(
  values: T,
  isDirty: boolean,
  isValid: boolean,
  saveFunction: (values: T) => Promise<any>,
  options: AutoSaveOptions = {},
) {
  const {
    validateBeforeSave = true,
    conflictResolution = 'local',
    delay = 1000,
    enabled = true,
    mode = 'debounce',
    onSaveError,
    onSaveStart,
    onSaveSuccess,
    retryAttempts = 3,
    retryDelay = 1000,
    saveOnBlur = true,
    saveOnUnmount = true,
    showNotifications = true,
    showSaveIndicator = true,
  } = options;

  const [state, setState] = useState<AutoSaveState>({
    conflictDetected: false,
    error: null,
    lastSaved: null,
    retryCount: 0,
    status: 'idle',
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const notificationIdRef = useRef<string>();
  const lastSavedValuesRef = useRef<T>(values);
  const isSavingRef = useRef(false);

  // Choose between debounced or throttled values
  const [debouncedValues] = useDebouncedValue(values, delay);
  const [throttledValues] = useThrottledValue(values, delay);
  const processedValues = mode === 'debounce' ? debouncedValues : throttledValues;

  // Save function with retry logic
  const performSave = useCallback(
    async (valuesToSave: T, isRetry = false) => {
      if (!enabled || isSavingRef.current) return;

      // Validate before saving if required
      if (validateBeforeSave && !isValid) {
        setState((prev) => ({
          ...prev,
          error: new Error('Form validation failed'),
          status: 'error',
        }));
        return;
      }

      isSavingRef.current = true;
      setState((prev) => ({ ...prev, status: 'saving' }));
      onSaveStart?.();

      // Show saving notification
      if (showNotifications && !isRetry) {
        notificationIdRef.current = notifications.show({
          id: 'auto-save',
          autoClose: false,
          loading: true,
          message: 'Your changes are being saved automatically',
          title: 'Saving changes...',
          withCloseButton: false,
        });
      }

      try {
        const result = await saveFunction(valuesToSave);

        // Check for conflicts
        if (result?.conflict && conflictResolution !== 'local') {
          setState((prev) => ({ ...prev, conflictDetected: true }));

          if (conflictResolution === 'remote') {
            // Use remote version
            throw new Error('Conflict detected: Using remote version');
          } else if (conflictResolution === 'merge') {
            // Implement merge logic here
            console.log('Merging conflicts...');
          }
        }

        // Success
        setState({
          conflictDetected: false,
          error: null,
          lastSaved: new Date(),
          retryCount: 0,
          status: 'saved',
        });

        lastSavedValuesRef.current = valuesToSave;
        onSaveSuccess?.(result);

        // Update notification
        if (showNotifications && notificationIdRef.current) {
          notifications.update({
            id: notificationIdRef.current,
            autoClose: 2000,
            color: 'green',
            icon: <IconCheck size={16} />,
            loading: false,
            message: 'Your changes have been saved successfully',
            title: 'Changes saved',
          });
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Save failed');

        // Retry logic
        if (state.retryCount < retryAttempts) {
          setState((prev) => ({ ...prev, retryCount: prev.retryCount + 1 }));

          if (showNotifications) {
            notifications.update({
              id: notificationIdRef.current!,
              color: 'yellow',
              message: `Attempt ${state.retryCount + 1} of ${retryAttempts}`,
              title: 'Retrying...',
            });
          }

          // Retry after delay
          setTimeout(
            () => {
              performSave(valuesToSave, true);
            },
            retryDelay * (state.retryCount + 1),
          );

          return;
        }

        // Max retries reached
        setState((prev) => ({
          ...prev,
          error: err,
          status: 'error',
        }));

        onSaveError?.(err);

        // Update notification
        if (showNotifications && notificationIdRef.current) {
          notifications.update({
            id: notificationIdRef.current,
            autoClose: 5000,
            color: 'red',
            icon: <IconAlertCircle size={16} />,
            loading: false,
            message: err.message || 'Failed to save changes',
            title: 'Save failed',
          });
        }
      } finally {
        isSavingRef.current = false;
      }
    },
    [
      enabled,
      isValid,
      validateBeforeSave,
      saveFunction,
      showNotifications,
      onSaveStart,
      onSaveSuccess,
      onSaveError,
      conflictResolution,
      retryAttempts,
      retryDelay,
      state.retryCount,
    ],
  );

  // Auto-save when values change
  useDidUpdate(() => {
    if (!enabled || !isDirty) return;

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Check if values actually changed
    const hasChanges =
      JSON.stringify(processedValues) !== JSON.stringify(lastSavedValuesRef.current);
    if (!hasChanges) return;

    performSave(processedValues);
  }, [processedValues, isDirty, enabled]);

  // Save on blur if enabled
  const handleBlur = useCallback(() => {
    if (saveOnBlur && isDirty && enabled) {
      performSave(values);
    }
  }, [saveOnBlur, isDirty, enabled, values, performSave]);

  // Save on unmount if enabled
  useEffect(() => {
    return () => {
      if (saveOnUnmount && isDirty && enabled) {
        // Use the current values directly for unmount save
        saveFunction(values).catch(console.error);
      }
    };
  }, []);

  // Manual save trigger
  const triggerSave = useCallback(() => {
    if (isDirty) {
      performSave(values);
    }
  }, [isDirty, values, performSave]);

  // Cancel any pending saves
  const cancelSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (notificationIdRef.current) {
      notifications.hide(notificationIdRef.current);
    }
    setState((prev) => ({ ...prev, status: 'idle' }));
  }, []);

  // Reset auto-save state
  const reset = useCallback(() => {
    setState({
      conflictDetected: false,
      error: null,
      lastSaved: null,
      retryCount: 0,
      status: 'idle',
    });
    lastSavedValuesRef.current = values;
  }, [values]);

  return {
    ...state,
    cancelSave,
    handleBlur,
    hasSaved: state.lastSaved !== null,
    isSaving: state.status === 'saving',
    reset,
    timeSinceLastSave: state.lastSaved
      ? Math.floor((Date.now() - state.lastSaved.getTime()) / 1000)
      : null,
    triggerSave,
  };
}
