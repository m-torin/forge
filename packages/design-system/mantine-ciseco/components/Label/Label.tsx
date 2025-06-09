import clsx from 'clsx';
import React, { type FC } from 'react';

export interface LabelProps {
  children?: React.ReactNode;
  className?: string;
  'data-testid'?: string;
  disabled?: boolean;
  error?: boolean;
  htmlFor?: string;
  required?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const Label: FC<LabelProps> = ({
  'data-testid': testId,
  children,
  className = '',
  disabled = false,
  error = false,
  htmlFor,
  required = false,
  size = 'md',
}) => {
  const sizeClasses = {
    lg: 'text-lg',
    md: 'text-base',
    sm: 'text-sm',
    xs: 'text-xs',
  };

  const labelClasses = clsx(
    'nc-Label font-medium',
    sizeClasses[size],
    {
      'text-gray-400 dark:text-gray-600': disabled,
      'text-neutral-900 dark:text-neutral-200': !error && !disabled,
      'text-red-600 dark:text-red-400': error,
    },
    className,
  );

  return (
    <label data-nc-id="Label" data-testid={testId} htmlFor={htmlFor} className={labelClasses}>
      {children}
      {required && <span className="required-indicator text-red-500 ml-1">*</span>}
    </label>
  );
};

export default Label;
