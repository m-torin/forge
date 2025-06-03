import LikeButton from './LikeButton';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof LikeButton> = {
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes for styling',
    },
    liked: {
      control: 'boolean',
      description: 'Initial liked state (note: component randomizes this on mount for demo)',
    },
  },
  component: LikeButton,
  parameters: {
    docs: {
      description: {
        component: 'A heart-shaped like button that toggles between liked and unliked states.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/LikeButton',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    liked: false,
  },
};

export const Liked: Story = {
  args: {
    liked: true,
  },
};

export const CustomStyling: Story = {
  args: {
    className: 'hover:scale-110 transition-transform',
    liked: false,
  },
};

export const MultipleButtons: Story = {
  render: () => (
    <div className="flex space-x-4">
      <LikeButton liked={false} />
      <LikeButton liked={true} />
      <LikeButton liked={false} />
      <LikeButton liked={true} />
    </div>
  ),
};

export const InProductCard: Story = {
  render: () => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-xs">
      <div className="relative">
        <img
          className="w-full h-48 object-cover"
          alt="Product"
          src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop"
        />
        <div className="absolute top-3 right-3">
          <LikeButton />
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">Product Name</h3>
        <p className="text-gray-600">$29.99</p>
      </div>
    </div>
  ),
};

export const DifferentPositions: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <span className="text-sm">Top Left:</span>
        <div className="relative w-32 h-24 bg-gray-200 rounded">
          <div className="absolute top-2 left-2">
            <LikeButton />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <span className="text-sm">Top Right:</span>
        <div className="relative w-32 h-24 bg-gray-200 rounded">
          <div className="absolute top-2 right-2">
            <LikeButton />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <span className="text-sm">Bottom Right:</span>
        <div className="relative w-32 h-24 bg-gray-200 rounded">
          <div className="absolute bottom-2 right-2">
            <LikeButton />
          </div>
        </div>
      </div>
    </div>
  ),
};

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: 12 }, (_, i) => (
        <LikeButton key={i} liked={i % 3 === 0} />
      ))}
    </div>
  ),
};
