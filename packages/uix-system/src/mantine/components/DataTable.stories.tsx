import { Badge, Group, Text } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { IconStar, IconUserCheck, IconUsers } from '@tabler/icons-react';
import { DataTable, type Column } from './DataTable';

// Mock data types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'banned';
  lastSeen: string;
  joinedAt: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  featured: boolean;
}

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    status: 'active',
    lastSeen: '2024-01-28T14:30:00Z',
    joinedAt: '2023-06-15T09:00:00Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    status: 'active',
    lastSeen: '2024-01-27T16:45:00Z',
    joinedAt: '2023-08-22T11:15:00Z',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'moderator',
    status: 'inactive',
    lastSeen: '2024-01-20T10:15:00Z',
    joinedAt: '2023-05-10T14:30:00Z',
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'user',
    status: 'banned',
    lastSeen: '2024-01-15T08:20:00Z',
    joinedAt: '2023-09-05T16:45:00Z',
  },
  {
    id: '5',
    name: 'Charlie Wilson',
    email: 'charlie@example.com',
    role: 'user',
    status: 'active',
    lastSeen: '2024-01-28T12:00:00Z',
    joinedAt: '2023-07-18T13:20:00Z',
  },
];

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    category: 'Electronics',
    price: 199.99,
    stock: 45,
    rating: 4.5,
    featured: true,
  },
  {
    id: '2',
    name: 'Laptop Stand',
    category: 'Accessories',
    price: 89.99,
    stock: 23,
    rating: 4.2,
    featured: false,
  },
  {
    id: '3',
    name: 'Mechanical Keyboard',
    category: 'Electronics',
    price: 159.99,
    stock: 0,
    rating: 4.8,
    featured: true,
  },
];

// User table columns
const userColumns: Column<User>[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    width: 200,
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

// Product table columns
const productColumns: Column<Product>[] = [
  {
    key: 'name',
    label: 'Product',
    sortable: true,
    width: 200,
    render: (value, row) => (
      <Group gap="xs">
        <Text fw={500}>{value}</Text>
        {row.featured && <IconStar size={16} color="gold" />}
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
    render: value => `$${value}`,
  },
  {
    key: 'stock',
    label: 'Stock',
    sortable: true,
    render: value => <Text c={value === 0 ? 'red' : value < 10 ? 'orange' : 'green'}>{value}</Text>,
  },
  {
    key: 'rating',
    label: 'Rating',
    sortable: true,
    render: value => `${value} ⭐`,
  },
];

const meta: Meta<typeof DataTable> = {
  title: 'Components/DataTable',
  component: DataTable,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'desktop',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    loading: { control: 'boolean' },
    searchable: { control: 'boolean' },
    sortable: { control: 'boolean' },
    selectable: { control: 'boolean' },
    skeletonRows: { control: 'number' },
    minWidth: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock handlers
const mockView = (row: any) => {
  // console.log('View:', row);
};
const mockEdit = (row: any) => {
  // console.log('Edit:', row);
};
const mockDelete = (row: any) => {
  // console.log('Delete:', row);
};
const mockBulkAction = (rows: any[]) => {
  // console.log('Bulk action:', rows);
};
const mockRowClick = (row: any) => {
  // console.log('Row clicked:', row);
};

export const BasicTable: Story = {
  args: {
    data: mockUsers,
    columns: userColumns,
  },
};

export const WithActions: Story = {
  args: {
    data: mockUsers,
    columns: userColumns,
    actions: {
      onView: mockView,
      onEdit: mockEdit,
      onDelete: mockDelete,
    },
  },
};

export const WithSelection: Story = {
  args: {
    data: mockUsers,
    columns: userColumns,
    selectable: true,
    bulkActions: [
      {
        label: 'Activate Users',
        onClick: mockBulkAction,
        color: 'green',
      },
      {
        label: 'Delete Selected',
        onClick: mockBulkAction,
        color: 'red',
      },
    ],
  },
};

export const ProductTable: Story = {
  args: {
    data: mockProducts,
    columns: productColumns,
    searchPlaceholder: 'Search products...',
    actions: {
      onView: mockView,
      onEdit: mockEdit,
      onDelete: mockDelete,
      custom: [
        {
          icon: <IconStar size={14} />,
          label: 'Feature Product',
          onClick: (row: any) => {
            // console.log('Feature product:', row);
          },
          color: 'yellow',
        },
      ],
    },
  },
};

export const EmptyState: Story = {
  args: {
    data: [],
    columns: userColumns,
    emptyState: {
      icon: IconUsers,
      title: 'No users found',
      description: 'There are no users to display at the moment.',
    },
  },
};

export const Loading: Story = {
  args: {
    data: mockUsers,
    columns: userColumns,
    loading: true,
    skeletonRows: 3,
  },
};

export const CustomConfiguration: Story = {
  args: {
    data: mockUsers,
    columns: userColumns,
    searchable: false,
    sortable: false,
    minWidth: 800,
    searchPlaceholder: 'Type to search...',
  },
};

export const WithRowClick: Story = {
  args: {
    data: mockUsers,
    columns: userColumns,
    onRowClick: mockRowClick,
  },
  parameters: {
    docs: {
      description: {
        story: 'Click on any row to trigger the onRowClick handler.',
      },
    },
  },
};

export const FullFeatured: Story = {
  args: {
    data: mockUsers,
    columns: userColumns,
    loading: false,
    searchable: true,
    sortable: true,
    selectable: true,
    actions: {
      onView: mockView,
      onEdit: mockEdit,
      onDelete: mockDelete,
      custom: [
        {
          icon: <IconUserCheck size={14} />,
          label: 'Verify User',
          onClick: (row: any) => {
            // console.log('Verify user:', row);
          },
          color: 'blue',
        },
      ],
    },
    bulkActions: [
      {
        label: 'Export Selected',
        onClick: mockBulkAction,
        color: 'blue',
      },
      {
        label: 'Bulk Edit',
        onClick: mockBulkAction,
        color: 'orange',
      },
      {
        label: 'Delete All',
        onClick: mockBulkAction,
        color: 'red',
      },
    ],
    onRowClick: mockRowClick,
    emptyState: {
      icon: IconUsers,
      title: 'No users found',
      description: 'Try adjusting your search criteria.',
    },
  },
};
