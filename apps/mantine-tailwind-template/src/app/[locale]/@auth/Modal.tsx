'use client';

import { Modal as MantineModal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useRouter } from 'next/navigation';

type Props = {
  children: React.ReactNode;
  title?: string;
};

export function Modal({ children, title }: Props) {
  const router = useRouter();
  const [opened, { close }] = useDisclosure(true);

  const handleClose = () => {
    close();
    router.back();
  };

  return (
    <MantineModal
      opened={opened}
      onClose={handleClose}
      title={title}
      centered
      size="md"
      overlayProps={{
        className: 'harmony-transition',
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      styles={{
        content: {
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
        },
        header: {
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: 'var(--spacing-3)',
        },
        title: {
          fontSize: 'var(--font-size-lg)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
        },
        body: {
          padding: 'var(--spacing-6)',
        },
      }}
    >
      {children}
    </MantineModal>
  );
}
