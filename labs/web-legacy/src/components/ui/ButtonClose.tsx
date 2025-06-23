'use client';

import { ActionIcon } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import React from 'react';

export interface ButtonCloseProps {
  className?: string;
  iconSize?: number;
  onClick?: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  'data-testid'?: string;
}

const ButtonClose: React.FC<ButtonCloseProps> = ({
  className = '',
  iconSize = 16,
  onClick,
  size = 'sm',
  'data-testid': testId = 'button-close',
}) => {
  return (
    <ActionIcon
      onClick={onClick}
      variant="subtle"
      color="gray"
      size={size}
      className={className}
      data-testid={testId}
      aria-label="Close"
    >
      <IconX size={iconSize} />
    </ActionIcon>
  );
};

export default ButtonClose;
