import { AppShell, Badge, Box, Group, Title } from '@mantine/core';
import { redirect } from 'next/navigation';
import { type ReactNode } from 'react';

import { flag } from '@repo/analytics-legacy/server';
import { currentUser } from '@repo/auth/server';
import { HeaderSearch } from '@repo/design-system/components/search';

import { UserMenu } from './components/user-menu';

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();
  const betaFeature = await flag('ui.betaComponents', user?.id);

  if (!user) {
    return redirect('/sign-in');
  }

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group align="center" h="100%" justify="space-between" px="md">
          <Title order={3}>Backstage Admin</Title>
          <Group gap="md">
            <HeaderSearch
              onSelect={(item) => {
                // Handle navigation based on search result
                if (item.url) {
                  window.location.href = item.url;
                }
              }}
              placeholder="Search workflows, products, content..."
            />
            <UserMenu user={user} />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        {betaFeature && (
          <Box p="md">
            <Badge fullWidth color="blue" radius="xl" size="lg">
              Beta feature now available
            </Badge>
          </Box>
        )}
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
