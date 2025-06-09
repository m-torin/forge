'use client';

import React from 'react';

/**
 * @fileoverview Standardized form utilities and components for the design system.
 * This module provides a consistent interface for form handling across the application,
 * primarily wrapping Mantine form utilities with additional type safety and standardization.
 */

// Export Mantine form utilities with enhanced type safety
export { useForm } from '@mantine/form';
export type { UseFormInput, UseFormReturnType } from '@mantine/form';

/**
 * Standard form wrapper component that provides consistent form behavior.
 *
 * @param props - Standard HTML form attributes
 * @returns Form component with standardized styling and behavior
 *
 * @example
 * ```tsx
 * <Form onSubmit={handleSubmit}>
 *   <TextInput {...form.getInputProps('email')} />
 *   <Button type="submit">Submit</Button>
 * </Form>
 * ```
 */
export const Form = ({ children, ...props }: React.FormHTMLAttributes<HTMLFormElement>) => (
  <form {...props}>{children}</form>
);

/**
 * Compatibility wrapper for form fields.
 * Components should be updated to use Mantine form components directly.
 *
 * @deprecated Use Mantine form components directly instead
 * @param props - Component props with children
 * @returns Children elements unchanged
 */
export const FormField = ({ children }: { children: React.ReactNode }) => children;

/**
 * Compatibility wrapper for form items.
 *
 * @deprecated Use Mantine form components directly instead
 * @param props - Component props with children
 * @returns Children elements unchanged
 */
export const FormItem = ({ children }: { children: React.ReactNode }) => children;

/**
 * Compatibility wrapper for form labels.
 *
 * @deprecated Use Mantine form components directly instead
 * @param props - Component props with children
 * @returns Children elements unchanged
 */
export const FormLabel = ({ children }: { children: React.ReactNode }) => children;

/**
 * Compatibility wrapper for form controls.
 *
 * @deprecated Use Mantine form components directly instead
 * @param props - Component props with children
 * @returns Children elements unchanged
 */
export const FormControl = ({ children }: { children: React.ReactNode }) => children;

/**
 * Compatibility wrapper for form descriptions.
 *
 * @deprecated Use Mantine form components directly instead
 * @param props - Component props with children
 * @returns Children elements unchanged
 */
export const FormDescription = ({ children }: { children: React.ReactNode }) => children;

/**
 * Compatibility wrapper for form messages.
 *
 * @deprecated Use Mantine form components directly instead
 * @param props - Component props with children
 * @returns Children elements unchanged
 */
export const FormMessage = ({ children }: { children: React.ReactNode }) => children;

/**
 * Re-export commonly used Mantine form components for convenience.
 * These components provide the foundation for all form inputs in the design system.
 */

// Core form input components
export {
  Checkbox,
  type CheckboxProps,
  FileInput,
  type FileInputProps,
  MultiSelect,
  type MultiSelectProps,
  NumberInput,
  type NumberInputProps,
  PasswordInput,
  type PasswordInputProps,
  Radio,
  type RadioProps,
  Select,
  type SelectProps,
  Switch,
  type SwitchProps,
  Textarea,
  type TextareaProps,
  TextInput,
  type TextInputProps,
} from '@mantine/core';

/**
 * Date and time input components from @mantine/dates.
 * Provides standardized date/time input handling across the application.
 */
export {
  DateInput,
  type DateInputProps,
  DatePicker,
  type DatePickerProps,
  TimeInput,
  type TimeInputProps,
} from '@mantine/dates';

/**
 * Advanced date picker components for complex date/time selection scenarios.
 */
export {
  DatePickerInput,
  type DatePickerInputProps,
  DateTimePicker,
  type DateTimePickerProps,
  MonthPicker,
  type MonthPickerProps,
  YearPicker,
  type YearPickerProps,
} from '@mantine/dates';

/**
 * Standard validation helper types for form validation.
 */
export interface FormValidationError {
  /** The field name that has the error */
  field: string;
  /** The error message to display */
  message: string;
}

/**
 * Standard form submission result type.
 */
export interface FormSubmissionResult<T = unknown> {
  /** The result data if successful */
  data?: T;
  /** Error message if unsuccessful */
  error?: string;
  /** Field-specific validation errors */
  errors?: FormValidationError[];
  /** Whether the submission was successful */
  success: boolean;
}
