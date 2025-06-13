'use client';

import { Button, Group } from '@mantine/core';
import { IconArrowRight, IconSearch } from '@tabler/icons-react';
import Link from 'next/link';

interface ZeroStateActionsProps {
  homeLabel?: string;
  locale: string;
  searchLabel?: string;
}

export function ZeroStateActions({
  homeLabel = 'Go Home',
  locale,
  searchLabel = 'Search',
}: ZeroStateActionsProps) {
  return (
    <Group gap="md">
      <Button
        component={Link}
        href={`/${locale}`}
        leftSection={<IconArrowRight size={16} />}
        variant="light"
      >
        {homeLabel}
      </Button>
      <Button
        component={Link}
        href={`/${locale}/search`}
        leftSection={<IconSearch size={16} />}
        variant="light"
      >
        {searchLabel}
      </Button>
    </Group>
  );
}
