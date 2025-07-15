/**
 * Pure Tailwind Alert Component
 *
 * Replaces Mantine Alert for error/info messages
 */

import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCheck,
  IconInfoCircle,
  IconX,
} from '@tabler/icons-react';
import { clsx } from 'clsx';
import { forwardRef } from 'react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  icon?: React.ReactNode;
  withCloseButton?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = 'info',
      title,
      icon,
      withCloseButton = false,
      onClose,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const baseClasses = 'rounded-md p-4 border';

    const variantClasses = {
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      error: 'bg-red-50 border-red-200 text-red-800',
    };

    const defaultIcons = {
      info: <IconInfoCircle size={20} />,
      success: <IconCheck size={20} />,
      warning: <IconAlertTriangle size={20} />,
      error: <IconAlertCircle size={20} />,
    };

    const iconColorClasses = {
      info: 'text-blue-400',
      success: 'text-green-400',
      warning: 'text-yellow-400',
      error: 'text-red-400',
    };

    const displayIcon = icon !== undefined ? icon : defaultIcons[variant];

    const classes = clsx(baseClasses, variantClasses[variant], className);

    return (
      <div ref={ref} className={classes} {...props}>
        <div className="flex">
          {displayIcon && (
            <div className={clsx('flex-shrink-0', iconColorClasses[variant])}>{displayIcon}</div>
          )}

          <div className={clsx('flex-1', displayIcon && 'ml-3')}>
            {title && <h3 className="mb-1 text-sm font-medium">{title}</h3>}

            <div className="text-sm">{children}</div>
          </div>

          {withCloseButton && (
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={onClose}
                  className={clsx(
                    'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                    {
                      'text-blue-500 hover:bg-blue-100 focus:ring-blue-600': variant === 'info',
                      'text-green-500 hover:bg-green-100 focus:ring-green-600':
                        variant === 'success',
                      'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600':
                        variant === 'warning',
                      'text-red-500 hover:bg-red-100 focus:ring-red-600': variant === 'error',
                    },
                  )}
                >
                  <span className="sr-only">Dismiss</span>
                  <IconX size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

Alert.displayName = 'Alert';
