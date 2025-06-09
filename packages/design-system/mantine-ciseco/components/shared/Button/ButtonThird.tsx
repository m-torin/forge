import clsx from 'clsx';
import React from 'react';

import Button, { type ButtonProps } from './Button';

export interface ButtonThirdProps extends ButtonProps {
  'data-testid'?: string;
}

const ButtonThird: React.FC<ButtonThirdProps> = ({
  'data-testid': testId = 'button-third',
  className = 'text-neutral-700 border border-neutral-200 dark:text-neutral-200 dark:border-neutral-700',
  ...props
}) => {
  return <Button data-testid={testId} className={clsx(className)} {...props} />;
};

export default ButtonThird;
