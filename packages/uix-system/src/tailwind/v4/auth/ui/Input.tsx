/**
 * Tailwind v4 RSC Input Component
 * Server-side compatible input with Tailwind v4 styling
 */

import { forwardRef } from 'react';
import type { BaseProps, InputType } from '../types';
import { cn } from '../utils/dark-mode';

interface InputProps extends BaseProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: InputType;
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      type = 'text',
      label,
      error,
      description,
      required = false,
      fullWidth = true,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Tailwind v4 input styles with dark mode support
    const baseInputStyles = cn(
      'border border-gray-300 rounded-md shadow-sm',
      'px-3 py-2 text-sm bg-white',
      'placeholder:text-gray-400',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
      'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
      'transition-colors duration-200',
      // Dark mode styles
      'dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100',
      'dark:placeholder:text-gray-400',
      'dark:focus:ring-blue-500 dark:focus:border-blue-500',
      'dark:disabled:bg-gray-800 dark:disabled:text-gray-500',
      fullWidth ? 'w-full' : '',
      error
        ? cn(
            'border-red-300 focus:border-red-500 focus:ring-red-500',
            'dark:border-red-600 dark:focus:border-red-500 dark:focus:ring-red-500',
          )
        : '',
    );

    const labelStyles = cn(
      'block text-sm font-medium text-gray-700 mb-1',
      'dark:text-gray-300',
      required ? "after:content-['*'] after:text-red-500 after:ml-1" : '',
    );

    const errorStyles = cn('mt-1 text-sm text-red-600', 'dark:text-red-400');

    const descriptionStyles = cn('mt-1 text-sm text-gray-500', 'dark:text-gray-400');

    const computedClassName = [baseInputStyles, className].filter(Boolean).join(' ');

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={inputId} className={labelStyles}>
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          className={computedClassName}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${inputId}-error` : description ? `${inputId}-description` : undefined
          }
          {...props}
        />

        {error && (
          <p id={`${inputId}-error`} className={errorStyles} role="alert">
            {error}
          </p>
        )}

        {description && !error && (
          <p id={`${inputId}-description`} className={descriptionStyles}>
            {description}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
