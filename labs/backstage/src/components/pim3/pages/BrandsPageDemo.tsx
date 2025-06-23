'use client';

import { Button } from '@mantine/core';
import { IconBuilding, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { FlatTableLayout } from '../tables/layouts/FlatTableLayout';
import { TreeTableLayout } from '../tables/layouts/TreeTableLayout';
import { ModelActionMenu } from '../menus/ModelActionMenu';
import { ModelDataTable } from '../tables/ModelDataTable';
import { ModelFormDrawer } from '../forms/ModelFormDrawer';
import { ModelLayout } from '../layouts/ModelLayout';

// Mock data for demonstration
const mockBrands = [
  {
    id: '1',
    name: 'Apple Inc.',
    type: 'MANUFACTURER',
    status: 'PUBLISHED',
    productCount: 15,
    displayOrder: 1,
    children: [
      {
        id: '1-1',
        name: 'iPhone',
        type: 'PRODUCT_LINE',
        status: 'PUBLISHED',
        productCount: 8,
        displayOrder: 1,
        children: [],
      },
      {
        id: '1-2',
        name: 'Mac',
        type: 'PRODUCT_LINE',
        status: 'PUBLISHED',
        productCount: 7,
        displayOrder: 2,
        children: [],
      },
    ],
  },
  {
    id: '2',
    name: 'Samsung',
    type: 'MANUFACTURER',
    status: 'PUBLISHED',
    productCount: 12,
    displayOrder: 2,
    children: [],
  },
  {
    id: '3',
    name: 'Best Buy',
    type: 'RETAILER',
    status: 'PUBLISHED',
    productCount: 0,
    displayOrder: 3,
    children: [],
  },
];

export function BrandsPageDemo() {
  const [data, setData] = useState(mockBrands);
  const [layout, setLayout] = useState<'flat' | 'tree'>('tree');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      key: 'name',
      label: 'Brand',
      sortable: true,
      render: (item: any) => item.name,
    },
    {
      key: 'type',
      label: 'Type',
      width: 120,
      render: (item: any) => item.type,
    },
    {
      key: 'status',
      label: 'Status',
      width: 100,
      render: (item: any) => item.status,
    },
    {
      key: 'productCount',
      label: 'Products',
      width: 80,
      render: (item: any) => item.productCount,
    },
    {
      key: 'displayOrder',
      label: 'Order',
      width: 80,
      render: (item: any) => item.displayOrder,
    },
    {
      key: 'actions',
      label: '',
      width: 60,
      render: (item: any) => (
        <ModelActionMenu
          onEdit={() => console.log('Edit', item.id)}
          onDuplicate={() => console.log('Duplicate', item.id)}
          onDelete={() => console.log('Delete', item.id)}
          deleteWarning={{
            title: 'Delete Brand',
            message: `Are you sure you want to delete "${item.name}"?`,
          }}
        />
      ),
    },
  ];

  const renderLayout = (props: any) => {
    if (layout === 'tree') {
      return <TreeTableLayout {...props} />;
    }
    return <FlatTableLayout {...props} />;
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    setDrawerOpened(false);
  };

  const bulkActions = selectedItems.size > 0 && (
    <>
      <Button size="xs" variant="light">
        Bulk Edit
      </Button>
      <Button size="xs" variant="light" color="red">
        Delete Selected
      </Button>
    </>
  );

  return (
    <>
      <ModelLayout
        title="Brand Management"
        description="Manage your brand hierarchy and relationships"
        icon={IconBuilding}
        actions={
          <Button leftSection={<IconPlus size={18} />} onClick={() => setDrawerOpened(true)}>
            Add Brand
          </Button>
        }
        loading={loading}
        showEmptyState={data.length === 0}
        empty={{
          icon: IconBuilding,
          title: 'No brands yet',
          description: 'Create your first brand to get started',
          action: (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setDrawerOpened(true)}
              variant="light"
            >
              Create Brand
            </Button>
          ),
        }}
      >
        <ModelDataTable
          data={data}
          columns={columns}
          layout={layout}
          availableLayouts={['flat', 'tree']}
          onLayoutChange={(newLayout) => setLayout(newLayout as 'flat' | 'tree')}
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          bulkActions={bulkActions}
          renderLayout={renderLayout}
        />
      </ModelLayout>

      <ModelFormDrawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        title="Create Brand"
        subtitle="Add a new brand to your catalog"
        icon={IconBuilding}
        isCreating={true}
        isSaving={loading}
        onSubmit={handleSubmit}
        tabs={[
          {
            value: 'basic',
            label: 'Basic Info',
            icon: IconBuilding,
            content: <div>Basic form fields would go here...</div>,
          },
        ]}
      />
    </>
  );
}
