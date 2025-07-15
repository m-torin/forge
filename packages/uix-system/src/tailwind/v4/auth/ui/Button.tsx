/**
 * Tailwind v4 RSC Button Component
 * Server-side compatible button with Tailwind v4 styling
 */

import { forwardRef } from 'react';
import type { BaseProps, ButtonSize, ButtonVariant } from '../types';
import { cn } from '../utils/dark-mode';

interface ButtonProps extends BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  formAction?: (formData: FormData) => void;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      type = 'button',
      disabled = false,
      loading = false,
      formAction,
      ...props
    },
    ref,
  ) => {
    // Tailwind v4 button styles using CSS variables
    const baseStyles = [
      'inline-flex items-center justify-center',
      'font-medium transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'select-none',
    ].join(' ');

    const variantStyles = {
      primary: cn(
        'bg-blue-600 hover:bg-blue-700 text-white',
        'focus:ring-blue-500',
        'border-transparent',
        'dark:bg-blue-600 dark:hover:bg-blue-700',
        'dark:focus:ring-blue-500',
      ),
      secondary: cn(
        'bg-gray-100 hover:bg-gray-200 text-gray-900',
        'focus:ring-gray-500',
        'border-transparent',
        'dark:bg-gray-600 dark:hover:bg-gray-700',
        'dark:text-gray-100 dark:focus:ring-gray-500',
      ),
      outline: cn(
        'bg-transparent hover:bg-gray-50 text-gray-700',
        'border border-gray-300 hover:border-gray-400',
        'focus:ring-gray-500',
        'dark:bg-transparent dark:hover:bg-gray-700',
        'dark:text-gray-300 dark:hover:text-gray-100',
        'dark:border-gray-600 dark:hover:border-gray-500',
        'dark:focus:ring-gray-500',
      ),
      ghost: cn(
        'bg-transparent hover:bg-gray-100 text-gray-700',
        'focus:ring-gray-500',
        'border-transparent',
        'dark:bg-transparent dark:hover:bg-gray-700',
        'dark:text-gray-300 dark:hover:text-gray-100',
        'dark:focus:ring-gray-500',
      ),
      destructive: cn(
        'bg-red-600 hover:bg-red-700 text-white',
        'focus:ring-red-500',
        'border-transparent',
        'dark:bg-red-600 dark:hover:bg-red-700',
        'dark:focus:ring-red-500',
      ),
      default: cn(
        'bg-gray-100 hover:bg-gray-200 text-gray-900',
        'focus:ring-gray-500',
        'border-transparent',
        'dark:bg-gray-600 dark:hover:bg-gray-700',
        'dark:text-gray-100 dark:focus:ring-gray-500',
      ),
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-sm rounded-md',
      lg: 'px-6 py-3 text-base rounded-lg',
    };

    const computedClassName = [baseStyles, variantStyles[variant], sizeStyles[size], className]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        className={computedClassName}
        disabled={disabled || loading}
        formAction={formAction}
        {...props}
      >
        {loading && (
          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              className="opacity-25"
            />
            <path
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              className="opacity-75"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
