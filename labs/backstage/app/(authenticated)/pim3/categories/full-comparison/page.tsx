'use client';

import { Card, Divider, SegmentedControl, Stack, Text, Title } from '@mantine/core';
import { useState } from 'react';

import CategoriesInlineEditDemo from '../inline-edit-demo';
import CategoriesPage from '../page';
import OriginalCategoriesTable from './original-table';

export default function FullComparisonPage() {
  const [view, setView] = useState<'all' | 'original' | 'datatablev2' | 'inline'>('all');

  return (
    <Stack gap="xl">
      <div>
        <Title order={2} mb="md">
          Categories Tables - Full Evolution
        </Title>
        <Text c="dimmed" mb="lg">
          See the progression from original Mantine Table to DataTableV2 to inline editing
        </Text>
        <SegmentedControl
          value={view}
          onChange={(value) => setView(value as unknown as any)}
          data={[
            { label: 'Show All', value: 'all' },
            { label: 'Original Table', value: 'original' },
            { label: 'DataTableV2', value: 'datatablev2' },
            { label: 'Inline Edit', value: 'inline' },
          ]}
          mb="xl"
        />
      </div>

      {(view === 'all' || view === 'original') && (
        <Card withBorder={true}>
          <Title order={3} mb="md" c="orange">
            1. Original Implementation (Mantine Table)
          </Title>
          <Text c="dimmed" size="md" mb="md">
            Using standard Mantine Table component with manual row rendering and custom expansion
            logic
          </Text>
          <OriginalCategoriesTable />
        </Card>
      )}

      {view === 'all' && <Divider my="xl" size="md" />}

      {(view === 'all' || view === 'datatablev2') && (
        <Card withBorder={true}>
          <Title order={3} mb="md" c="gray">
            2. Current Implementation (DataTableV2 with MRT)
          </Title>
          <Text c="dimmed" size="md" mb="md">
            Using Mantine React Table with built-in hierarchical support and advanced features
          </Text>
          <CategoriesPage />
        </Card>
      )}

      {view === 'all' && <Divider my="xl" size="md" />}

      {(view === 'all' || view === 'inline') && (
        <Card withBorder={true}>
          <Title order={3} mb="md" c="blue">
            3. Enhanced Implementation (DataTable with Inline Editing)
          </Title>
          <Text c="dimmed" size="md" mb="md">
            Using enhanced DataTable component with inline row editing capabilities
          </Text>
          <CategoriesInlineEditDemo />
        </Card>
      )}
    </Stack>
  );
}
