import { AppShell, Badge, Box, Title } from '@mantine/core';
import { redirect } from 'next/navigation';
import { type ReactNode } from 'react';

import { currentUser } from '@repo/auth/server';
import { flag, FLAGS } from '@repo/analytics/server';

import { UserMenu } from './components/user-menu';

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();
  const betaFeature = await flag(FLAGS.ui.betaComponents, user?.id);

  if (!user) {
    return redirect('/sign-in');
  }

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Box
          style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}
          h="100%"
          px="md"
        >
          <Title order={3}>Backstage Admin</Title>
          <UserMenu user={user} />
        </Box>
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
