'use client';

import { Button, Group, SegmentedControl, Stack, Title } from '@mantine/core';
import { useState } from 'react';

import CategoriesPage from './page';
import CategoriesPageV2 from './page-v2';

export default function CategoriesDemo() {
  const [view, setView] = useState<'original' | 'datatablev2'>('datatablev2');

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={3}>Categories Page Demo</Title>
        <SegmentedControl
          value={view}
          onChange={(value) => setView(value as 'original' | 'datatablev2')}
          data={[
            { label: 'Original Implementation', value: 'original' },
            { label: 'DataTableV2 (MRT)', value: 'datatablev2' },
          ]}
        />
      </Group>

      {view === 'original' ? <CategoriesPage /> : <CategoriesPageV2 />}
    </Stack>
  );
}
