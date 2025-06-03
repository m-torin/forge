'use client';

import { Button, type ButtonProps } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { type ReactNode } from 'react';

interface BackButtonProps extends Omit<ButtonProps, 'leftSection' | 'component'> {
  children?: ReactNode;
  href: string;
}

export function BackButton({
  children = 'Back',
  href,
  mb = 'md',
  variant = 'subtle',
  ...props
}: BackButtonProps) {
  return (
    <Link href={href as any}>
      <Button leftSection={<IconArrowLeft size={16} />} mb={mb} variant={variant} {...props}>
        {children}
      </Button>
    </Link>
  );
}
