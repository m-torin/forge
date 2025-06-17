'use client';

import { Button } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { type FC, type ReactNode } from 'react';

export interface ButtonDropdownProps {
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'filled' | 'light' | 'outline' | 'subtle' | 'transparent' | 'gradient';
  disabled?: boolean;
}

const ButtonDropdown: FC<ButtonDropdownProps> = ({
  children,
  className = '',
  onClick,
  size = 'sm',
  variant = 'outline',
  disabled = false,
  ...args
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      rightSection={<IconChevronDown size={16} />}
      className={`justify-between ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...args}
    >
      {children}
    </Button>
  );
};

export default ButtonDropdown;
