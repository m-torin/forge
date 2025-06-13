'use client';

import { Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';

interface GoBackButtonProps {
  children: React.ReactNode;
  size?: string;
  variant?: string;
}

export function GoBackButton({ children, size = 'lg', variant = 'light' }: GoBackButtonProps) {
  return (
    <Button
      leftSection={<IconArrowLeft size={16} />}
      size={size}
      variant={variant}
      onClick={() => window.history.back()}
    >
      {children}
    </Button>
  );
}
