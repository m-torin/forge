import { useForm, zodResolver } from '@mantine/form';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebouncedValue, useLocalStorage } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import type { z } from 'zod';

interface UsePimFormOptions<T> {
  schema: z.ZodSchema<T>;
  initialValues: T;
  onSuccess?: () => void;
  onError?: (error: Error) => void;

  // Enhanced options
  autoSave?: {
    enabled: boolean;
    delay?: number;
    onSave: (values: T) => Promise<void>;
  };
  asyncValidation?: {
    [K in keyof T]?: (value: T[K]) => Promise<string | null>;
  };
  transformOnSubmit?: (values: T) => T | Promise<T>;
  resetOnSuccess?: boolean;
  optimisticUpdates?: boolean;
  dirtyTracking?: boolean;

  // NEW: Advanced Mantine 8 features
  watchers?: {
    [K in keyof T]?: (value: T[K], allValues: T) => void;
  };
  crossFieldValidation?: {
    fields: (keyof T)[];
    validator: (values: Pick<T, keyof T>) => string | null;
    errorField?: keyof T;
  }[];
  persistence?: {
    key: string;
    enabled: boolean;
    ttl?: number; // Time to live in milliseconds
  };
  conditionalFields?: {
    [K in keyof T]?: {
      condition: (values: T) => boolean;
      onHide?: () => void;
      onShow?: () => void;
    };
  };
}

/**
 * Enhanced PIM form hook with advanced Mantine 8 features
 * - Built-in loading states and error handling
 * - Auto-save with debounced validation
 * - Async field validation (e.g., unique checks)
 * - Dirty state tracking for unsaved changes
 * - Server error mapping to specific fields
 * - Optimistic updates with rollback
 * - Cross-field validation with dependencies
 * - Form state persistence with TTL
 * - Field watchers and conditional fields
 * - Form arrays and nested object support
 */
export function usePimForm<T>({
  schema,
  initialValues,
  onSuccess,
  onError,
  autoSave,
  asyncValidation,
  transformOnSubmit,
  resetOnSuccess = true,
  optimisticUpdates = false,
  dirtyTracking = true,
  // NEW: Advanced features
  watchers,
  crossFieldValidation,
  persistence,
  conditionalFields,
}: UsePimFormOptions<T>) {
  // Enhanced state management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSavedValues, setLastSavedValues] = useState<T | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [hiddenFields, setHiddenFields] = useState<Set<keyof T>>(new Set());

  const watchersRef = useRef<typeof watchers>(watchers);

  // Form persistence with TTL
  const [persistedValues, setPersistedValues] = useLocalStorage<{
    values: T;
    timestamp: number;
  } | null>({
    key: persistence?.key || 'form-draft',
    defaultValue: null,
  });

  // Get initial values from persistence if valid
  const getInitialValues = useCallback(() => {
    if (persistence?.enabled && persistedValues) {
      const now = Date.now();
      const ttl = persistence.ttl || 24 * 60 * 60 * 1000; // 24 hours default

      if (now - persistedValues.timestamp < ttl) {
        return persistedValues.values;
      } else {
        // Clear expired data
        setPersistedValues(null);
      }
    }
    return initialValues;
  }, [persistence, persistedValues, initialValues, setPersistedValues]);

  const formInitialValues = getInitialValues();
  const originalValuesRef = useRef<T>(formInitialValues);

  const form = useForm<T>({
    validate: zodResolver(schema),
    initialValues: formInitialValues,
    validateInputOnBlur: true,
    validateInputOnChange: false,
    enhanceGetInputProps: (payload) => ({
      ...payload,
      error: serverErrors[payload.field as string] || payload.error,
      style: hiddenFields.has(payload.field as keyof T) ? { display: 'none' } : undefined,
    }),
  });

  // Debounced values for auto-save
  const [debouncedValues] = useDebouncedValue(form.values, autoSave?.delay || 2000);

  // Track dirty state
  useEffect(() => {
    if (dirtyTracking) {
      const hasChanges = JSON.stringify(form.values) !== JSON.stringify(originalValuesRef.current);
      setIsDirty(hasChanges);
    }
  }, [form.values, dirtyTracking]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave?.enabled && lastSavedValues && !isSubmitting) {
      const hasChanges = JSON.stringify(debouncedValues) !== JSON.stringify(lastSavedValues);

      if (hasChanges && form.isValid()) {
        setIsAutoSaving(true);
        autoSave
          .onSave(debouncedValues)
          .then(() => {
            setLastSavedValues(debouncedValues);
            notifications.show({
              message: 'Changes saved automatically',
              color: 'blue',
              autoClose: 2000,
            });
          })
          .catch((error) => {
            console.error('Auto-save failed:', error);
          })
          .finally(() => {
            setIsAutoSaving(false);
          });
      }
    }
  }, [debouncedValues, autoSave, lastSavedValues, isSubmitting, form]);

  // NEW: Form persistence - save to localStorage on change
  useEffect(() => {
    if (persistence?.enabled && isDirty) {
      setPersistedValues({
        values: form.values,
        timestamp: Date.now(),
      });
    }
  }, [form.values, persistence?.enabled, isDirty, setPersistedValues]);

  // NEW: Field watchers - execute callbacks when specific fields change
  useEffect(() => {
    if (watchersRef.current) {
      Object.entries(watchersRef.current).forEach(([field, callback]) => {
        const value = form.values[field as keyof T];
        if (callback) {
          callback(value, form.values);
        }
      });
    }
  }, [form.values]);

  // NEW: Cross-field validation
  useEffect(() => {
    if (crossFieldValidation) {
      crossFieldValidation.forEach(({ fields, validator, errorField }) => {
        const relevantValues = fields.reduce(
          (acc, field) => {
            acc[field] = form.values[field];
            return acc;
          },
          {} as Pick<T, keyof T>,
        );

        const error = validator(relevantValues);
        const targetField = errorField || fields[0];

        if (error) {
          form.setFieldError(targetField as string, error);
        } else {
          form.clearFieldError(targetField as string);
        }
      });
    }
  }, [form.values, crossFieldValidation, form]);

  // NEW: Conditional fields - show/hide fields based on form state
  useEffect(() => {
    if (conditionalFields) {
      const newHiddenFields = new Set<keyof T>();

      Object.entries(conditionalFields).forEach(([field, config]) => {
        const shouldShow = config.condition(form.values);
        const fieldKey = field as keyof T;

        if (!shouldShow) {
          newHiddenFields.add(fieldKey);
          config.onHide?.();
        } else {
          config.onShow?.();
        }
      });

      setHiddenFields(newHiddenFields);
    }
  }, [form.values, conditionalFields]);

  // Async field validation
  const validateFieldAsync = useCallback(
    async (field: keyof T, value: T[keyof T]) => {
      if (asyncValidation?.[field]) {
        try {
          const error = await asyncValidation[field]!(value);
          if (error) {
            form.setFieldError(field as string, error);
          } else {
            form.clearFieldError(field as string);
          }
          return !error;
        } catch (err) {
          console.error(`Async validation failed for ${String(field)}:`, err);
          return false;
        }
      }
      return true;
    },
    [asyncValidation, form],
  );

  // Enhanced error handling that maps server errors to specific fields
  const handleServerError = useCallback(
    (error: any) => {
      setServerErrors({});

      if (error.fieldErrors) {
        // Handle field-specific errors from server
        const newServerErrors: Record<string, string> = {};
        Object.entries(error.fieldErrors).forEach(([field, message]) => {
          newServerErrors[field] = message as string;
          form.setFieldError(field, message as string);
        });
        setServerErrors(newServerErrors);
      } else if (error.message) {
        // Show general error notification
        notifications.show({
          title: 'Form Error',
          message: error.message,
          color: 'red',
        });
      }

      onError?.(error);
    },
    [form, onError],
  );

  // Enhanced reset with dirty state management
  const reset = useCallback(() => {
    form.reset();
    form.clearErrors();
    setServerErrors({});
    setIsDirty(false);
    setLastSavedValues(null);
    originalValuesRef.current = initialValues;
  }, [form, initialValues]);

  // Enhanced submit handler with loading states and transformations
  const handleSubmit = useCallback(
    (submitFn: (values: T) => Promise<void>) => {
      return form.onSubmit(async (values) => {
        setIsSubmitting(true);
        setServerErrors({});

        let processedValues = values;
        const originalValues = optimisticUpdates ? { ...form.values } : null;

        try {
          // Apply transformation if provided
          if (transformOnSubmit) {
            processedValues = await transformOnSubmit(values);
          }

          // Optimistic update
          if (optimisticUpdates) {
            form.setValues(processedValues);
          }

          await submitFn(processedValues);

          // Success handling
          setLastSavedValues(processedValues);
          if (resetOnSuccess) {
            originalValuesRef.current = processedValues;
            setIsDirty(false);
          }

          onSuccess?.();
        } catch (error: any) {
          // Rollback optimistic update on error
          if (optimisticUpdates && originalValues) {
            form.setValues(originalValues);
          }

          handleServerError(error);
          throw error;
        } finally {
          setIsSubmitting(false);
        }
      });
    },
    [form, transformOnSubmit, optimisticUpdates, resetOnSuccess, onSuccess, handleServerError],
  );

  // Warn about unsaved changes
  const warnUnsavedChanges = useCallback(() => {
    if (isDirty) {
      return window.confirm('You have unsaved changes. Are you sure you want to leave?');
    }
    return true;
  }, [isDirty]);

  return {
    ...form,

    // Enhanced methods
    reset,
    handleSubmit,
    validateFieldAsync,
    warnUnsavedChanges,

    // Enhanced state
    isSubmitting,
    isAutoSaving,
    isDirty,
    serverErrors,
    hiddenFields,

    // Utility methods
    clearServerErrors: () => setServerErrors({}),
    markAsSaved: () => {
      setLastSavedValues(form.values);
      setIsDirty(false);
    },

    // NEW: Advanced utilities
    isFieldVisible: (field: keyof T) => !hiddenFields.has(field),
    clearPersistedData: () => {
      if (persistence?.enabled) {
        setPersistedValues(null);
      }
    },
    hasPersistedData: () => {
      if (!persistence?.enabled || !persistedValues) return false;
      const now = Date.now();
      const ttl = persistence.ttl || 24 * 60 * 60 * 1000;
      return now - persistedValues.timestamp < ttl;
    },

    // Form arrays and nested object utilities
    addArrayItem: <K extends keyof T>(field: K, item: T[K] extends Array<infer U> ? U : never) => {
      const currentArray = form.values[field] as any[];
      form.setFieldValue(field as string, [...currentArray, item]);
    },
    removeArrayItem: <K extends keyof T>(field: K, index: number) => {
      const currentArray = form.values[field] as any[];
      form.setFieldValue(
        field as string,
        currentArray.filter((_, i) => i !== index),
      );
    },
    moveArrayItem: <K extends keyof T>(field: K, fromIndex: number, toIndex: number) => {
      const currentArray = [...(form.values[field] as any[])];
      const [removed] = currentArray.splice(fromIndex, 1);
      currentArray.splice(toIndex, 0, removed);
      form.setFieldValue(field as string, currentArray);
    },
  };
}
