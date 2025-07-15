/**
 * Tailwind v4 RSC Alert Component
 * Server-side compatible alert with Tailwind v4 styling
 */

import type { AlertType, AlertVariant, BaseProps } from '../types';
import { cn } from '../utils/dark-mode';

interface AlertProps extends BaseProps {
  variant?: AlertVariant;
  // Legacy support for 'type' prop
  type?: AlertType;
}

// Extract AlertIcon component to avoid creating new component during render
function AlertIcon({ variant, iconStyles }: { variant: AlertVariant; iconStyles: string }) {
  switch (variant) {
    case 'success':
      return (
        <svg className={`${iconStyles} text-green-400`} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'warning':
      return (
        <svg className={`${iconStyles} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'destructive':
      return (
        <svg className={`${iconStyles} text-red-400`} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return (
        <svg className={`${iconStyles} text-blue-400`} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      );
  }
}

export function Alert({ children, className = '', variant, type }: AlertProps) {
  // Handle both variant and type props for backward compatibility
  let finalVariant: AlertVariant;

  if (variant) {
    finalVariant = variant;
  } else if (type) {
    // Map legacy type to variant
    switch (type) {
      case 'info':
        finalVariant = 'default';
        break;
      case 'success':
        finalVariant = 'success';
        break;
      case 'warning':
        finalVariant = 'warning';
        break;
      case 'error':
        finalVariant = 'destructive';
        break;
      default:
        finalVariant = 'default';
    }
  } else {
    finalVariant = 'default';
  }

  const baseStyles = ['p-4 rounded-md border', 'flex items-start space-x-3'].join(' ');

  const variantStyles = {
    default: cn(
      'bg-blue-50 border-blue-200 text-blue-800',
      'dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
    ),
    success: cn(
      'bg-green-50 border-green-200 text-green-800',
      'dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
    ),
    warning: cn(
      'bg-yellow-50 border-yellow-200 text-yellow-800',
      'dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
    ),
    destructive: cn(
      'bg-red-50 border-red-200 text-red-800',
      'dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
    ),
  };

  const iconStyles = 'flex-shrink-0 w-5 h-5 mt-0.5';

  const computedClassName = [baseStyles, variantStyles[finalVariant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={computedClassName} role="alert">
      <AlertIcon variant={finalVariant} iconStyles={iconStyles} />
      <div className="flex-1 text-sm">{children}</div>
    </div>
  );
}
