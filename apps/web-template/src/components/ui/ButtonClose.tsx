import { ActionIcon } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import React from 'react';

export interface ButtonCloseProps {
  className?: string;
  iconSize?: number;
  onClick?: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const ButtonClose: React.FC<ButtonCloseProps> = ({ 
  className = '', 
  iconSize = 16, 
  onClick = () => {},
  size = 'sm'
}) => {
  return (
    <ActionIcon
      onClick={onClick}
      variant="subtle"
      color="gray"
      size={size}
      className={className}
      aria-label="Close"
    >
      <IconX size={iconSize} />
    </ActionIcon>
  );
};

export default ButtonClose;