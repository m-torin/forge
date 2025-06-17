'use client';

import { Divider, SegmentedControl, Stack, Title } from '@mantine/core';
import { useState } from 'react';

import CategoriesInlineEditDemo from '../inline-edit-demo';
import CategoriesPage from '../page';

export default function CategoriesComparisonPage() {
  const [view, setView] = useState<'both' | 'inline' | 'original'>('both');

  return (
    <Stack gap="xl">
      <div>
        <Title order={2} mb="md">
          Categories Table Comparison
        </Title>
        <SegmentedControl
          value={view}
          onChange={(value) => setView(value as 'both' | 'inline' | 'original')}
          data={[
            { label: 'Show Both', value: 'both' },
            { label: 'Inline Edit Only', value: 'inline' },
            { label: 'Original Only', value: 'original' },
          ]}
          mb="xl"
        />
      </div>

      {(view === 'both' || view === 'inline') && (
        <div>
          <Title order={3} mb="md" c="blue">
            New: DataTable with Inline Editing
          </Title>
          <CategoriesInlineEditDemo />
        </div>
      )}

      {view === 'both' && <Divider my="xl" size="md" />}

      {(view === 'both' || view === 'original') && (
        <div>
          <Title order={3} mb="md" c="gray">
            Original: DataTableV2 with Hierarchical Support
          </Title>
          <CategoriesPage />
        </div>
      )}
    </Stack>
  );
}
