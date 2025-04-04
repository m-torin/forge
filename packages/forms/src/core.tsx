'use client';

import { useForm } from '@mantine/form';
import { createContext, ReactNode, useContext, useEffect, useMemo } from 'react';
import { Registry, createRegistry, getNestedValue, setNestedValue, getDependentFields } from './registry';
import { FieldConfig, FieldRegistry, FormWithRegistry, FormWithRegistryOptions } from './types';
import { createRegistryValidator, validateField } from './validation';
import { useAsyncValidation } from './async-validation';

/**
 * Main hook for creating a form with registry integration
 * This directly extends Mantine's useForm with our registry functionality
 */
export function useFormWithRegistry<T extends Record<string, any>>(
  options: FormWithRegistryOptions<T>
): FormWithRegistry<T> {
  // Create registry instance
  const registry = useMemo(() =>
    createRegistry<T>(options.registry),
    [options.registry]
  );

  // Create registry-aware validator
  const validator = useMemo(() =>
    createRegistryValidator(options.validate, registry),
    [options.validate, registry]
  );

  // Use Mantine's useForm directly
  const form = useForm<T>({
    ...options,
    validate: validator
  });

  // Compute visible fields based on current values
  const visibleFields = useMemo(() =>
    registry.getVisibleFields(form.values),
    [form.values, registry]
  );

  // Initialize form steps if provided
  useEffect(() => {
    if (options.steps) {
      (form as any).steps = options.steps;
    }
  }, [form, options.steps]);

  // Setup async validation if provided
  useEffect(() => {
    if (options.asyncValidation) {
      const { validating } = useAsyncValidation(form as any, options.asyncValidation);
      (form as any).isValidating = validating;
    }
  }, [form, options.asyncValidation]);

  // Create enhanced versions of Mantine methods that need extension
  const enhancedMethods = {
    // Enhanced setFieldValue that handles dependent fields
    setFieldValue: (path: string, value: any) => {
      // Call original implementation
      form.setFieldValue(path, value);

      // Process dependent fields
      const dependentFields = getDependentFields(path, registry);

      // Re-evaluate visibility for dependent fields
      if (dependentFields.length > 0) {
        // Force a re-render to update visibility
        form.setValues({ ...form.values });
      }
    },

    // Enhanced setValues that handles dependent fields
    setValues: (values: Partial<T>) => {
      // Call original implementation
      form.setValues(values);

      // No need to process dependent fields here as setValues will trigger a re-render
    }
  };

  // Return enhanced form with all original + extended functionality
  return {
    ...form, // Direct passthrough to all Mantine methods
    ...enhancedMethods, // Enhanced methods that override Mantine methods

    registry,

    // Core extensions
    initialize: (values: Partial<T>) => {
      form.setValues(values);
      form.resetDirty();
      form.resetTouched();
    },

    getVisibleFields: () => visibleFields,

    getFieldsByGroup: (group: string) =>
      registry.getFieldsByGroup(group),

    getFieldsByTab: (tab: string) =>
      registry.getFieldsByTab(tab),

    getFieldsByType: (type: string) =>
      registry.getFieldsByType(type),

    // Enhanced nested field support
    getNestedValue: <V>(path: string): V =>
      getNestedValue(form.values, path),

    setNestedValue: <V>(path: string, value: V) => {
      const newValues = setNestedValue(form.values, path, value);
      form.setValues(newValues);

      // Process dependent fields
      const dependentFields = getDependentFields(path, registry);

      // Re-evaluate visibility for dependent fields
      if (dependentFields.length > 0) {
        // Force a re-render to update visibility
        form.setValues({ ...form.values });
      }
    },

    // Enhanced array field support
    getArrayLength: (path: string): number => {
      const array = getNestedValue(form.values, path);
      return Array.isArray(array) ? array.length : 0;
    }
  };
}

// Create form context for easier access
const FormContext = createContext<FormWithRegistry<any> | null>(null);

/**
 * Provider component for making the form available throughout the component tree
 */
export function FormProvider<T>({
  form,
  children
}: {
  form: FormWithRegistry<T>;
  children: ReactNode
}) {
  return (
    <FormContext.Provider value={form}>
      {children}
    </FormContext.Provider>
  );
}

/**
 * Hook for accessing the form context
 */
export function useFormContext<T>(): FormWithRegistry<T> {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context as FormWithRegistry<T>;
}

/**
 * Hook for validating a specific field
 */
export function useFieldValidation<T>(fieldName: string) {
  const form = useFormContext<T>();

  return {
    validate: () => {
      const error = validateField(form.values, fieldName, form.registry, form.validate);
      if (error) {
        form.setFieldError(fieldName, error);
        return false;
      }
      form.clearFieldError(fieldName);
      return true;
    },
    isValid: !form.errors[fieldName],
    error: form.errors[fieldName],
    isValidating: form.isValidating?.[fieldName] || false
  };
}

/**
 * Helper function to create a Zod resolver for Mantine forms
 */
export function createZodResolver<T>(schema: any) {
  return (values: T) => {
    try {
      schema.parse(values);
      return null;
    } catch (error: any) {
      if (error.errors) {
        return error.errors.reduce((acc: Record<string, string>, curr: any) => {
          const path = curr.path.join('.');
          acc[path] = curr.message;
          return acc;
        }, {});
      }
      return null;
    }
  };
}

/**
 * Creates a form context with additional functionality
 */
export function createFormContext<T>() {
  // Create base context
  const FormCtx = createContext<FormWithRegistry<T> | null>(null);

  // Create provider component
  const FormProvider = ({ form, children }: { form: FormWithRegistry<T>; children: ReactNode }) => {
    return <FormCtx.Provider value={form}>{children}</FormCtx.Provider>;
  };

  // Create hook to access context
  const useForm = () => {
    const context = useContext(FormCtx);
    if (!context) {
      throw new Error('useForm must be used within FormProvider');
    }
    return context;
  };

  return { FormProvider, useForm };
}

/**
 * Creates a dependency graph for form fields
 */
export function createDependencyGraph(registry: FieldRegistry<any>) {
  const graph: Record<string, string[]> = {};

  // Build the graph based on registry fields
  Object.entries(registry).forEach(([fieldName, config]) => {
    // If the field has dependencies
    if (config.dependencies && config.dependencies.length > 0) {
      // For each dependency, add this field as dependent
      config.dependencies.forEach(dep => {
        if (!graph[dep]) {
          graph[dep] = [];
        }
        if (!graph[dep].includes(fieldName)) {
          graph[dep].push(fieldName);
        }
      });
    }

    // Ensure this field has an entry even if no dependencies
    if (!graph[fieldName]) {
      graph[fieldName] = [];
    }
  });

  return graph;
}
