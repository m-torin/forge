/**
 * Pure Tailwind Button Component
 *
 * Replaces Mantine Button for auth UI while maintaining design consistency
 */

import { clsx } from 'clsx';
import { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseClasses = [
      'inline-flex items-center justify-center gap-2',
      'font-medium rounded-md transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'select-none',
    ];

    const variantClasses = {
      primary: [
        'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
        'text-white',
        'focus:ring-blue-500',
        'shadow-sm hover:shadow',
      ],
      secondary: [
        'bg-gray-600 hover:bg-gray-700 active:bg-gray-800',
        'text-white',
        'focus:ring-gray-500',
        'shadow-sm hover:shadow',
      ],
      outline: [
        'border border-gray-300 hover:border-gray-400',
        'bg-white hover:bg-gray-50 active:bg-gray-100',
        'text-gray-700',
        'focus:ring-gray-500',
      ],
      ghost: [
        'bg-transparent hover:bg-gray-100 active:bg-gray-200',
        'text-gray-700',
        'focus:ring-gray-500',
      ],
      danger: [
        'bg-red-600 hover:bg-red-700 active:bg-red-800',
        'text-white',
        'focus:ring-red-500',
        'shadow-sm hover:shadow',
      ],
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const widthClasses = fullWidth ? 'w-full' : '';

    const classes = clsx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      widthClasses,
      {
        'cursor-wait': loading,
        'pointer-events-none': loading || disabled,
      },
      className,
    );

    return (
      <button ref={ref} className={classes} disabled={disabled || loading} {...props}>
        {loading ? (
          <>
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
