import React from 'react';

import Button, { type ButtonProps } from './Button';

export interface ButtonSecondaryProps extends ButtonProps {
  'data-testid'?: string;
}

const ButtonSecondary: React.FC<ButtonSecondaryProps> = ({
  'data-testid': testId = 'button-secondary',
  className = 'border border-neutral-300 dark:border-neutral-700',
  ...props
}) => {
  return (
    <Button
      data-testid={testId}
      className={`bg-white text-neutral-700 hover:bg-gray-100 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 ${className}`}
      {...props}
    />
  );
};

export default ButtonSecondary;
