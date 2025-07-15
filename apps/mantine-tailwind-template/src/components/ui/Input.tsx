/**
 * Pure Tailwind Input Components
 *
 * Text input and password input with Mantine-like styling
 */

import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { clsx } from 'clsx';
import { forwardRef, useState } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, description, required, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2)}`;

    const inputClasses = clsx(
      'block w-full rounded-md border-0 py-2 px-3',
      'text-gray-900 placeholder:text-gray-400',
      'ring-1 ring-inset ring-gray-300',
      'focus:ring-2 focus:ring-inset focus:ring-blue-600',
      'transition-all duration-200',
      'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
      {
        'ring-red-500 focus:ring-red-600': error,
        'pl-10': leftIcon,
        'pr-10': rightIcon,
      },
      className,
    );

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="h-5 w-5 text-gray-400">{leftIcon}</span>
            </div>
          )}

          <input ref={ref} id={inputId} className={inputClasses} {...props} />

          {rightIcon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="h-5 w-5 text-gray-400">{rightIcon}</span>
            </div>
          )}
        </div>

        {description && !error && <p className="text-sm text-gray-500">{description}</p>}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

// Password Input Component
export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  visible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ visible: controlledVisible, onVisibilityChange, ...props }, ref) => {
    const [internalVisible, setInternalVisible] = useState(false);

    const isControlled = controlledVisible !== undefined;
    const visible = isControlled ? controlledVisible : internalVisible;

    const toggleVisibility = () => {
      if (isControlled) {
        onVisibilityChange?.(!visible);
      } else {
        setInternalVisible(!visible);
      }
    };

    const VisibilityIcon = visible ? IconEyeOff : IconEye;

    return (
      <Input
        {...props}
        ref={ref}
        type={visible ? 'text' : 'password'}
        rightIcon={
          <button
            type="button"
            onClick={toggleVisibility}
            className="pointer-events-auto transition-colors hover:text-gray-600"
            tabIndex={-1}
          >
            <VisibilityIcon size={18} />
          </button>
        }
      />
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
