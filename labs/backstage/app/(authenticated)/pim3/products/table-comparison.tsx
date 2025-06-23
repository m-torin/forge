'use client';

import { Divider, SegmentedControl, Stack, Title } from '@mantine/core';
import { useState } from 'react';

import InlineEditExample from './inline-edit-example';
import ProductsPage from './page';

export default function TableComparison() {
  const [view, setView] = useState<'both' | 'inline' | 'original'>('both');

  return (
    <Stack gap="xl">
      <div>
        <Title order={2} mb="md">
          Product Tables Comparison
        </Title>
        <SegmentedControl
          value={view}
          onChange={(value) => setView(value as 'both' | 'inline' | 'original')}
          data={[
            { label: 'Show Both', value: 'both' },
            { label: 'Inline Edit Only', value: 'inline' },
            { label: 'Original Only', value: 'original' },
          ]}
        />
      </div>

      {(view === 'both' || view === 'inline') && (
        <div>
          <Title order={3} mb="md">
            New Table with Inline Editing
          </Title>
          <InlineEditExample />
        </div>
      )}

      {view === 'both' && <Divider my="xl" />}

      {(view === 'both' || view === 'original') && (
        <div>
          <Title order={3} mb="md">
            Original Products Table
          </Title>
          <ProductsPage />
        </div>
      )}
    </Stack>
  );
}
