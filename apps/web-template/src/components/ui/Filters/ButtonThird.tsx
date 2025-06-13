'use client';
import { clsx } from 'clsx';
import { type FC } from 'react';

import Button, { type ButtonProps } from './Button';

export interface ButtonThirdProps extends ButtonProps {
  'data-testid'?: string;
}

const ButtonThird: FC<ButtonThirdProps> = ({
  className = 'text-neutral-700 border border-neutral-200 dark:text-neutral-200 dark:border-neutral-700',
  'data-testid': testId = 'button-third',
  ...props
}) => {
  return <Button className={clsx(className)} data-testid={testId} {...props} />;
};

export default ButtonThird;
