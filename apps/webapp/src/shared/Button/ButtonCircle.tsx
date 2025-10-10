import clsx from 'clsx';
import React, { ButtonHTMLAttributes } from 'react';

export type ButtonCircleProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: string;
  colorClassName?: string;
};
const ButtonCircle: React.FC<ButtonCircleProps> = ({
  className,
  size = 'size-9',
  colorClassName = 'bg-neutral-900 text-neutral-50 hover:bg-neutral-800',
  ...props
}) => {
  return (
    <button
      className={clsx(
        'flex items-center justify-center rounded-full leading-none',
        colorClassName,
        className,
        size,
      )}
      {...props}
    />
  );
};

export default ButtonCircle;
