import React from 'react';

import Button, { type ButtonProps } from './Button';

export interface ButtonSecondaryProps extends ButtonProps, Record<string, any> {
  'data-testid'?: string;
}

const ButtonSecondary: React.FC<ButtonSecondaryProps> = ({
  className = 'border border-neutral-300 dark:border-neutral-700',
  'data-testid': testId = 'button-secondary',
  ...props
}) => {
  return (
    <Button
      className={`bg-white text-neutral-700 hover:bg-gray-100 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 ${className}`}
      data-testid={testId}
      {...props}
    />
  );
};

export default ButtonSecondary;
