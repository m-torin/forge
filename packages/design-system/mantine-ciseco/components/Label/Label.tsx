import React, { type FC } from 'react';
import clsx from 'clsx';

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
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const labelClasses = clsx(
    'nc-Label font-medium',
    sizeClasses[size],
    {
      'text-red-600 dark:text-red-400': error,
      'text-gray-400 dark:text-gray-600': disabled,
      'text-neutral-900 dark:text-neutral-200': !error && !disabled,
    },
    className,
  );

  return (
    <label data-nc-id="Label" data-testid={testId} className={labelClasses} htmlFor={htmlFor}>
      {children}
      {required && <span className="required-indicator text-red-500 ml-1">*</span>}
    </label>
  );
};

export default Label;
