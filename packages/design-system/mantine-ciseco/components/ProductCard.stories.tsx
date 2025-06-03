import ProductCard from './ProductCard';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ProductCard> = {
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    data: {
      control: 'object',
      description: 'Product data object',
    },
    isLiked: {
      control: 'boolean',
      description: 'Whether the product is liked/favorited',
    },
  },
  component: ProductCard,
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'A comprehensive product card with image, colors, pricing, rating, and interactive buttons for add to cart and quick view.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/ProductCard',
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockProduct = {
  id: 'gid://1',
  featuredImage: {
    width: 400,
    alt: 'Classic Cotton T-Shirt',
    height: 500,
    src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop',
  },
  handle: 'classic-cotton-t-shirt',
  images: [
    {
      width: 400,
      alt: 'Classic Cotton T-Shirt',
      height: 500,
      src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop',
    },
  ],
  options: [
    {
      name: 'Color',
      optionValues: [
        {
          name: 'Blue',
          swatch: { color: '#3B82F6', image: null },
        },
        {
          name: 'Red',
          swatch: { color: '#EF4444', image: null },
        },
        {
          name: 'Green',
          swatch: { color: '#10B981', image: null },
        },
      ],
    },
    {
      name: 'Size',
      optionValues: [
        { name: 'S', swatch: null },
        { name: 'M', swatch: null },
        { name: 'L', swatch: null },
        { name: 'XL', swatch: null },
      ],
    },
  ],
  price: 29.99,
  rating: 4.5,
  reviewNumber: 127,
  selectedOptions: [
    { name: 'Color', value: 'Blue' },
    { name: 'Size', value: 'M' },
  ],
  status: 'New in',
  title: 'Classic Cotton T-Shirt',
};

export const Default: Story = {
  args: {
    data: mockProduct,
    isLiked: false,
  },
};

export const Liked: Story = {
  args: {
    data: mockProduct,
    isLiked: true,
  },
};

export const OnSale: Story = {
  args: {
    data: {
      ...mockProduct,
      price: 59.99,
      status: '50% Discount',
    },
  },
};

export const SoldOut: Story = {
  args: {
    data: {
      ...mockProduct,
      status: 'Sold Out',
    },
  },
};

export const HighRating: Story = {
  args: {
    data: {
      ...mockProduct,
      rating: 4.9,
      reviewNumber: 234,
      status: 'Best Seller',
    },
  },
};

export const LowRating: Story = {
  args: {
    data: {
      ...mockProduct,
      rating: 3.2,
      reviewNumber: 45,
    },
  },
};

export const ExpensiveItem: Story = {
  args: {
    data: {
      ...mockProduct,
      featuredImage: {
        width: 400,
        alt: 'Premium Designer Jacket',
        height: 500,
        src: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=500&fit=crop',
      },
      price: 299.99,
      status: 'limited edition',
      title: 'Premium Designer Jacket',
    },
  },
};

export const NoColorOptions: Story = {
  args: {
    data: {
      ...mockProduct,
      options: [
        {
          name: 'Size',
          optionValues: [
            { name: 'S', swatch: null },
            { name: 'M', swatch: null },
            { name: 'L', swatch: null },
          ],
        },
      ],
      selectedOptions: [{ name: 'Size', value: 'M' }],
    },
  },
};

export const ManyColors: Story = {
  args: {
    data: {
      ...mockProduct,
      options: [
        {
          name: 'Color',
          optionValues: [
            { name: 'Blue', swatch: { color: '#3B82F6', image: null } },
            { name: 'Red', swatch: { color: '#EF4444', image: null } },
            { name: 'Green', swatch: { color: '#10B981', image: null } },
            { name: 'Purple', swatch: { color: '#8B5CF6', image: null } },
            { name: 'Pink', swatch: { color: '#EC4899', image: null } },
            { name: 'Yellow', swatch: { color: '#F59E0B', image: null } },
            { name: 'Black', swatch: { color: '#1F2937', image: null } },
            { name: 'White', swatch: { color: '#F9FAFB', image: null } },
          ],
        },
      ],
    },
  },
};

export const LongTitle: Story = {
  args: {
    data: {
      ...mockProduct,
      title: 'Premium Organic Cotton Long-Sleeve Sustainable Fashion T-Shirt',
    },
  },
};

export const ProductGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
      {[
        {
          ...mockProduct,
          id: '1',
          image: 'photo-1521572163474-6864f9cf17ab',
          price: 29.99,
          status: 'New in',
          title: 'Classic T-Shirt',
        },
        {
          ...mockProduct,
          id: '2',
          image: 'photo-1542272604-787c3835535d',
          price: 89.99,
          rating: 4.2,
          status: '50% Discount',
          title: 'Designer Jeans',
        },
        {
          ...mockProduct,
          id: '3',
          image: 'photo-1549298916-b41d501d3772',
          price: 129.99,
          rating: 4.8,
          status: 'Best Seller',
          title: 'Sneakers',
        },
        {
          ...mockProduct,
          id: '4',
          image: 'photo-1551698618-1dfe5d97d256',
          price: 299.99,
          rating: 4.6,
          status: 'limited edition',
          title: 'Leather Jacket',
        },
        {
          ...mockProduct,
          id: '5',
          image: 'photo-1515372039744-b8f02a3ae446',
          price: 79.99,
          rating: 4.4,
          status: 'Sold Out',
          title: 'Summer Dress',
        },
        {
          ...mockProduct,
          id: '6',
          image: 'photo-1507003211169-0a1dd7228f2d',
          price: 49.99,
          rating: 4.1,
          title: 'Casual Shirt',
        },
      ].map((product) => (
        <ProductCard
          key={product.id}
          data={{
            ...product,
            featuredImage: {
              width: 400,
              alt: product.title,
              height: 500,
              src: `https://images.unsplash.com/${product.image}?w=400&h=500&fit=crop`,
            },
          }}
          isLiked={Math.random() > 0.5}
        />
      ))}
    </div>
  ),
};

export const DifferentStatuses: Story = {
  render: () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl">
      {['New in', '50% Discount', 'Best Seller', 'Sold Out'].map((status, index) => (
        <ProductCard
          key={index}
          data={{
            ...mockProduct,
            id: `status-${index}`,
            status,
            title: `Product ${index + 1}`,
          }}
        />
      ))}
    </div>
  ),
};

export const PriceRange: Story = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl">
      {[19.99, 49.99, 99.99, 299.99].map((price, index) => (
        <ProductCard
          key={index}
          data={{
            ...mockProduct,
            id: `price-${index}`,
            price,
            title: `$${price} Item`,
          }}
        />
      ))}
    </div>
  ),
};
