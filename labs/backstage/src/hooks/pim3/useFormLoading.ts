import { useState, useCallback } from 'react';

interface LoadingStates {
  submitting: boolean;
  autoSaving: boolean;
  validating: boolean;
  loading: boolean;
  [key: string]: boolean;
}

interface FormLoadingOptions {
  defaultStates?: Partial<LoadingStates>;
}

/**
 * Hook to manage various loading states in forms
 * Eliminates the need for multiple useState hooks for loading states
 */
export function useFormLoading(options: FormLoadingOptions = {}) {
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    submitting: false,
    autoSaving: false,
    validating: false,
    loading: false,
    ...options.defaultStates,
  });

  // Set a specific loading state
  const setLoading = useCallback((key: keyof LoadingStates, value: boolean) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Set multiple loading states at once
  const setMultipleLoading = useCallback((states: Partial<LoadingStates>) => {
    setLoadingStates((prev) => ({
      ...prev,
      ...states,
    }));
  }, []);

  // Reset all loading states to false
  const resetLoading = useCallback(() => {
    setLoadingStates({
      submitting: false,
      autoSaving: false,
      validating: false,
      loading: false,
    });
  }, []);

  // Wrapper for async operations with automatic loading state management
  const withLoading = useCallback(
    <T>(key: keyof LoadingStates, asyncFn: () => Promise<T>) => {
      return async (): Promise<T> => {
        setLoading(key, true);
        try {
          return await asyncFn();
        } finally {
          setLoading(key, false);
        }
      };
    },
    [setLoading],
  );

  // Check if any loading state is active
  const isAnyLoading = Object.values(loadingStates).some(Boolean);

  // Check if specific loading states are active
  const isSubmitting = loadingStates.submitting;
  const isAutoSaving = loadingStates.autoSaving;
  const isValidating = loadingStates.validating;
  const isLoading = loadingStates.loading;

  return {
    // State getters
    loadingStates,
    isAnyLoading,
    isSubmitting,
    isAutoSaving,
    isValidating,
    isLoading,

    // State setters
    setLoading,
    setMultipleLoading,
    resetLoading,

    // Utility wrapper
    withLoading,

    // Individual state setters for convenience
    setSubmitting: (value: boolean) => setLoading('submitting', value),
    setAutoSaving: (value: boolean) => setLoading('autoSaving', value),
    setValidating: (value: boolean) => setLoading('validating', value),
    setFormLoading: (value: boolean) => setLoading('loading', value),
  };
}

/**
 * Hook for form data loading (initial data, options, etc.)
 * Handles loading states for data that forms depend on
 */
export function useFormDataLoading() {
  const [dataStates, setDataStates] = useState({
    initialData: false,
    options: false,
    relationships: false,
  });

  const setDataLoading = useCallback((key: keyof typeof dataStates, value: boolean) => {
    setDataStates((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const withDataLoading = useCallback(
    <T>(key: keyof typeof dataStates, asyncFn: () => Promise<T>) => {
      return async (): Promise<T> => {
        setDataLoading(key, true);
        try {
          return await asyncFn();
        } finally {
          setDataLoading(key, false);
        }
      };
    },
    [setDataLoading],
  );

  return {
    dataStates,
    isDataLoading: Object.values(dataStates).some(Boolean),
    setDataLoading,
    withDataLoading,

    // Convenience getters
    isLoadingInitialData: dataStates.initialData,
    isLoadingOptions: dataStates.options,
    isLoadingRelationships: dataStates.relationships,
  };
}
