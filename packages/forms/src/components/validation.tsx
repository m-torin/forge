'use client';

import React, { useMemo } from 'react';
import { Alert, Text, Group, Badge } from '@mantine/core';
import { useFormContext } from '../core';
import { FormWithRegistry } from '../types';

/**
 * Props for the FormErrorSummary component
 */
export interface FormErrorSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Title to display above the error list
   * @default "Please fix the following errors:"
   */
  title?: string;

  /**
   * Whether to show field labels instead of field names
   * @default true
   */
  useLabels?: boolean;

  /**
   * Custom renderer for error items
   */
  renderError?: (field: string, error: string, label?: string) => React.ReactNode;

  /**
   * Custom renderer for the error list
   */
  renderList?: (errors: Array<{ field: string; error: string; label?: string }>) => React.ReactNode;

  /**
   * Custom renderer for the title
   */
  renderTitle?: (title: string) => React.ReactNode;

  /**
   * Whether to focus the first error field when errors are displayed
   * @default false
   */
  focusOnError?: boolean;

  /**
   * CSS class for the error container
   */
  className?: string;

  /**
   * Whether to use Mantine UI styling
   * @default false
   */
  useMantine?: boolean;
}

/**
 * Component that displays a summary of all form errors
 *
 * This component is useful for displaying all form errors in one place,
 * especially for accessibility and for forms with many fields.
 *
 * @example
 * ```tsx
 * <form onSubmit={form.onSubmit(handleSubmit)}>
 *   <FormErrorSummary title="Please correct the following errors:" />
 *   <TextField name="name" />
 *   <TextField name="email" />
 *   <button type="submit">Submit</button>
 * </form>
 * ```
 */
export function FormErrorSummary<T = any>({
  title = "Please fix the following errors:",
  useLabels = true,
  renderError,
  renderList,
  renderTitle,
  focusOnError = false,
  className,
  useMantine = false,
  ...props
}: FormErrorSummaryProps) {
  const form = useFormContext<T>();

  // Get all errors
  const errors = form.errors || {};
  const errorCount = Object.keys(errors).length;

  // Create a list of error objects with field, error, and label
  const errorList = useMemo(() => {
    return Object.entries(errors).map(([field, error]) => {
      const fieldConfig = form.registry.getField(field);
      const label = fieldConfig?.label || field;
      return { field, error, label };
    });
  }, [errors, form.registry]);

  // Focus the first error field when errors are displayed
  React.useEffect(() => {
    if (focusOnError && errorCount > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
      if (element) {
        element.focus();
      }
    }
  }, [errors, errorCount, focusOnError]);

  // Don't render anything if there are no errors
  if (errorCount === 0) return null;

  // If custom render function is provided, use it
  if (renderList) {
    return (
      <div
        className={`form-error-summary ${className || ''}`}
        role="alert"
        aria-live="polite"
        {...props}
      >
        {renderTitle ? renderTitle(title) : <h3 className="form-error-title">{title}</h3>}
        {renderList(errorList)}
      </div>
    );
  }

  // Render with Mantine UI styling
  if (useMantine) {
    return (
      <Alert
        title={title}
        color="red"
        variant="filled"
        className={className}
        role="alert"
        aria-live="polite"
        {...props}
      >
        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
          {errorList.map(({ field, error, label }) => (
            <li key={field}>
              {renderError ? (
                renderError(field, error, label)
              ) : (
                <>
                  <Text component="span" weight={700}>{useLabels ? label : field}:</Text>{' '}
                  <Text component="span">{error}</Text>
                </>
              )}
            </li>
          ))}
        </ul>
      </Alert>
    );
  }

  // Default HTML rendering
  return (
    <div
      className={`form-error-summary ${className || ''}`}
      role="alert"
      aria-live="polite"
      {...props}
    >
      <h3 className="form-error-title">{title}</h3>
      <ul className="form-error-list">
        {errorList.map(({ field, error, label }) => (
          <li key={field} className="form-error-item">
            {renderError ? (
              renderError(field, error, label)
            ) : (
              <>
                <strong>{useLabels ? label : field}:</strong> {error}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Props for the FieldError component
 */
export interface FieldErrorProps {
  /**
   * Field name
   */
  name: string;

  /**
   * Whether to show the error
   * @default true
   */
  showError?: boolean;

  /**
   * Custom renderer for the error
   */
  renderError?: (error: string) => React.ReactNode;

  /**
   * Whether to use Mantine UI styling
   * @default false
   */
  useMantine?: boolean;
}

/**
 * Component that displays an error for a specific field
 */
export function FieldError({
  name,
  showError = true,
  renderError,
  useMantine = false
}: FieldErrorProps) {
  const form = useFormContext();
  const error = form.getInputProps(name).error;

  // Don't render anything if there's no error or showError is false
  if (!error || !showError) return null;

  // If custom render function is provided, use it
  if (renderError) {
    return renderError(error);
  }

  // Render with Mantine UI styling
  if (useMantine) {
    return (
      <Text color="red" size="sm">
        {error}
      </Text>
    );
  }

  // Default HTML rendering
  return (
    <div className="field-error" role="alert">
      {error}
    </div>
  );
}

/**
 * Props for the FormValidationSummary component
 */
export interface FormValidationSummaryProps {
  /**
   * Whether to show errors
   * @default true
   */
  showErrors?: boolean;

  /**
   * Whether to show warnings
   * @default true
   */
  showWarnings?: boolean;

  /**
   * Whether to show success message when form is valid
   * @default false
   */
  showSuccess?: boolean;

  /**
   * Success message to display when form is valid
   * @default "Form is valid"
   */
  successMessage?: string;

  /**
   * Custom renderer for the validation summary
   */
  renderSummary?: (props: {
    isValid: boolean;
    errorCount: number;
    warningCount: number;
    form: FormWithRegistry<any>;
  }) => React.ReactNode;

  /**
   * Whether to use Mantine UI styling
   * @default false
   */
  useMantine?: boolean;
}

/**
 * Component that displays a summary of form validation status
 */
export function FormValidationSummary({
  showErrors = true,
  showWarnings = true,
  showSuccess = false,
  successMessage = "Form is valid",
  renderSummary,
  useMantine = false
}: FormValidationSummaryProps) {
  const form = useFormContext();

  // Get validation status
  const { isValid, errorCount, warningCount } = useMemo(() => {
    const errors = form.errors || {};
    const errorCount = Object.keys(errors).length;
    const isValid = errorCount === 0;

    // Warnings would be implemented in a real system
    const warningCount = 0;

    return { isValid, errorCount, warningCount };
  }, [form]);

  // If custom render function is provided, use it
  if (renderSummary) {
    return renderSummary({
      isValid,
      errorCount,
      warningCount,
      form
    });
  }

  // Don't render anything if there's nothing to show
  if (
    (isValid && !showSuccess) ||
    (!isValid && !showErrors && !showWarnings) ||
    (!isValid && errorCount === 0 && warningCount === 0)
  ) {
    return null;
  }

  // Render with Mantine UI styling
  if (useMantine) {
    if (isValid && showSuccess) {
      return (
        <Alert color="green" title="Success" variant="filled">
          {successMessage}
        </Alert>
      );
    }

    return (
      <Group spacing="md">
        {showErrors && errorCount > 0 && (
          <Badge color="red">{errorCount} error(s)</Badge>
        )}
        {showWarnings && warningCount > 0 && (
          <Badge color="yellow">{warningCount} warning(s)</Badge>
        )}
      </Group>
    );
  }

  // Default HTML rendering
  if (isValid && showSuccess) {
    return (
      <div className="form-validation-success">
        {successMessage}
      </div>
    );
  }

  return (
    <div className="form-validation-summary">
      {showErrors && errorCount > 0 && (
        <div className="form-validation-errors">
          {errorCount} error(s)
        </div>
      )}
      {showWarnings && warningCount > 0 && (
        <div className="form-validation-warnings">
          {warningCount} warning(s)
        </div>
      )}
    </div>
  );
}
