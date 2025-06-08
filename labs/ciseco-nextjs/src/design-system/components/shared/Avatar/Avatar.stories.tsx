import Avatar from './Avatar';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Avatar> = {
  argTypes: {
    containerClassName: {
      control: 'text',
      description: 'Additional container styling classes',
    },
    hasChecked: {
      control: 'boolean',
      description: 'Whether to show verification badge',
    },
    hasCheckedClass: {
      control: 'text',
      description: 'Classes for the verification badge positioning',
    },
    imgUrl: {
      control: 'text',
      description: 'URL of the avatar image',
    },
    radius: {
      control: 'text',
      description: 'Border radius classes',
    },
    sizeClass: {
      control: 'text',
      description: 'Size classes for the avatar',
    },
    userName: {
      control: 'text',
      description: 'User name (used for fallback initial and color generation)',
    },
  },
  component: Avatar,
  parameters: {
    docs: {
      description: {
        component:
          'An avatar component that displays user profile images or initials with optional verification badge.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/Shared/Avatar',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    userName: 'John Doe',
  },
};

export const WithImage: Story = {
  args: {
    imgUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    userName: 'Jane Smith',
  },
};

export const WithVerification: Story = {
  args: {
    hasChecked: true,
    imgUrl:
      'https://images.unsplash.com/photo-1494790108755-2616b612c1c4?w=150&h=150&fit=crop&crop=face',
    userName: 'Verified User',
  },
};

export const WithoutImage: Story = {
  args: {
    imgUrl: '',
    userName: 'Alice Johnson',
  },
};

export const SmallSize: Story = {
  args: {
    imgUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    sizeClass: 'size-4 text-xs',
    userName: 'Bob Wilson',
  },
};

export const MediumSize: Story = {
  args: {
    imgUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    sizeClass: 'size-8 text-sm',
    userName: 'Carol Brown',
  },
};

export const LargeSize: Story = {
  args: {
    imgUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    sizeClass: 'size-16 text-xl',
    userName: 'David Davis',
  },
};

export const ExtraLargeSize: Story = {
  args: {
    imgUrl:
      'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face',
    sizeClass: 'size-24 text-2xl',
    userName: 'Emma Wilson',
  },
};

export const SquareShape: Story = {
  args: {
    imgUrl:
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop&crop=face',
    radius: 'rounded-lg',
    userName: 'Frank Miller',
  },
};

export const NoRadius: Story = {
  args: {
    imgUrl:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    radius: 'rounded-none',
    userName: 'Grace Lee',
  },
};

export const CustomStyling: Story = {
  args: {
    containerClassName: 'ring-2 ring-blue-500 ring-offset-2',
    imgUrl:
      'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop&crop=face',
    userName: 'Henry Chen',
  },
};

export const DifferentNames: Story = {
  render: () => (
    <div className="flex space-x-4">
      <Avatar userName="Alice" />
      <Avatar userName="Bob" />
      <Avatar userName="Carol" />
      <Avatar userName="David" />
      <Avatar userName="Emma" />
      <Avatar userName="Frank" />
    </div>
  ),
};

export const UserList: Story = {
  render: () => (
    <div className="space-y-3">
      {[
        { name: 'John Doe', image: 'photo-1472099645785-5658abf4ff4e', verified: true },
        { name: 'Jane Smith', image: 'photo-1494790108755-2616b612c1c4', verified: false },
        { name: 'Bob Wilson', image: 'photo-1507003211169-0a1dd7228f2d', verified: true },
        { name: 'Alice Johnson', image: '', verified: false },
        { name: 'Carol Brown', image: 'photo-1438761681033-6461ffad8d80', verified: true },
      ].map((user, index) => (
        <div key={index} className="flex items-center space-x-3">
          <Avatar
            hasChecked={user.verified}
            imgUrl={
              user.image
                ? `https://images.unsplash.com/${user.image}?w=150&h=150&fit=crop&crop=face`
                : ''
            }
            sizeClass="size-10 text-sm"
            userName={user.name}
          />
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-500">
              {user.verified ? 'Verified User' : 'Regular User'}
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const SizeComparison: Story = {
  render: () => (
    <div className="flex items-end space-x-4">
      <div className="text-center">
        <Avatar
          imgUrl="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
          sizeClass="size-4 text-xs"
          userName="XS"
        />
        <div className="text-xs mt-2">XS</div>
      </div>
      <div className="text-center">
        <Avatar
          imgUrl="https://images.unsplash.com/photo-1494790108755-2616b612c1c4?w=150&h=150&fit=crop&crop=face"
          sizeClass="size-6 text-sm"
          userName="SM"
        />
        <div className="text-xs mt-2">SM</div>
      </div>
      <div className="text-center">
        <Avatar
          imgUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
          sizeClass="size-8 text-sm"
          userName="MD"
        />
        <div className="text-xs mt-2">MD</div>
      </div>
      <div className="text-center">
        <Avatar
          imgUrl="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
          sizeClass="size-12 text-base"
          userName="LG"
        />
        <div className="text-xs mt-2">LG</div>
      </div>
      <div className="text-center">
        <Avatar
          imgUrl="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
          sizeClass="size-16 text-xl"
          userName="XL"
        />
        <div className="text-xs mt-2">XL</div>
      </div>
    </div>
  ),
};
