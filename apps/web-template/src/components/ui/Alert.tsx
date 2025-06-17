'use client';

import { Alert as MantineAlert } from '@mantine/core';
import { IconCheck, IconExclamationMark, IconInfoCircle, IconX } from '@tabler/icons-react';
import React from 'react';

export interface AlertProps {
  children?: React.ReactNode;
  className?: string;
  onClose?: () => void;
  type?: 'default' | 'warning' | 'info' | 'success' | 'error';
  withCloseButton?: boolean;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'default',
  children = 'Alert Text',
  className = '',
  onClose,
  withCloseButton = true,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'info':
        return <IconInfoCircle size={16} />;
      case 'success':
        return <IconCheck size={16} />;
      case 'error':
        return <IconX size={16} />;
      case 'warning':
        return <IconExclamationMark size={16} />;
      default:
        return <IconInfoCircle size={16} />;
    }
  };

  const getVariant = () => {
    switch (type) {
      case 'error':
        return 'light';
      case 'warning':
        return 'light';
      case 'success':
        return 'light';
      case 'info':
        return 'light';
      default:
        return 'light';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'error':
        return 'red';
      case 'warning':
        return 'yellow';
      case 'success':
        return 'green';
      case 'info':
        return 'blue';
      default:
        return 'gray';
    }
  };

  return (
    <MantineAlert
      variant={getVariant()}
      color={getColor()}
      icon={getIcon()}
      className={className}
      withCloseButton={withCloseButton}
      onClose={onClose}
    >
      {children}
    </MantineAlert>
  );
};

export default Alert;
