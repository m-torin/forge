'use client';

import { UseFormReturnType, UseFormInput } from '@mantine/form';
import { z } from 'zod';
import { ReactNode } from 'react';

// ===== Relationship Types =====

// Base relationship type with common properties
export interface BaseRelationship<T> {
  dependsOn: string | string[];
  condition: (values: T) => boolean;
}

// Visibility relationship - controls if a field is shown/hidden
export interface VisibilityRelationship<T> extends BaseRelationship<T> {
  type: 'visibility';
}

// Validation relationship - adds conditional validation
export interface ValidationRelationship<T> extends BaseRelationship<T> {
  type: 'validation';
  message?: string; // Optional custom error message
}

// Value relationship - transforms field value based on other fields
export interface ValueRelationship<T> extends BaseRelationship<T> {
  type: 'value';
  transform: (values: T) => any; // Function to transform the field value
}

// Union type for all relationships
export type Relationship<T> =
  | VisibilityRelationship<T>
  | ValidationRelationship<T>
  | ValueRelationship<T>;

// ===== Field Configuration =====

export interface FieldConfig<T = any> {
  name: string;
  label?: string;
  description?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  group?: string;
  tab?: string;
  relationships?: Relationship<T>[];
  validation?: z.ZodTypeAny;
  asyncValidation?: boolean;
  // Additional field properties
  isArray?: boolean; // Whether this field is an array of values
  arrayItemDefaults?: any; // Default values for new array items
  nestedFields?: FieldRegistry<any>; // For object fields with nested structure
}

// ===== Registry Types =====

export type FieldRegistry<T = any> = Record<string, FieldConfig<T>>;

export interface Registry<T = any> {
  fields: FieldRegistry<T>;
  getField: (name: string) => FieldConfig<T> | undefined;
  getFieldsByGroup: (group: string) => FieldConfig<T>[];
  getFieldsByTab: (tab: string) => FieldConfig<T>[];
  getFieldsByType: (type: string) => FieldConfig<T>[];
  getVisibleFields: (values: T) => string[];
  evaluateRelationships: (values: T) => Record<string, Record<string, boolean>>;
  isFieldVisible: (fieldName: string, values: T) => boolean;
  getDependentFields: (fieldName: string) => string[];
  // Nested field methods
  getNestedField: (path: string) => FieldConfig<any> | undefined;
  getArrayItemField: (arrayPath: string) => FieldConfig<any> | undefined;
}

// ===== Form Types =====

// Form with registry interface - extends Mantine's UseFormReturnType
export interface FormWithRegistry<T> extends UseFormReturnType<T> {
  registry: Registry<T>;

  // Core extensions
  initialize: (values: Partial<T>) => void;
  getVisibleFields: () => string[];
  getFieldsByGroup: (group: string) => FieldConfig<T>[];
  getFieldsByTab: (tab: string) => FieldConfig<T>[];
  getFieldsByType: (type: string) => FieldConfig<T>[];

  // Nested field support
  getNestedValue: <V>(path: string) => V;
  setNestedValue: <V>(path: string, value: V) => void;

  // Array field support
  getArrayLength: (path: string) => number;

  // Async validation state
  isValidating?: Record<string, boolean>;

  // Form step state
  currentStep?: FormStep<T>;
  steps?: FormStep<T>[];
  nextStep?: () => boolean;
  prevStep?: () => boolean;
  goToStep?: (stepId: string) => boolean;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

// Form with registry options - extends Mantine's UseFormInput
export interface FormWithRegistryOptions<T extends Record<string, any>>
  extends Omit<UseFormInput<T>, 'initialValues'> {
  registry: FieldRegistry<T>;
  initialValues?: Partial<T>;

  // Additional options
  steps?: FormStep<T>[];
  initialStep?: string;
  onStepChange?: (from: string, to: string, values: T) => void;

  // Async validation options
  asyncValidation?: AsyncValidationOptions<T>;
}

// ===== Form Step Types =====

export interface FormStep<T = any> {
  id: string;
  title: string;
  description?: string;
  fields: (keyof T)[];
  validate?: (values: T) => Record<string, string> | null;
  isComplete?: (values: T) => boolean;
  component?: ReactNode;
  order?: number;
}

// ===== Nested Path Options =====

export interface NestedPathOptions {
  separator?: string; // Default "."
  arrayIndicator?: string; // Default "[i]"
}

// ===== Async Validation Types =====

export interface AsyncValidationOptions<T> {
  onValidate: (field: string, value: any, form: FormWithRegistry<T>) => Promise<string | null>;
  debounce?: number; // Default 300ms
  onValidateStart?: (field: string) => void;
  onValidateEnd?: (field: string, error: string | null) => void;
  validateAll?: boolean; // Whether to validate all fields or only those with asyncValidation: true
}

// ===== Dependency Graph =====

export type DependencyGraph = Record<string, string[]>;
