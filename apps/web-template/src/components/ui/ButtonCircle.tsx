import { ActionIcon } from '@mantine/core';
import React, { type ButtonHTMLAttributes } from 'react';

export interface ButtonCircleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const ButtonCircle: React.FC<ButtonCircleProps> = ({ 
  className = '', 
  size = 'md',
  children,
  ...args 
}) => {
  return (
    <ActionIcon
      size={size}
      radius="xl"
      variant="filled"
      color="dark"
      className={className}
      {...args}
    >
      {children}
    </ActionIcon>
  );
};

export default ButtonCircle;