import { Meta, StoryObj } from '@storybook/react';

import { NotificationsProvider } from '@repo/notifications/mantine-notifications';

import AddToCardButton from './AddToCardButton';

const meta: Meta<typeof AddToCardButton> = {
  argTypes: {
    as: {
      control: false,
      description: 'Polymorphic component type (button, div, etc.)',
    },
    children: {
      control: 'text',
      description: 'Button content',
    },
    className: {
      control: 'text',
      description: 'CSS classes for styling the button',
    },
    color: {
      control: 'text',
      description: 'Product color variant',
    },
    imageUrl: {
      control: 'text',
      description: 'URL of the product image',
    },
    price: {
      control: 'number',
      description: 'Product price',
    },
    quantity: {
      control: 'number',
      description: 'Quantity added to cart',
      min: 1,
    },
    size: {
      control: 'text',
      description: 'Product size',
    },
    title: {
      control: 'text',
      description: 'Product title displayed in the notification',
    },
  },
  component: AddToCardButton,
  decorators: [
    (Story) => (
      <NotificationsProvider>
        <Story />
      </NotificationsProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'A button component that shows a notification when adding items to cart. Supports custom styling and polymorphic rendering.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/AddToCardButton',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Add to Cart',
    className: 'px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors',
    color: 'Blue',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
    price: 29.99,
    quantity: 1,
    size: 'M',
    title: 'Classic T-Shirt',
  },
};

export const PrimaryButton: Story = {
  args: {
    children: 'Add to Cart',
    className:
      'px-8 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl',
    color: 'Black',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop',
    price: 89.99,
    quantity: 2,
    size: 'L',
    title: 'Premium Hoodie',
  },
};

export const SecondaryButton: Story = {
  args: {
    children: 'Add to Cart',
    className:
      'px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors',
    color: 'Dark Blue',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop',
    price: 79.5,
    quantity: 1,
    size: '32',
    title: 'Casual Jeans',
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
        <span>Add to Cart</span>
      </div>
    ),
    className:
      'px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium',
    color: 'White',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop',
    price: 159.99,
    quantity: 1,
    size: '9',
    title: 'Designer Sneakers',
  },
};

export const LargeQuantity: Story = {
  args: {
    children: 'Add Pack to Cart',
    className:
      'px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors text-lg',
    color: 'Multi-color',
    imageUrl: 'https://images.unsplash.com/photo-1586350290166-d5adcd661a97?w=300&h=300&fit=crop',
    price: 24.99,
    quantity: 5,
    size: 'One Size',
    title: 'Pack of Socks',
  },
};

export const ExpensiveItem: Story = {
  args: {
    children: 'Add to Cart',
    className:
      'px-8 py-4 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-xl font-bold hover:from-yellow-700 hover:to-yellow-800 transition-all duration-200 shadow-lg',
    color: 'Rose Gold',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
    price: 1299.99,
    quantity: 1,
    size: '42mm',
    title: 'Luxury Watch',
  },
};

export const AsDiv: Story = {
  args: {
    as: 'div',
    children: 'Click me (div element)',
    className:
      'px-6 py-3 bg-red-500 text-white rounded-lg cursor-pointer hover:bg-red-600 transition-colors inline-block',
    color: 'Red',
    imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=300&fit=crop',
    price: 49.99,
    quantity: 1,
    size: 'S',
    title: 'Custom Component',
  },
};

export const MinimalStyling: Story = {
  args: {
    children: 'Add to Cart',
    className: 'px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors',
    color: 'Gray',
    imageUrl: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=300&h=300&fit=crop',
    price: 19.99,
    quantity: 1,
    size: 'M',
    title: 'Simple Product',
  },
};
