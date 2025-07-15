import type { Meta, StoryObj } from '@storybook/nextjs';
import {
  IconActivity,
  IconCurrencyDollar,
  IconShoppingCart,
  IconTarget,
  IconTrendingUp,
  IconUsers,
} from '@tabler/icons-react';
import { StatsCard } from './StatsCard';

const meta: Meta<typeof StatsCard> = {
  title: 'Components/StatsCard',
  component: StatsCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    loading: { control: 'boolean' },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: 'select',
      options: ['default', 'outlined', 'filled'],
    },
    showIcon: { control: 'boolean' },
    showChange: { control: 'boolean' },
    showProgress: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Total Users',
    value: '1,234',
    color: 'blue',
    icon: IconUsers,
  },
};

export const WithPositiveChange: Story = {
  args: {
    title: 'Monthly Revenue',
    value: '$45,678',
    color: 'green',
    icon: IconCurrencyDollar,
    change: { value: 12.5 },
  },
};

export const WithNegativeChange: Story = {
  args: {
    title: 'Cart Abandonment',
    value: '23.4%',
    color: 'red',
    icon: IconShoppingCart,
    change: { value: -5.2 },
  },
};

export const WithProgress: Story = {
  args: {
    title: 'Goal Progress',
    value: '8,456',
    color: 'teal',
    icon: IconTarget,
    progress: { value: 68, label: '68% complete' },
  },
};

export const Loading: Story = {
  args: {
    title: 'Loading Data',
    value: '0',
    color: 'gray',
    icon: IconActivity,
    loading: true,
  },
};

export const SmallSize: Story = {
  args: {
    title: 'Active Sessions',
    value: '42',
    color: 'orange',
    icon: IconActivity,
    size: 'sm',
    change: { value: 8.3 },
  },
};

export const LargeSize: Story = {
  args: {
    title: 'Total Revenue',
    value: '$1.2M',
    color: 'violet',
    icon: IconTrendingUp,
    size: 'lg',
    change: { value: 24.1 },
    progress: { value: 85, label: 'YTD Goal' },
  },
};

export const OutlinedVariant: Story = {
  args: {
    title: 'New Signups',
    value: '156',
    color: 'blue',
    icon: IconUsers,
    variant: 'outlined',
    change: { value: 15.6 },
  },
};

export const FilledVariant: Story = {
  args: {
    title: 'Conversion Rate',
    value: '3.8%',
    color: 'green',
    icon: IconTarget,
    variant: 'filled',
    change: { value: 0.7 },
  },
};

export const NoIcon: Story = {
  args: {
    title: 'Simple Stats',
    value: '999',
    color: 'gray',
    icon: IconUsers,
    showIcon: false,
    change: { value: 5.0 },
  },
};

export const NoChange: Story = {
  args: {
    title: 'Static Value',
    value: '100',
    color: 'indigo',
    icon: IconUsers,
    showChange: false,
    change: { value: 10.0 }, // Won't show due to showChange: false
  },
};

export const CustomRadius: Story = {
  args: {
    title: 'Custom Styling',
    value: '789',
    color: 'pink',
    icon: IconActivity,
    radius: 'xl',
    padding: 'lg',
    change: { value: 3.2 },
  },
};

export const Dashboard: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1rem',
        padding: '1rem',
      }}
    >
      <StatsCard
        title="Total Users"
        value="12,345"
        color="blue"
        icon={IconUsers}
        change={{ value: 12.5 }}
      />
      <StatsCard
        title="Revenue"
        value="$98,765"
        color="green"
        icon={IconCurrencyDollar}
        change={{ value: 8.3 }}
        progress={{ value: 75, label: 'Monthly Goal' }}
      />
      <StatsCard
        title="Orders"
        value="2,456"
        color="orange"
        icon={IconShoppingCart}
        change={{ value: -2.1 }}
      />
      <StatsCard
        title="Activity"
        value="89.2%"
        color="violet"
        icon={IconActivity}
        progress={{ value: 89, label: 'Uptime' }}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Example dashboard layout with multiple stats cards',
      },
    },
  },
};
