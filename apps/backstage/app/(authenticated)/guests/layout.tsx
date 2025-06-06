'use client';

import { Anchor, AppShell, Burger, Container, Group, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import type { Route } from 'next';
import type { ReactNode } from 'react';

interface AdminLayoutProperties {
  readonly children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProperties): React.ReactElement {
  const pathname = usePathname();
  const [sidebarOpened, { toggle: toggleSidebar }] = useDisclosure();

  const navLinks = [
    { href: '/guests' as Route, label: 'Users' },
    { href: '/guests/organizations' as Route, label: 'Organizations' },
  ];

  // Simplified layout without debug functionality
  const showNavbar = false;

  return (
    <AppShell
      styles={{
        main: {
          minHeight: '100vh',
        },
      }}
      header={{ height: 64 }}
      navbar={
        showNavbar
          ? {
              width: 250,
              breakpoint: 'sm',
              collapsed: { mobile: !sidebarOpened },
            }
          : undefined
      }
      padding="md"
    >
      <AppShell.Header>
        <Container h="100%" size="xl">
          <Group align="center" h="100%" justify="space-between">
            <Group>
              {showNavbar && (
                <Burger hiddenFrom="sm" onClick={toggleSidebar} opened={sidebarOpened} size="sm" />
              )}
              <Title order={3}>Admin Dashboard</Title>
            </Group>
            <Group gap="xl">
              {navLinks.map((link) => (
                <Anchor
                  key={link.href}
                  href={link.href}
                  component={Link}
                  styles={{
                    root: {
                      '&:hover': {
                        color: 'var(--mantine-color-blue-6)',
                        textDecoration: 'none',
                      },
                    },
                  }}
                  c={pathname === link.href ? 'blue' : 'dimmed'}
                  fw={500}
                  size="sm"
                  td="none"
                >
                  {link.label}
                </Anchor>
              ))}
              <Anchor
                href={'/' as Route}
                component={Link}
                styles={{
                  root: {
                    '&:hover': {
                      color: 'var(--mantine-color-blue-6)',
                      textDecoration: 'none',
                    },
                  },
                }}
                c="dimmed"
                fw={500}
                size="sm"
                td="none"
              >
                Exit Admin
              </Anchor>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      {showNavbar && (
        <AppShell.Navbar id="debug-auth-navbar" p="md">
          {/* Portal target for debug-auth sidebar content */}
        </AppShell.Navbar>
      )}

      <AppShell.Main>
        <Container px={showNavbar ? 0 : undefined} size={showNavbar ? '100%' : 'xl'}>
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
