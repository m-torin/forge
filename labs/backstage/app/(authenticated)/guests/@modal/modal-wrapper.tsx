'use client';

import { Modal } from '@mantine/core';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

interface ModalWrapperProps {
  readonly children: ReactNode;
  readonly title: string;
  readonly size?: string;
}

export function ModalWrapper({ children, title, size = 'lg' }: ModalWrapperProps) {
  const router = useRouter();

  return (
    <Modal opened={true} onClose={() => router.back()} title={title} size={size} centered>
      {children}
    </Modal>
  );
}
