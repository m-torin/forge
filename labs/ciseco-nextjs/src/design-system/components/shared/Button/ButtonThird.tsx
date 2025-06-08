import clsx from 'clsx';
import React from 'react';

import Button, { type ButtonProps } from './Button';

export interface ButtonThirdProps extends ButtonProps {}

const ButtonThird: React.FC<ButtonThirdProps> = ({
  className = 'text-neutral-700 border border-neutral-200 dark:text-neutral-200 dark:border-neutral-700',
  ...props
}) => {
  return <Button className={clsx(className)} {...props} />;
};

export default ButtonThird;
