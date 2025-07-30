'use client';

import { AppNav } from '#/ui/app';
import { Container, Portal } from '@mantine/core';

export default function FlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Container size="lg">{children}</Container>

      <Portal target="#applayout-header-left">
        <AppNav />
      </Portal>
    </>
  );
}
