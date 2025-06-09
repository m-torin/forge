import { rem, Skeleton, Stack, Tabs, Text, Title } from '@mantine/core';
import { IconLayoutGrid, IconSearch, IconTable } from '@tabler/icons-react';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import {
  bulkDeleteRecords,
  deleteRecord,
  exportRecords,
  listRecords,
  updateRecord,
} from '../actions';
import { AdvancedSearch } from '../components/AdvancedSearch';
import { BulkEditGrid } from '../components/BulkEditGrid';
import { ResponsiveDataTable } from '../components/ResponsiveDataTable';
import { getModelConfig } from '../lib/model-config';
import { modelConfigs } from '../lib/prisma-model-config';

// Helper function to build where clause from advanced search filters
function buildAdvancedWhere(filters: any[]): any {
  if (!filters || filters.length === 0) {
    return {};
  }

  const conditions: any[] = [];

  for (const filter of filters) {
    const condition = buildFilterCondition(filter);
    if (condition) {
      conditions.push(condition);
    }
  }

  if (conditions.length === 0) {
    return {};
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return { AND: conditions };
}

function buildFilterCondition(filter: any): any {
  const { type, field, operator, value } = filter;

  if (!field || !operator) {
    return null;
  }

  switch (operator) {
    case 'equals':
      return { [field]: { equals: convertValue(value, type) } };
    case 'contains':
      return { [field]: { contains: value, mode: 'insensitive' } };
    case 'startsWith':
      return { [field]: { mode: 'insensitive', startsWith: value } };
    case 'gt':
      return { [field]: { gt: convertValue(value, type) } };
    case 'lt':
      return { [field]: { lt: convertValue(value, type) } };
    case 'isNull':
      return { [field]: { equals: null } };
    case 'isNotNull':
      return { [field]: { not: null } };
    default:
      return null;
  }
}

function convertValue(value: any, type: string): any {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  switch (type) {
    case 'number':
      const num = Number(value);
      return isNaN(num) ? null : num;
    case 'date':
    case 'datetime':
      return new Date(value);
    case 'checkbox':
    case 'switch':
      return Boolean(value);
    default:
      return value;
  }
}

interface PageProps {
  params: { model: string };
  searchParams: {
    page?: string;
    limit?: string;
    filters?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

async function ModelTable({ params, searchParams }: PageProps) {
  const config = getModelConfig(params.model);
  if (!config) {
    notFound();
  }

  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;

  // Parse advanced search filters
  let filters = [];
  try {
    if (searchParams.filters) {
      filters = JSON.parse(decodeURIComponent(searchParams.filters));
    }
  } catch (error) {
    console.error('Failed to parse filters:', error);
  }

  // Build where clause from filters
  const where = buildAdvancedWhere(filters);

  // Build order by from search params
  const orderBy = searchParams.sortBy
    ? { [searchParams.sortBy]: (searchParams.sortOrder || 'desc') as 'asc' | 'desc' }
    : config.defaultOrderBy || { createdAt: 'desc' as 'asc' | 'desc' };

  const data = await listRecords(params.model, {
    include: config.includes,
    limit,
    orderBy,
    page,
    where,
  });

  // Convert columns for responsive table
  const responsiveColumns = config.listColumns.map((col, index) => ({
    hiddenBelow: (index > 3 ? 'sm' : undefined) as 'xs' | 'sm' | 'md' | 'lg' | 'xl' | undefined,
    width: col.width,
    key: col.key,
    label: col.label,
    priority: (index === 0 ? 'high' : index < 3 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
    render: col.render,
    sortable: col.sortable,
  }));

  return (
    <ResponsiveDataTable
      createHref={`/admin/${params.model}/new`}
      editHref={(id) => `/admin/${params.model}/${id}/edit`}
      viewHref={(id) => `/admin/${params.model}/${id}`}
      columns={responsiveColumns}
      modelKey={params.model}
      onBulkDelete={async (ids) => {
        'use server';
        await bulkDeleteRecords(params.model, ids);
      }}
      onDelete={async (id) => {
        'use server';
        await deleteRecord(params.model, id);
      }}
      onExport={async (ids) => {
        'use server';
        return await exportRecords(params.model, 'json');
      }}
      searchPlaceholder={`Search ${config.pluralName.toLowerCase()}...`}
      data={data}
      enableBulkEdit={true}
      title={config.pluralName}
    />
  );
}

async function ModelGrid({ params }: { params: { model: string } }) {
  const config = getModelConfig(params.model);
  if (!config) {
    notFound();
  }

  const data = await listRecords(params.model, {
    include: config.includes,
    limit: 100, // Load more for grid editing
    orderBy: config.defaultOrderBy || { createdAt: 'desc' },
    page: 1,
  });

  // Convert columns for bulk edit grid
  const gridColumns = config.listColumns.map((col) => ({
    width: col.width || 150,
    type: (col.type || 'text') as
      | 'text'
      | 'number'
      | 'select'
      | 'multiselect'
      | 'boolean'
      | 'date'
      | 'readonly',
    editable: col.editable !== false,
    format: col.render,
    key: col.key,
    label: col.label,
    options: col.options,
    required: col.required,
  }));

  return (
    <BulkEditGrid
      columns={gridColumns}
      enableColumnFilter={true}
      enableCopy={true}
      enableExport={true}
      enableUndo={true}
      onDelete={async (ids) => {
        'use server';
        await bulkDeleteRecords(params.model, ids);
      }}
      onSave={async (changes) => {
        'use server';
        // Update multiple records
        await Promise.all(changes.map((record) => updateRecord(params.model, record.id, record)));
      }}
      data={data.records}
      enablePaste={true}
      title={`Edit ${config.pluralName}`}
    />
  );
}

function ModelSearch({ params }: { params: { model: string } }) {
  const config = getModelConfig(params.model);
  const modelConfig = modelConfigs.find((m) => m.name === params.model);

  if (!config || !modelConfig) {
    notFound();
  }

  return (
    <AdvancedSearch
      modelConfig={modelConfig}
      modelName={params.model}
      onReset={() => {
        window.location.href = `/admin/${params.model}?tab=table`;
      }}
      onSearch={(filters, sortBy, sortOrder) => {
        const searchParams = new URLSearchParams();
        if (filters.length > 0) {
          searchParams.set('filters', encodeURIComponent(JSON.stringify(filters)));
        }
        if (sortBy) {
          searchParams.set('sortBy', sortBy);
          searchParams.set('sortOrder', sortOrder || 'desc');
        }
        searchParams.set('page', '1'); // Reset to first page

        // Navigate to table view with search results
        const url = `/admin/${params.model}?tab=table&${searchParams.toString()}`;
        window.location.href = url;
      }}
    />
  );
}

export default function ModelPage({ params, searchParams }: PageProps) {
  const config = getModelConfig(params.model);
  if (!config) {
    notFound();
  }

  return (
    <Stack gap="lg">
      <div>
        <Title order={1}>{config.pluralName}</Title>
        <Text c="dimmed" mt="xs">
          Manage {config.pluralName.toLowerCase()} records
        </Text>
      </div>

      <Tabs defaultValue="table" variant="outline">
        <Tabs.List>
          <Tabs.Tab
            leftSection={<IconTable style={{ width: rem(16), height: rem(16) }} />}
            value="table"
          >
            Table View
          </Tabs.Tab>
          <Tabs.Tab
            leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} />}
            value="search"
          >
            Advanced Search
          </Tabs.Tab>
          <Tabs.Tab
            leftSection={<IconLayoutGrid style={{ width: rem(16), height: rem(16) }} />}
            value="grid"
          >
            Bulk Edit
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel pt="md" value="table">
          <Suspense fallback={<Skeleton height={400} />}>
            <ModelTable params={params} searchParams={searchParams} />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel pt="md" value="search">
          <Suspense fallback={<Skeleton height={400} />}>
            <ModelSearch params={params} />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel pt="md" value="grid">
          <Suspense fallback={<Skeleton height={400} />}>
            <ModelGrid params={params} />
          </Suspense>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
