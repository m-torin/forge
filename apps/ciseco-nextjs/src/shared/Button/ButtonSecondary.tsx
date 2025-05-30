import Button, { type ButtonProps } from '@/shared/Button/Button';
import React from 'react';

export interface ButtonSecondaryProps extends ButtonProps {}

const ButtonSecondary: React.FC<ButtonSecondaryProps> = ({
  className = 'border border-neutral-300 dark:border-neutral-700',
  ...props
}) => {
  return (
    <Button
      className={`bg-white text-neutral-700 hover:bg-gray-100 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 ${className}`}
      {...props}
    />
  );
};

export default ButtonSecondary;
