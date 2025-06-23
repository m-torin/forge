import { useCallback, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { UseFormReturnType } from '@mantine/form';

interface FormError {
  field?: string;
  message: string;
  type: 'validation' | 'server' | 'network' | 'unknown';
}

interface ServerErrorResponse {
  message?: string;
  fieldErrors?: Record<string, string>;
  code?: string;
  details?: any;
}

/**
 * Enhanced error handling for forms
 * Maps server errors to form fields and provides user-friendly notifications
 */
export function useFormErrors<T>(form: UseFormReturnType<T>) {
  const [errors, setErrors] = useState<FormError[]>([]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors([]);
    form.clearErrors();
  }, [form]);

  // Add a single error
  const addError = useCallback(
    (error: FormError) => {
      setErrors((prev) => [...prev, error]);

      if (error.field) {
        form.setFieldError(error.field, error.message);
      }
    },
    [form],
  );

  // Handle server error responses
  const handleServerError = useCallback(
    (error: any) => {
      clearErrors();

      // Try to parse server error response
      let serverError: ServerErrorResponse = {};

      if (error.response?.data) {
        serverError = error.response.data;
      } else if (error.message) {
        serverError = { message: error.message };
      } else if (typeof error === 'string') {
        serverError = { message: error };
      }

      // Handle field-specific errors
      if (serverError.fieldErrors) {
        Object.entries(serverError.fieldErrors).forEach(([field, message]) => {
          addError({
            field,
            message,
            type: 'server',
          });
        });
      }

      // Handle general error message
      if (serverError.message) {
        const errorMessage = getReadableErrorMessage(serverError.message, serverError.code);

        notifications.show({
          title: 'Form Error',
          message: errorMessage,
          color: 'red',
          autoClose: 5000,
        });

        addError({
          message: errorMessage,
          type: 'server',
        });
      }

      // Handle network errors
      if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
        const message = 'Network error. Please check your connection and try again.';

        notifications.show({
          title: 'Connection Error',
          message,
          color: 'red',
          autoClose: 5000,
        });

        addError({
          message,
          type: 'network',
        });
      }
    },
    [clearErrors, addError],
  );

  // Handle validation errors
  const handleValidationError = useCallback(
    (field: string, message: string) => {
      addError({
        field,
        message,
        type: 'validation',
      });
    },
    [addError],
  );

  // Get user-friendly error messages
  const getReadableErrorMessage = useCallback((message: string, code?: string): string => {
    // Common error code mappings
    const errorMappings: Record<string, string> = {
      UNIQUE_CONSTRAINT: 'This value already exists. Please choose a different one.',
      FOREIGN_KEY_CONSTRAINT: 'Invalid relationship. Please check your selection.',
      NOT_NULL_CONSTRAINT: 'This field is required.',
      CHECK_CONSTRAINT: 'Invalid value for this field.',
      INVALID_JSON: 'Invalid JSON format.',
      UNAUTHORIZED: 'You do not have permission to perform this action.',
      FORBIDDEN: 'Access denied.',
      NOT_FOUND: 'The requested item was not found.',
      TIMEOUT: 'The request timed out. Please try again.',
      RATE_LIMITED: 'Too many requests. Please wait and try again.',
    };

    if (code && errorMappings[code]) {
      return errorMappings[code];
    }

    // Common message patterns
    if (message.includes('unique constraint')) {
      return 'This value already exists. Please choose a different one.';
    }

    if (message.includes('foreign key constraint')) {
      return 'Invalid relationship. Please check your selection.';
    }

    if (message.includes('not null constraint')) {
      return 'This field is required.';
    }

    if (message.includes('timeout')) {
      return 'The request timed out. Please try again.';
    }

    // Return original message if no mapping found
    return message;
  }, []);

  // Check if there are any errors of a specific type
  const hasErrors = (type?: FormError['type']) => {
    if (type) {
      return errors.some((error) => error.type === type);
    }
    return errors.length > 0;
  };

  // Get errors by type
  const getErrors = (type?: FormError['type']) => {
    if (type) {
      return errors.filter((error) => error.type === type);
    }
    return errors;
  };

  // Show success notification
  const showSuccess = useCallback((message: string) => {
    notifications.show({
      title: 'Success',
      message,
      color: 'green',
      autoClose: 3000,
    });
  }, []);

  return {
    errors,
    hasErrors,
    getErrors,
    clearErrors,
    addError,
    handleServerError,
    handleValidationError,
    showSuccess,

    // Convenience getters
    hasServerErrors: hasErrors('server'),
    hasValidationErrors: hasErrors('validation'),
    hasNetworkErrors: hasErrors('network'),

    serverErrors: getErrors('server'),
    validationErrors: getErrors('validation'),
    networkErrors: getErrors('network'),
  };
}
