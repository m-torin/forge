import ProductStatus from './ProductStatus';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ProductStatus> = {
  argTypes: {
    className: {
      control: 'text',
      description: 'CSS classes for styling the badge',
    },
    status: {
      control: 'select',
      description: 'Product status type',
      options: [
        'New in',
        '50% Discount',
        'Sold Out',
        'limited edition',
        'Best Seller',
        'Custom Status',
      ],
    },
  },
  component: ProductStatus,
  parameters: {
    docs: {
      description: {
        component:
          'A product status badge component that displays different status types with corresponding icons.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/ProductStatus',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: 'New in',
  },
};

export const NewIn: Story = {
  args: {
    status: 'New in',
  },
};

export const Discount: Story = {
  args: {
    status: '50% Discount',
  },
};

export const SoldOut: Story = {
  args: {
    status: 'Sold Out',
  },
};

export const LimitedEdition: Story = {
  args: {
    status: 'limited edition',
  },
};

export const CustomStatus: Story = {
  args: {
    status: 'Best Seller',
  },
};

export const NoStatus: Story = {
  args: {
    status: '',
  },
};

export const CustomStyling: Story = {
  args: {
    className: 'relative px-3 py-2 text-sm bg-blue-100 text-blue-800 border border-blue-200',
    status: 'New in',
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-4">
      <ProductStatus status="New in" />
      <ProductStatus status="50% Discount" />
      <ProductStatus status="Sold Out" />
      <ProductStatus status="limited edition" />
    </div>
  ),
};

export const InProductCard: Story = {
  render: () => (
    <div className="relative bg-white rounded-lg shadow-lg overflow-hidden w-64">
      <div className="relative">
        <img
          className="w-full h-48 object-cover"
          alt="Product"
          src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop"
        />
        <ProductStatus status="New in" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">Product Name</h3>
        <p className="text-gray-600">$29.99</p>
      </div>
    </div>
  ),
};

export const ProductGrid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      {[
        {
          image: 'photo-1521572163474-6864f9cf17ab',
          price: '$29.99',
          status: 'New in',
          title: 'Classic T-Shirt',
        },
        {
          image: 'photo-1542272604-787c3835535d',
          price: '$59.99',
          status: '50% Discount',
          title: 'Denim Jeans',
        },
        {
          image: 'photo-1549298916-b41d501d3772',
          price: '$89.99',
          status: 'Sold Out',
          title: 'Sneakers',
        },
        {
          image: 'photo-1551698618-1dfe5d97d256',
          price: '$199.99',
          status: 'limited edition',
          title: 'Leather Jacket',
        },
      ].map((product, index) => (
        <div key={index} className="relative bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative">
            <img
              className="w-full h-32 object-cover"
              alt={product.title}
              src={`https://images.unsplash.com/${product.image}?w=300&h=200&fit=crop`}
            />
            <ProductStatus status={product.status} />
          </div>
          <div className="p-3">
            <h3 className="text-sm font-semibold">{product.title}</h3>
            <p className="text-gray-600 text-sm">{product.price}</p>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const DifferentPositions: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="relative w-48 h-32 bg-gray-200 rounded">
        <ProductStatus
          className="absolute top-2 left-2 px-2 py-1 text-xs bg-white text-neutral-700"
          status="New in"
        />
        <span className="absolute bottom-2 left-2 text-xs text-gray-600">Top Left</span>
      </div>

      <div className="relative w-48 h-32 bg-gray-200 rounded">
        <ProductStatus
          className="absolute top-2 right-2 px-2 py-1 text-xs bg-white text-neutral-700"
          status="50% Discount"
        />
        <span className="absolute bottom-2 left-2 text-xs text-gray-600">Top Right</span>
      </div>

      <div className="relative w-48 h-32 bg-gray-200 rounded">
        <ProductStatus
          className="absolute bottom-2 left-2 px-2 py-1 text-xs bg-white text-neutral-700"
          status="Sold Out"
        />
        <span className="absolute top-2 left-2 text-xs text-gray-600">Bottom Left</span>
      </div>
    </div>
  ),
};
