/**
 * Pure Tailwind Checkbox Component
 *
 * Replaces Mantine Checkbox with styled native checkbox
 */

import { clsx } from 'clsx';
import { forwardRef } from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      error,
      indeterminate: _indeterminate = false,
      className,
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2)}`;

    const checkboxClasses = clsx(
      'h-4 w-4 rounded border-gray-300 text-blue-600',
      'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      'transition-colors duration-200',
      {
        'opacity-50 cursor-not-allowed': disabled,
        'border-red-500': error,
      },
      className,
    );

    const labelClasses = clsx('text-sm font-medium text-gray-700', {
      'text-gray-400 cursor-not-allowed': disabled,
      'cursor-pointer': !disabled,
    });

    return (
      <div className="space-y-1">
        <div className="flex items-start">
          <div className="flex h-5 items-center">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              className={checkboxClasses}
              disabled={disabled}
              {...props}
            />
          </div>

          {label && (
            <div className="ml-3">
              <label htmlFor={checkboxId} className={labelClasses}>
                {label}
              </label>

              {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
            </div>
          )}
        </div>

        {error && <p className="ml-7 text-sm text-red-600">{error}</p>}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
