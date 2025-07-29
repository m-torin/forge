'use client';

import { AppShell, Badge, Burger, Container, Group, ScrollArea, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ReactNode } from 'react';
import { BackstageNavigation } from './BackstageNavigation';

export interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  environment?: 'development' | 'preview' | 'production';
  showNavigation?: boolean;
  navigationItems?: ReactNode;
  sidebarContent?: ReactNode;
  'data-testid'?: string;
}

function detectEnvironment(): 'development' | 'preview' | 'production' {
  if (typeof window === 'undefined') return 'development';

  const hostname = window.location.hostname;
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV;

  if (env === 'production') return 'production';
  if (env === 'preview') return 'preview';
  if (hostname === 'localhost' || hostname.includes('localhost')) return 'development';

  return 'development';
}

export function AppLayout({
  children,
  title = 'Backstage',
  description,
  environment,
  showNavigation = false,
  navigationItems,
  sidebarContent,
}: AppLayoutProps & { 'data-testid'?: string }) {
  // Fix props reference
  const props = arguments[0];
  const detectedEnvironment = environment || detectEnvironment();
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      padding={{ base: 'sm', sm: 'md', lg: 'lg' }}
      header={{
        height: showNavigation ? { base: 100, sm: 120, md: 140 } : { base: 48, sm: 60, md: 72 },
      }}
      navbar={
        showNavigation
          ? {
              width: { sm: 100, md: 150, lg: 225 },
              breakpoint: 'sm',
              collapsed: { mobile: !opened, desktop: false },
            }
          : undefined
      }
      transitionDuration={300}
      transitionTimingFunction="ease-in-out"
      data-testid={`${props['data-testid'] || 'app-layout'}`}
    >
      <AppShell.Header withBorder>
        <Container size="xl">
          <Group justify="space-between" h={{ base: 48, sm: 60, md: 72 }}>
            <Group>
              {showNavigation && (
                <Burger
                  opened={opened}
                  onClick={toggle}
                  hiddenFrom="sm"
                  size="sm"
                  data-testid="mobile-nav-toggle"
                />
              )}
              <Title order={3} size="h3" c="bright">
                {title}
              </Title>
              {description && (
                <Text size="sm" c="dimmed" hiddenFrom="xs">
                  {description}
                </Text>
              )}
            </Group>
            {detectedEnvironment !== 'production' && (
              <Badge
                color={detectedEnvironment === 'development' ? 'blue' : 'orange'}
                variant="light"
                size="sm"
              >
                {detectedEnvironment}
              </Badge>
            )}
          </Group>
          {showNavigation &&
            (navigationItems || <BackstageNavigation data-testid="app-navigation" />)}
        </Container>
      </AppShell.Header>

      {showNavigation && (
        <AppShell.Navbar withBorder>
          <AppShell.Section p="md">
            <Text fw={500} size="sm" c="dimmed" mb="sm">
              Navigation
            </Text>
          </AppShell.Section>

          <AppShell.Section grow component={ScrollArea} p="md">
            {sidebarContent || (
              <Text size="sm" c="dimmed" ta="center">
                Navigation items will be rendered here
              </Text>
            )}
          </AppShell.Section>

          <AppShell.Section p="md" bg="var(--mantine-color-gray-light)">
            <Text size="xs" c="dimmed" ta="center" fw={500}>
              Backstage v1.0
            </Text>
          </AppShell.Section>
        </AppShell.Navbar>
      )}

      <AppShell.Main>
        <Container size="xl">{children}</Container>
      </AppShell.Main>
    </AppShell>
  );
}
