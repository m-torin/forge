'use client';

import {
  ActionIcon,
  AppShell,
  Box,
  Center,
  Container,
  Group,
  Text,
  ThemeIcon,
  useMantineColorScheme,
} from '@mantine/core';
import { IconMoon, IconShieldCheck, IconSun } from '@tabler/icons-react';

export interface AuthLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showLogo?: boolean;
  maxWidth?: number;
  title?: string;
  logoIcon?: React.ReactNode;
}

export function AuthLayout({
  children,
  showHeader = true,
  showLogo = true,
  maxWidth = 420,
  title = 'Auth Management',
  logoIcon = <IconShieldCheck size={24} />,
}: AuthLayoutProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <AppShell header={showHeader ? { height: 60 } : undefined} padding={0}>
      {showHeader && (
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            {showLogo && (
              <Group gap="xs">
                <ThemeIcon size="lg" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
                  {logoIcon}
                </ThemeIcon>
                <Text size="lg" fw={600}>
                  {title}
                </Text>
              </Group>
            )}

            <ActionIcon
              onClick={() => toggleColorScheme()}
              variant="default"
              size="lg"
              aria-label="Toggle color scheme"
            >
              {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
            </ActionIcon>
          </Group>
        </AppShell.Header>
      )}

      <AppShell.Main>
        <Center mih="100vh" py="xl">
          <Container size={maxWidth} w="100%">
            <Box>{children}</Box>
          </Container>
        </Center>
      </AppShell.Main>
    </AppShell>
  );
}
