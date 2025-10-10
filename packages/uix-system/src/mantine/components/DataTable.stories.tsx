import { Badge, Group, Text } from '@mantine/core';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { expect, userEvent, within } from '@storybook/test';
import {
  IconChartBar,
  IconDatabase,
  IconShoppingCart,
  IconStar,
  IconUserCheck,
  IconUsers,
} from '@tabler/icons-react';

import { DataTable, type Column } from './DataTable';

// Enhanced mock data interfaces
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  status: 'active' | 'inactive' | 'banned';
  lastSeen: string;
  joinedAt: string;
  avatar?: string;
  department?: string;
  permissions?: string[];
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  featured: boolean;
  description?: string;
  sku?: string;
  tags?: string[];
}

interface Order {
  id: string;
  customerName: string;
  orderDate: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: number;
  paymentMethod: string;
}

// Enhanced mock data with more realistic and comprehensive datasets
const generateMockUsers = (count: number = 15): User[] => {
  const names = [
    'John Doe',
    'Jane Smith',
    'Bob Johnson',
    'Alice Brown',
    'Charlie Wilson',
    'Emma Davis',
    'David Miller',
    'Sarah Wilson',
    'Michael Brown',
    'Lisa Johnson',
    'Tom Anderson',
    'Karen White',
    'James Taylor',
    'Maria Garcia',
    'Robert Lee',
  ];
  const roles: User['role'][] = ['admin', 'moderator', 'user'];
  const statuses: User['status'][] = ['active', 'inactive', 'banned'];
  const departments = ['Engineering', 'Marketing', 'Sales', 'Support', 'HR', 'Finance'];

  return Array.from({ length: count }, (_, i) => ({
    id: (i + 1).toString(),
    name: names[i % names.length],
    email: `${names[i % names.length].toLowerCase().replace(' ', '.')}@example.com`,
    role: roles[i % roles.length],
    status: statuses[i % statuses.length],
    lastSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    joinedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    avatar: `https://i.pravatar.cc/40?img=${i + 1}`,
    department: departments[i % departments.length],
    permissions: ['read', 'write', 'delete'].slice(0, Math.floor(Math.random() * 3) + 1),
  }));
};

const generateMockProducts = (count: number = 12): Product[] => {
  const products = [
    'Wireless Headphones',
    'Laptop Stand',
    'Mechanical Keyboard',
    'USB-C Hub',
    'Desk Lamp',
    'Webcam',
    'Mouse Pad',
    'Monitor',
    'Smartphone',
    'Tablet',
    'Smartwatch',
    'Bluetooth Speaker',
  ];
  const categories = ['Electronics', 'Accessories', 'Computing', 'Audio', 'Mobile'];

  return Array.from({ length: count }, (_, i) => ({
    id: (i + 1).toString(),
    name: products[i % products.length],
    category: categories[i % categories.length],
    price: parseFloat((Math.random() * 500 + 50).toFixed(2)),
    stock: Math.floor(Math.random() * 100),
    rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
    featured: Math.random() > 0.7,
    description: `High-quality ${products[i % products.length].toLowerCase()} with premium features.`,
    sku: `SKU-${(i + 1).toString().padStart(4, '0')}`,
    tags: ['bestseller', 'new', 'sale'].slice(0, Math.floor(Math.random() * 2) + 1),
  }));
};

const generateMockOrders = (count: number = 10): Order[] => {
  const customers = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Wilson', 'David Brown'];
  const statuses: Order['status'][] = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ];
  const paymentMethods = ['Credit Card', 'PayPal', 'Bank Transfer', 'Apple Pay', 'Google Pay'];

  return Array.from({ length: count }, (_, i) => ({
    id: `ORD-${(i + 1).toString().padStart(4, '0')}`,
    customerName: customers[i % customers.length],
    orderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: statuses[i % statuses.length],
    total: parseFloat((Math.random() * 500 + 50).toFixed(2)),
    items: Math.floor(Math.random() * 10) + 1,
    paymentMethod: paymentMethods[i % paymentMethods.length],
  }));
};

// Default datasets
const mockUsers = generateMockUsers();
const mockProducts = generateMockProducts();
const mockOrders = generateMockOrders();

// Enhanced column configurations
const userColumns: Column<User>[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    width: 200,
    render: (value, row) => (
      <Group gap="xs">
        {row.avatar && (
          <img
            src={row.avatar}
            alt={value}
            style={{ width: 32, height: 32, borderRadius: '50%' }}
          />
        )}
        <div>
          <Text fw={500} size="sm">
            {value}
          </Text>
          <Text size="xs" c="dimmed">
            {row.department}
          </Text>
        </div>
      </Group>
    ),
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
    width: 250,
  },
  {
    key: 'role',
    label: 'Role',
    sortable: true,
    render: value => (
      <Badge
        color={value === 'admin' ? 'red' : value === 'moderator' ? 'blue' : 'gray'}
        variant="light"
        size="sm"
      >
        {value}
      </Badge>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: value => (
      <Badge
        color={value === 'active' ? 'green' : value === 'inactive' ? 'yellow' : 'red'}
        variant="light"
        size="sm"
      >
        {value}
      </Badge>
    ),
  },
  {
    key: 'lastSeen',
    label: 'Last Seen',
    sortable: true,
    render: value => new Date(value).toLocaleDateString(),
  },
];

const productColumns: Column<Product>[] = [
  {
    key: 'name',
    label: 'Product',
    sortable: true,
    width: 200,
    render: (value, row) => (
      <Group gap="xs">
        <Text fw={500}>{value}</Text>
        {row.featured && <IconStar size={16} style={{ color: 'gold' }} />}
      </Group>
    ),
  },
  {
    key: 'category',
    label: 'Category',
    sortable: true,
  },
  {
    key: 'price',
    label: 'Price',
    sortable: true,
    render: value => (
      <Text fw={600} c="green">
        ${value}
      </Text>
    ),
  },
  {
    key: 'stock',
    label: 'Stock',
    sortable: true,
    render: value => (
      <Badge
        color={value === 0 ? 'red' : value < 10 ? 'orange' : 'green'}
        variant="light"
        size="sm"
      >
        {value} units
      </Badge>
    ),
  },
  {
    key: 'rating',
    label: 'Rating',
    sortable: true,
    render: value => `${value} ⭐`,
  },
];

const orderColumns: Column<Order>[] = [
  {
    key: 'id',
    label: 'Order ID',
    sortable: true,
    width: 120,
    render: value => (
      <Text ff="monospace" size="sm">
        {value}
      </Text>
    ),
  },
  {
    key: 'customerName',
    label: 'Customer',
    sortable: true,
    width: 180,
  },
  {
    key: 'orderDate',
    label: 'Date',
    sortable: true,
    render: value => new Date(value).toLocaleDateString(),
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: value => (
      <Badge
        color={
          value === 'delivered'
            ? 'green'
            : value === 'shipped'
              ? 'blue'
              : value === 'processing'
                ? 'orange'
                : value === 'cancelled'
                  ? 'red'
                  : 'gray'
        }
        variant="light"
        size="sm"
      >
        {value}
      </Badge>
    ),
  },
  {
    key: 'total',
    label: 'Total',
    sortable: true,
    render: value => (
      <Text fw={600} c="green">
        ${value}
      </Text>
    ),
  },
  {
    key: 'items',
    label: 'Items',
    sortable: true,
    render: value => `${value} items`,
  },
];

// Enhanced wrapper component for consistent testing
const DataTableWrapper = ({
  onRowClick,
  onSearch,
  onSort,
  onSelect,
  onBulkAction,
  testId = 'data-table',
  ...props
}: any) => {
  const handleRowClick = (row: any) => {
    onRowClick?.(row);
    action('rowClick')(row);
  };

  const handleSearch = (value: string) => {
    onSearch?.(value);
    action('search')(value);
  };

  const handleSort = (column: string, direction: string) => {
    onSort?.(column, direction);
    action('sort')({ column, direction });
  };

  const handleSelect = (selectedRows: any[]) => {
    onSelect?.(selectedRows);
    action('select')(selectedRows);
  };

  const handleBulkAction = (action: string, rows: any[]) => {
    onBulkAction?.(action, rows);
    action('bulkAction')({ action, rows });
  };

  return (
    <div data-testid={testId} style={{ minHeight: '400px' }}>
      <DataTable {...props} onRowClick={handleRowClick} />
    </div>
  );
};

const meta: Meta<typeof DataTable> = {
  title: 'Mantine/DataTable',
  component: DataTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# DataTable Component

A comprehensive, feature-rich data table component built with Mantine UI that provides sorting, filtering, pagination, row selection, and bulk actions.

## Features

### Core Functionality
- **Sorting**: Click column headers to sort data ascending/descending
- **Searching**: Built-in search functionality across all data fields
- **Pagination**: Automatic pagination with configurable page sizes
- **Row Selection**: Individual and bulk row selection with checkboxes
- **Loading States**: Skeleton loading with configurable row counts

### Advanced Features
- **Bulk Actions**: Custom bulk actions for selected rows
- **Row Actions**: Dropdown menu with view/edit/delete/custom actions
- **Empty States**: Customizable empty state messaging and icons
- **Responsive Design**: Horizontal scrolling for mobile devices
- **Custom Rendering**: Column-specific render functions for complex data
- **Row Clicks**: Optional row click handlers for navigation

### Data Types Supported
- **Text**: Basic string data with optional formatting
- **Numbers**: Numeric data with custom formatting (currency, units)
- **Dates**: Date/time data with localized formatting
- **Status**: Badge components for status indicators
- **Complex Objects**: Custom render functions for complex data structures

## Usage Examples

Perfect for admin dashboards, data management interfaces, and any application requiring tabular data display with interactive features.
        `,
      },
    },
  },
  argTypes: {
    // Data Configuration
    data: {
      control: 'object',
      description: 'Array of data objects to display',
      table: { category: 'Data' },
    },
    columns: {
      control: 'object',
      description: 'Column configuration array',
      table: { category: 'Data' },
    },

    // Display Options
    loading: {
      control: 'boolean',
      description: 'Show loading skeleton',
      table: { category: 'Display' },
    },
    searchable: {
      control: 'boolean',
      description: 'Enable search functionality',
      table: { category: 'Display' },
    },
    sortable: {
      control: 'boolean',
      description: 'Enable column sorting',
      table: { category: 'Display' },
    },
    selectable: {
      control: 'boolean',
      description: 'Enable row selection',
      table: { category: 'Display' },
    },

    // Layout & Styling
    minWidth: {
      control: { type: 'range', min: 300, max: 1200, step: 50 },
      description: 'Minimum table width for scrolling',
      table: { category: 'Layout' },
    },
    skeletonRows: {
      control: { type: 'range', min: 1, max: 10, step: 1 },
      description: 'Number of skeleton rows when loading',
      table: { category: 'Layout' },
    },

    // Search & Filters
    searchPlaceholder: {
      control: 'text',
      description: 'Search input placeholder text',
      table: { category: 'Search' },
    },

    // Interaction
    onRowClick: {
      action: 'rowClick',
      description: 'Callback when row is clicked',
      table: { category: 'Events' },
    },

    // Empty States
    emptyState: {
      control: 'object',
      description: 'Configuration for empty state display',
      table: { category: 'States' },
    },

    // Actions
    actions: {
      control: 'object',
      description: 'Row action configuration',
      table: { category: 'Actions' },
    },
    bulkActions: {
      control: 'object',
      description: 'Bulk action configuration',
      table: { category: 'Actions' },
    },

    // Pagination
    pagination: {
      control: 'object',
      description: 'Pagination configuration',
      table: { category: 'Pagination' },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive Playground Story
export const Playground: Story = {
  render: args => <DataTableWrapper {...args} />,
  args: {
    data: mockUsers,
    columns: userColumns,
    loading: false,
    searchable: true,
    sortable: true,
    selectable: true,
    minWidth: 800,
    skeletonRows: 5,
    searchPlaceholder: 'Search users...',
    actions: {
      onView: action('view'),
      onEdit: action('edit'),
      onDelete: action('delete'),
      custom: [
        {
          icon: <IconUserCheck size={14} />,
          label: 'Verify User',
          onClick: action('verify'),
          color: 'blue',
        },
      ],
    },
    bulkActions: [
      {
        label: 'Export Selected',
        onClick: action('export'),
        color: 'blue',
      },
      {
        label: 'Delete Selected',
        onClick: action('bulkDelete'),
        color: 'red',
      },
    ],
    emptyState: {
      icon: IconUsers,
      title: 'No users found',
      description: 'Try adjusting your search criteria.',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByTestId('data-table');

    // Verify table renders
    await expect(table).toBeInTheDocument();

    // Test search functionality
    const searchInput = canvas.getByPlaceholderText('Search users...');
    await userEvent.type(searchInput, 'john');

    // Test row selection
    const checkboxes = canvas.getAllByRole('checkbox');
    if (checkboxes.length > 1) {
      await userEvent.click(checkboxes[1]); // Select first row
    }

    // Test sorting
    const nameHeader = canvas.getByText('Name');
    await userEvent.click(nameHeader);
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive playground with all DataTable features enabled. Try searching, sorting, selecting rows, and using the action menus.',
      },
    },
  },
};

// Basic Usage Stories
export const BasicUsage: Story = {
  render: () => <DataTableWrapper data={mockUsers.slice(0, 5)} columns={userColumns} />,
  parameters: {
    docs: {
      description: {
        story: 'Basic DataTable with minimal configuration - just data and columns.',
      },
    },
  },
};

export const WithSearchAndSort: Story = {
  render: () => (
    <DataTableWrapper
      data={mockUsers}
      columns={userColumns}
      searchable={true}
      sortable={true}
      searchPlaceholder="Search users..."
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'DataTable with search and sorting enabled. Click column headers to sort, use search to filter.',
      },
    },
  },
};

export const WithRowActions: Story = {
  render: () => (
    <DataTableWrapper
      data={mockUsers.slice(0, 8)}
      columns={userColumns}
      actions={{
        onView: action('view'),
        onEdit: action('edit'),
        onDelete: action('delete'),
        custom: [
          {
            icon: <IconUserCheck size={14} />,
            label: 'Verify User',
            onClick: action('verify'),
            color: 'blue',
          },
        ],
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'DataTable with row action menus. Click the three-dot menu to access actions.',
      },
    },
  },
};

export const WithRowSelection: Story = {
  render: () => (
    <DataTableWrapper
      data={mockUsers.slice(0, 8)}
      columns={userColumns}
      selectable={true}
      bulkActions={[
        {
          label: 'Export Selected',
          onClick: action('export'),
          color: 'blue',
        },
        {
          label: 'Activate Users',
          onClick: action('activate'),
          color: 'green',
        },
        {
          label: 'Delete Selected',
          onClick: action('bulkDelete'),
          color: 'red',
        },
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'DataTable with row selection and bulk actions. Select rows to see bulk action buttons.',
      },
    },
  },
};

// Data Type Demonstrations
export const ProductCatalog: Story = {
  render: () => (
    <DataTableWrapper
      data={mockProducts}
      columns={productColumns}
      searchable={true}
      sortable={true}
      searchPlaceholder="Search products..."
      actions={{
        onView: action('viewProduct'),
        onEdit: action('editProduct'),
        onDelete: action('deleteProduct'),
        custom: [
          {
            icon: <IconStar size={14} />,
            label: 'Feature Product',
            onClick: action('featureProduct'),
            color: 'yellow',
          },
        ],
      }}
      emptyState={{
        icon: IconShoppingCart,
        title: 'No products found',
        description: 'Add products to your catalog to get started.',
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Product catalog table demonstrating complex rendering with badges, currency formatting, and custom icons.',
      },
    },
  },
};

export const OrderManagement: Story = {
  render: () => (
    <DataTableWrapper
      data={mockOrders}
      columns={orderColumns}
      searchable={true}
      sortable={true}
      selectable={true}
      searchPlaceholder="Search orders..."
      actions={{
        onView: action('viewOrder'),
        onEdit: action('editOrder'),
        custom: [
          {
            icon: <IconChartBar size={14} />,
            label: 'View Analytics',
            onClick: action('viewAnalytics'),
            color: 'blue',
          },
        ],
      }}
      bulkActions={[
        {
          label: 'Export Orders',
          onClick: action('exportOrders'),
          color: 'blue',
        },
        {
          label: 'Mark as Shipped',
          onClick: action('markShipped'),
          color: 'green',
        },
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Order management table with order IDs, status badges, and bulk operations.',
      },
    },
  },
};

// State Demonstrations
export const LoadingState: Story = {
  render: () => (
    <DataTableWrapper data={mockUsers} columns={userColumns} loading={true} skeletonRows={6} />
  ),
  parameters: {
    docs: {
      description: {
        story: 'DataTable loading state with skeleton placeholders.',
      },
    },
  },
};

export const EmptyState: Story = {
  render: () => (
    <DataTableWrapper
      data={[]}
      columns={userColumns}
      emptyState={{
        icon: IconUsers,
        title: 'No users found',
        description:
          'There are no users to display at the moment. Try adding some users or adjusting your search criteria.',
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'DataTable empty state with custom messaging and icon.',
      },
    },
  },
};

export const NoSearchResults: Story = {
  render: () => {
    // Filter data to simulate no results
    const filteredData = mockUsers.filter(user => user.name.includes('XYZ123'));

    return (
      <DataTableWrapper
        data={filteredData}
        columns={userColumns}
        searchable={true}
        emptyState={{
          icon: IconDatabase,
          title: 'No results found',
          description:
            'No users match your search criteria. Try different keywords or clear your search.',
        }}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'DataTable when search returns no results, showing appropriate empty state messaging.',
      },
    },
  },
};

// Layout and Sizing Stories
export const CompactTable: Story = {
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      <DataTableWrapper
        data={mockUsers.slice(0, 5)}
        columns={userColumns.slice(0, 3)} // Show fewer columns
        minWidth={500}
        searchable={true}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Compact DataTable with fewer columns and smaller container, demonstrating responsive behavior.',
      },
    },
  },
};

export const WideTable: Story = {
  render: () => (
    <div style={{ width: '100%', maxWidth: '1400px' }}>
      <DataTableWrapper
        data={mockUsers}
        columns={userColumns}
        minWidth={1200}
        searchable={true}
        sortable={true}
        selectable={true}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Wide DataTable with all columns visible, demonstrating layout on larger screens.',
      },
    },
  },
};

export const ScrollableTable: Story = {
  render: () => (
    <div
      style={{
        width: '400px',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <DataTableWrapper data={mockUsers} columns={userColumns} minWidth={800} searchable={true} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'DataTable in a narrow container demonstrating horizontal scrolling behavior.',
      },
    },
  },
};

// Advanced Interaction Stories
export const RowClickNavigation: Story = {
  render: () => (
    <DataTableWrapper
      data={mockUsers.slice(0, 8)}
      columns={userColumns}
      onRowClick={row => {
        action('navigateToUser')(row);
        // In real app: navigate(`/users/${row.id}`);
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test row click
    const firstRow = canvas.getAllByRole('row')[1]; // Skip header row
    await userEvent.click(firstRow);
  },
  parameters: {
    docs: {
      description: {
        story:
          'DataTable with row click handlers for navigation. Click any row to trigger navigation.',
      },
    },
  },
};

export const CustomColumnRendering: Story = {
  render: () => {
    const customColumns: Column<User>[] = [
      {
        key: 'name',
        label: 'User Profile',
        sortable: true,
        width: 300,
        render: (value, row) => (
          <Group gap="md">
            <img
              src={row.avatar || `https://i.pravatar.cc/40?u=${row.id}`}
              alt={value}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '2px solid #e9ecef',
              }}
            />
            <div>
              <Text fw={600} size="sm">
                {value}
              </Text>
              <Text size="xs" c="dimmed">
                {row.email}
              </Text>
              <Group gap={4} mt={2}>
                {row.permissions?.map(permission => (
                  <Badge key={permission} size="xs" variant="dot">
                    {permission}
                  </Badge>
                ))}
              </Group>
            </div>
          </Group>
        ),
      },
      {
        key: 'role',
        label: 'Role & Department',
        sortable: true,
        render: (value, row) => (
          <div>
            <Badge
              color={value === 'admin' ? 'red' : value === 'moderator' ? 'blue' : 'gray'}
              variant="light"
              size="sm"
              mb={4}
            >
              {value}
            </Badge>
            <Text size="xs" c="dimmed">
              {row.department}
            </Text>
          </div>
        ),
      },
      {
        key: 'status',
        label: 'Status & Activity',
        sortable: true,
        render: (value, row) => (
          <div>
            <Badge
              color={value === 'active' ? 'green' : value === 'inactive' ? 'yellow' : 'red'}
              variant="light"
              size="sm"
              mb={4}
            >
              {value}
            </Badge>
            <Text size="xs" c="dimmed">
              Last seen: {new Date(row.lastSeen).toLocaleDateString()}
            </Text>
          </div>
        ),
      },
    ];

    return (
      <DataTableWrapper
        data={mockUsers.slice(0, 6)}
        columns={customColumns}
        searchable={true}
        minWidth={900}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'DataTable with heavily customized column rendering showcasing complex layouts with images, badges, and nested information.',
      },
    },
  },
};

// Performance and Edge Cases
export const LargeDataset: Story = {
  render: () => (
    <DataTableWrapper
      data={generateMockUsers(100)}
      columns={userColumns}
      searchable={true}
      sortable={true}
      selectable={true}
      searchPlaceholder="Search 100 users..."
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'DataTable with 100+ rows demonstrating performance with larger datasets. Includes pagination and efficient rendering.',
      },
    },
  },
};

export const VariableDataTypes: Story = {
  render: () => {
    // Create mixed data types for testing edge cases
    const mixedUsers = mockUsers.map((user, index) => ({
      ...user,
      // Add some null/undefined values to test edge cases
      department: index % 4 === 0 ? undefined : user.department,
      avatar: index % 3 === 0 ? undefined : user.avatar,
      permissions: index % 5 === 0 ? [] : user.permissions,
    }));

    return (
      <DataTableWrapper
        data={mixedUsers.slice(0, 8)}
        columns={userColumns}
        searchable={true}
        sortable={true}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'DataTable handling various data edge cases including null/undefined values and empty arrays.',
      },
    },
  },
};

// Accessibility Testing Story
export const AccessibilityDemo: Story = {
  render: () => (
    <DataTableWrapper
      data={mockUsers.slice(0, 6)}
      columns={userColumns}
      searchable={true}
      sortable={true}
      selectable={true}
      testId="accessibility-table"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test keyboard navigation
    const table = canvas.getByTestId('accessibility-table');
    await expect(table).toBeInTheDocument();

    // Test search accessibility
    const searchInput = canvas.getByRole('textbox');
    await expect(searchInput).toBeAccessible();

    // Test table accessibility
    const tableElement = canvas.getByRole('table');
    await expect(tableElement).toBeAccessible();

    // Test checkbox accessibility
    const checkboxes = canvas.getAllByRole('checkbox');
    for (const checkbox of checkboxes) {
      await expect(checkbox).toBeAccessible();
    }
  },
  parameters: {
    docs: {
      description: {
        story:
          'DataTable accessibility demonstration with ARIA labels, keyboard navigation, and screen reader support.',
      },
    },
  },
};

// Complete Dashboard Story
export const DashboardDemo: Story = {
  render: () => (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700' }}>
          User Management Dashboard
        </h2>
        <Text c="dimmed">Complete user management interface with all DataTable features</Text>
      </div>

      <DataTableWrapper
        data={mockUsers}
        columns={userColumns}
        searchable={true}
        sortable={true}
        selectable={true}
        searchPlaceholder="Search users by name, email, role..."
        actions={{
          onView: action('viewUser'),
          onEdit: action('editUser'),
          onDelete: action('deleteUser'),
          custom: [
            {
              icon: <IconUserCheck size={14} />,
              label: 'Verify User',
              onClick: action('verifyUser'),
              color: 'blue',
            },
            {
              icon: <IconChartBar size={14} />,
              label: 'View Analytics',
              onClick: action('viewAnalytics'),
              color: 'violet',
            },
          ],
        }}
        bulkActions={[
          {
            label: 'Export Selected',
            onClick: action('exportUsers'),
            color: 'blue',
          },
          {
            label: 'Send Notification',
            onClick: action('sendNotification'),
            color: 'orange',
          },
          {
            label: 'Bulk Edit Roles',
            onClick: action('bulkEditRoles'),
            color: 'green',
          },
          {
            label: 'Deactivate Selected',
            onClick: action('deactivateUsers'),
            color: 'red',
          },
        ]}
        onRowClick={action('navigateToUserProfile')}
        emptyState={{
          icon: IconUsers,
          title: 'No users found',
          description: 'Start by inviting team members or adjusting your search criteria.',
        }}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'Complete dashboard implementation showing DataTable in a real-world admin interface context with all features enabled.',
      },
    },
  },
};
