'use client';

import { useEffect, useState } from 'react';
import { AsyncValidationOptions, FormWithRegistry } from './types';

/**
 * Hook for adding async validation to a form
 *
 * This hook allows you to perform asynchronous validation on form fields,
 * such as checking if a username is available or validating an email address
 * against a server API.
 *
 * @example
 * ```tsx
 * const form = useFormWithRegistry({...});
 *
 * const { isValidating, isFieldValidating } = useAsyncValidation(form, {
 *   onValidate: async (field, value, form) => {
 *     if (field === 'username') {
 *       const response = await checkUsernameAvailable(value);
 *       return response.available ? null : 'Username is already taken';
 *     }
 *     return null;
 *   },
 *   debounce: 500,
 *   onValidateStart: (field) => console.log(`Validating ${field}...`),
 *   onValidateEnd: (field, error) => console.log(`Validation complete for ${field}:`, error)
 * });
 * ```
 */
export function useAsyncValidation<T>(
  form: FormWithRegistry<T>,
  options: AsyncValidationOptions<T>
) {
  const [validating, setValidating] = useState<Record<string, boolean>>({});

  // Setup validation listeners
  useEffect(() => {
    if (!form.watch) {
      console.warn('Form does not support watch method, async validation will not work');
      return;
    }

    const unsubscribes: (() => void)[] = [];

    // Setup watchers for each field that needs async validation
    Object.keys(form.registry.fields)
      .filter(field => {
        // Only watch fields that need async validation
        const fieldConfig = form.registry.getField(field);
        return fieldConfig && (fieldConfig.asyncValidation || options.validateAll);
      })
      .forEach(field => {
        const unsubscribe = form.watch(field, async () => {
          const value = form.values[field as keyof T];
          const fieldConfig = form.registry.getField(field);

          // Skip validation if field is empty and not required
          if (!value && !(fieldConfig?.required)) {
            form.clearFieldError(field);
            return;
          }

          // Skip validation if field is not visible
          if (!form.registry.isFieldVisible(field, form.values)) {
            form.clearFieldError(field);
            return;
          }

          // Mark field as validating
          setValidating(prev => ({ ...prev, [field]: true }));
          if (options.onValidateStart) options.onValidateStart(field);

          try {
            // Debounce validation
            await new Promise(r => setTimeout(r, options.debounce || 300));

            // Perform validation
            const error = await options.onValidate(field, value, form);

            // Set error if any
            if (error) {
              form.setFieldError(field, error);
            } else {
              form.clearFieldError(field);
            }

            if (options.onValidateEnd) options.onValidateEnd(field, error);
          } finally {
            // Mark field as no longer validating
            setValidating(prev => ({ ...prev, [field]: false }));
          }
        });

        unsubscribes.push(unsubscribe);
      });

    // Cleanup
    return () => unsubscribes.forEach(unsubscribe => unsubscribe());
  }, [form, options]);

  // Add validating state to form
  useEffect(() => {
    if (form) {
      (form as any).isValidating = validating;
    }
  }, [form, validating]);

  return {
    validating,
    isValidating: Object.values(validating).some(Boolean),
    isFieldValidating: (field: string) => Boolean(validating[field])
  };
}

/**
 * Validates a field asynchronously
 * This is useful for validating a single field without setting up the hook
 */
export async function validateFieldAsync<T>(
  field: string,
  value: any,
  form: FormWithRegistry<T>,
  options: AsyncValidationOptions<T>
): Promise<string | null> {
  // Skip validation if field is empty and not required
  const fieldConfig = form.registry.getField(field);
  if (!value && !(fieldConfig?.required)) {
    return null;
  }

  // Skip validation if field is not visible
  if (!form.registry.isFieldVisible(field, form.values)) {
    return null;
  }

  // Perform validation
  return options.onValidate(field, value, form);
}
