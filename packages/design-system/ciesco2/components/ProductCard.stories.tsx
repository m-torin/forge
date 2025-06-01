import type { Meta, StoryObj } from '@storybook/react';
import { ProductCard } from '@repo/design-system/ciesco2';
import type { TProductItem } from '@repo/design-system/ciesco2/data/data';

// Mock product data for stories
const mockProduct: TProductItem = {
  handle: 'classic-white-tee',
  title: 'Classic White T-Shirt',
  featuredImage: {
    width: 800,
    height: 800,
    src: '/images/products/p1.jpg',
    alt: 'Classic White T-Shirt',
  },
  images: [
    { width: 800, height: 800, src: '/images/products/p1.jpg', alt: 'Classic White T-Shirt' },
    { width: 800, height: 800, src: '/images/products/p1-2.jpg', alt: 'Classic White T-Shirt Back' },
  ],
  price: 29.99,
  rating: 4.5,
  reviewNumber: 128,
  status: 'in-stock',
  options: [
    {
      name: 'Color',
      optionValues: [
        { name: 'White', swatch: { color: '#ffffff', image: null } },
        { name: 'Black', swatch: { color: '#000000', image: null } },
        { name: 'Gray', swatch: { color: '#808080', image: null } },
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
  selectedOptions: [
    { name: 'Color', value: 'White' },
    { name: 'Size', value: 'M' },
  ],
};

const meta: Meta<typeof ProductCard> = {
  title: 'ciesco2/ProductCard',
  component: ProductCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isLiked: {
      control: 'boolean',
      description: 'Whether the product is liked/favorited',
    },
  },
  decorators: [
    (Story: any) => (
      <div style={{ maxWidth: 300, padding: 20 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

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

export const OutOfStock: Story = {
  args: {
    data: {
      ...mockProduct,
      status: 'out-of-stock',
      title: 'Premium Cotton Hoodie',
    },
    isLiked: false,
  },
};

export const OnSale: Story = {
  args: {
    data: {
      ...mockProduct,
      status: 'on-sale',
      title: 'Vintage Denim Jacket',
      price: 89.99,
      rating: 4.8,
      reviewNumber: 256,
    },
    isLiked: false,
  },
};

export const HighRating: Story = {
  args: {
    data: {
      ...mockProduct,
      title: 'Designer Silk Blouse',
      price: 159.99,
      rating: 4.9,
      reviewNumber: 89,
    },
    isLiked: true,
  },
};