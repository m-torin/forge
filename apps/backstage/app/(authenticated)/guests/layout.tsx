import { AppShell, Container, Group, Title } from '@mantine/core';
import Link from 'next/link';

import type { Route } from 'next';
import type { ReactNode } from 'react';

import { TabNavigation } from './TabNavigation';

interface GuestsLayoutProperties {
  readonly children: ReactNode;
  readonly modal: ReactNode;
}

export default function GuestsLayout({ 
  children, 
  modal 
}: GuestsLayoutProperties): React.ReactElement {
  return (
    <AppShell
      styles={{
        main: {
          minHeight: '100vh',
        },
      }}
      header={{ height: 64 }}
      padding="md"
    >
      <AppShell.Header>
        <Container h="100%" size="xl">
          <Group align="center" h="100%" justify="space-between">
            <Title order={3}>System Management</Title>
            <Group gap="xl">
              <Link
                href={'/' as Route}
                style={{
                  color: 'var(--mantine-color-dimmed)',
                  fontWeight: 500,
                  fontSize: 'var(--mantine-font-size-sm)',
                  textDecoration: 'none',
                }}
              >
                Exit Admin
              </Link>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="xl">
          <TabNavigation />
          {children}
        </Container>
      </AppShell.Main>
      
      {/* Modal slot for intercepting routes */}
      {modal}
    </AppShell>
  );
}