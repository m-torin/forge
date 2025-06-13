import React from 'react';

import Button, { type ButtonProps } from './Button';

export interface ButtonPrimaryProps extends ButtonProps {
  'data-testid'?: string;
}

function ButtonPrimary({
  className = '',
  'data-testid': testId = 'button-primary',
  ...props
}: ButtonPrimaryProps) {
  return (
    <Button
      className={`bg-neutral-900 text-neutral-50 shadow-xl hover:bg-neutral-800 disabled:bg-neutral-900/90 dark:bg-neutral-100 dark:text-neutral-800 dark:hover:bg-neutral-200 ${className}`}
      data-testid={testId}
      {...props}
    />
  );
}

export default ButtonPrimary;
