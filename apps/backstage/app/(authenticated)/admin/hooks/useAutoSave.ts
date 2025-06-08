'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useDebouncedValue, useThrottledValue, useDidUpdate } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconAlertCircle, IconDeviceFloppy } from '@tabler/icons-react';

interface AutoSaveOptions {
  // Core configuration
  enabled?: boolean;
  delay?: number; // Debounce delay in ms
  mode?: 'debounce' | 'throttle';
  
  // Save behavior
  saveOnBlur?: boolean;
  saveOnUnmount?: boolean;
  validateBeforeSave?: boolean;
  
  // UI feedback
  showNotifications?: boolean;
  showSaveIndicator?: boolean;
  
  // Callbacks
  onSaveStart?: () => void;
  onSaveSuccess?: (data: any) => void;
  onSaveError?: (error: Error) => void;
  
  // Advanced
  conflictResolution?: 'local' | 'remote' | 'merge';
  retryAttempts?: number;
  retryDelay?: number;
}

interface AutoSaveState {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  error: Error | null;
  conflictDetected: boolean;
  retryCount: number;
}

export function useAutoSave<T extends Record<string, any>>(
  values: T,
  isDirty: boolean,
  isValid: boolean,
  saveFunction: (values: T) => Promise<any>,
  options: AutoSaveOptions = {}
) {
  const {
    enabled = true,
    delay = 1000,
    mode = 'debounce',
    saveOnBlur = true,
    saveOnUnmount = true,
    validateBeforeSave = true,
    showNotifications = true,
    showSaveIndicator = true,
    onSaveStart,
    onSaveSuccess,
    onSaveError,
    conflictResolution = 'local',
    retryAttempts = 3,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<AutoSaveState>({
    status: 'idle',
    lastSaved: null,
    error: null,
    conflictDetected: false,
    retryCount: 0,
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
  const performSave = useCallback(async (valuesToSave: T, isRetry = false) => {
    if (!enabled || isSavingRef.current) return;
    
    // Validate before saving if required
    if (validateBeforeSave && !isValid) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: new Error('Form validation failed'),
      }));
      return;
    }

    isSavingRef.current = true;
    setState(prev => ({ ...prev, status: 'saving' }));
    onSaveStart?.();

    // Show saving notification
    if (showNotifications && !isRetry) {
      notificationIdRef.current = notifications.show({
        id: 'auto-save',
        loading: true,
        title: 'Saving changes...',
        message: 'Your changes are being saved automatically',
        autoClose: false,
        withCloseButton: false,
      });
    }

    try {
      const result = await saveFunction(valuesToSave);
      
      // Check for conflicts
      if (result?.conflict && conflictResolution !== 'local') {
        setState(prev => ({ ...prev, conflictDetected: true }));
        
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
        status: 'saved',
        lastSaved: new Date(),
        error: null,
        conflictDetected: false,
        retryCount: 0,
      });
      
      lastSavedValuesRef.current = valuesToSave;
      onSaveSuccess?.(result);

      // Update notification
      if (showNotifications && notificationIdRef.current) {
        notifications.update({
          id: notificationIdRef.current,
          loading: false,
          title: 'Changes saved',
          message: 'Your changes have been saved successfully',
          icon: <IconCheck size={16} />,
          color: 'green',
          autoClose: 2000,
        });
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Save failed');
      
      // Retry logic
      if (state.retryCount < retryAttempts) {
        setState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));
        
        if (showNotifications) {
          notifications.update({
            id: notificationIdRef.current!,
            title: 'Retrying...',
            message: `Attempt ${state.retryCount + 1} of ${retryAttempts}`,
            color: 'yellow',
          });
        }

        // Retry after delay
        setTimeout(() => {
          performSave(valuesToSave, true);
        }, retryDelay * (state.retryCount + 1));
        
        return;
      }

      // Max retries reached
      setState(prev => ({
        ...prev,
        status: 'error',
        error: err,
      }));
      
      onSaveError?.(err);

      // Update notification
      if (showNotifications && notificationIdRef.current) {
        notifications.update({
          id: notificationIdRef.current,
          loading: false,
          title: 'Save failed',
          message: err.message || 'Failed to save changes',
          icon: <IconAlertCircle size={16} />,
          color: 'red',
          autoClose: 5000,
        });
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [
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
  ]);

  // Auto-save when values change
  useDidUpdate(() => {
    if (!enabled || !isDirty) return;

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Check if values actually changed
    const hasChanges = JSON.stringify(processedValues) !== JSON.stringify(lastSavedValuesRef.current);
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
    setState(prev => ({ ...prev, status: 'idle' }));
  }, []);

  // Reset auto-save state
  const reset = useCallback(() => {
    setState({
      status: 'idle',
      lastSaved: null,
      error: null,
      conflictDetected: false,
      retryCount: 0,
    });
    lastSavedValuesRef.current = values;
  }, [values]);

  return {
    ...state,
    handleBlur,
    triggerSave,
    cancelSave,
    reset,
    isSaving: state.status === 'saving',
    hasSaved: state.lastSaved !== null,
    timeSinceLastSave: state.lastSaved 
      ? Math.floor((Date.now() - state.lastSaved.getTime()) / 1000)
      : null,
  };
}