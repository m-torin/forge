import ProductCardLarge from './ProductCardLarge'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof ProductCardLarge> = {
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    product: {
      control: 'object',
      description: 'Product data object',
    },
  },
  component: ProductCardLarge,
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'A large product card with main image and thumbnail gallery, showing detailed product information including rating and pricing.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/ProductCardLarge',
}

export default meta
type Story = StoryObj<typeof meta>

const mockProduct = {
  id: 'gid://1',
  handle: 'premium-cotton-hoodie',
  images: [
    {
      width: 500,
      alt: 'Premium Cotton Hoodie - Main',
      height: 400,
      src: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=400&fit=crop',
    },
    {
      width: 200,
      alt: 'Premium Cotton Hoodie - Detail 1',
      height: 200,
      src: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop&crop=top',
    },
    {
      width: 200,
      alt: 'Premium Cotton Hoodie - Detail 2',
      height: 200,
      src: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop&crop=center',
    },
    {
      width: 200,
      alt: 'Premium Cotton Hoodie - Detail 3',
      height: 200,
      src: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop&crop=bottom',
    },
  ],
  price: 89.99,
  rating: 4.7,
  reviewNumber: 189,
  selectedOptions: [
    { name: 'Color', value: 'Charcoal Gray' },
    { name: 'Size', value: 'L' },
  ],
  title: 'Premium Cotton Hoodie',
}

export const Default: Story = {
  args: {
    product: mockProduct,
  },
}

export const HighRating: Story = {
  args: {
    product: {
      ...mockProduct,
      rating: 4.9,
      reviewNumber: 342,
    },
  },
}

export const LowRating: Story = {
  args: {
    product: {
      ...mockProduct,
      rating: 3.2,
      reviewNumber: 28,
    },
  },
}

export const ExpensiveItem: Story = {
  args: {
    product: {
      ...mockProduct,
      images: [
        {
          width: 500,
          alt: 'Designer Leather Jacket - Main',
          height: 400,
          src: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=400&fit=crop',
        },
        {
          width: 200,
          alt: 'Designer Leather Jacket - Detail 1',
          height: 200,
          src: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop&crop=top',
        },
        {
          width: 200,
          alt: 'Designer Leather Jacket - Detail 2',
          height: 200,
          src: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop&crop=center',
        },
        {
          width: 200,
          alt: 'Designer Leather Jacket - Detail 3',
          height: 200,
          src: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop&crop=bottom',
        },
      ],
      price: 349.99,
      rating: 4.8,
      reviewNumber: 156,
      selectedOptions: [
        { name: 'Color', value: 'Black Leather' },
        { name: 'Size', value: 'M' },
      ],
      title: 'Designer Leather Jacket',
    },
  },
}

export const BudgetItem: Story = {
  args: {
    product: {
      ...mockProduct,
      images: [
        {
          width: 500,
          alt: 'Basic Cotton T-Shirt - Main',
          height: 400,
          src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=400&fit=crop',
        },
        {
          width: 200,
          alt: 'Basic Cotton T-Shirt - Detail 1',
          height: 200,
          src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop&crop=top',
        },
        {
          width: 200,
          alt: 'Basic Cotton T-Shirt - Detail 2',
          height: 200,
          src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop&crop=center',
        },
        {
          width: 200,
          alt: 'Basic Cotton T-Shirt - Detail 3',
          height: 200,
          src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop&crop=bottom',
        },
      ],
      price: 19.99,
      rating: 4.1,
      reviewNumber: 89,
      selectedOptions: [
        { name: 'Color', value: 'White' },
        { name: 'Size', value: 'M' },
      ],
      title: 'Basic Cotton T-Shirt',
    },
  },
}

export const OnlyMainImage: Story = {
  args: {
    product: {
      ...mockProduct,
      images: [
        {
          width: 500,
          alt: 'Product - Main Only',
          height: 400,
          src: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=400&fit=crop',
        },
      ],
    },
  },
}

export const TwoImages: Story = {
  args: {
    product: {
      ...mockProduct,
      images: [
        {
          width: 500,
          alt: 'Product - Main',
          height: 400,
          src: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=400&fit=crop',
        },
        {
          width: 200,
          alt: 'Product - Detail 1',
          height: 200,
          src: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop&crop=top',
        },
      ],
    },
  },
}

export const LongTitle: Story = {
  args: {
    product: {
      ...mockProduct,
      title: 'Premium Organic Cotton Sustainable Fashion Long-Sleeve Hoodie with Eco-Friendly Materials',
    },
  },
}

export const NoColorOption: Story = {
  args: {
    product: {
      ...mockProduct,
      selectedOptions: [{ name: 'Size', value: 'L' }],
    },
  },
}

export const ProductGrid: Story = {
  render: () => (
    <div className="grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
      {[
        {
          color: 'Gray',
          image: 'photo-1556821840-3a63f95609a7',
          price: 79.99,
          rating: 4.5,
          title: 'Cotton Hoodie',
        },
        {
          color: 'Blue Denim',
          image: 'photo-1542272604-787c3835535d',
          price: 129.99,
          rating: 4.7,
          title: 'Denim Jacket',
        },
        {
          color: 'White',
          image: 'photo-1507003211169-0a1dd7228f2d',
          price: 59.99,
          rating: 4.3,
          title: 'Casual Shirt',
        },
        {
          color: 'Floral Print',
          image: 'photo-1515372039744-b8f02a3ae446',
          price: 89.99,
          rating: 4.6,
          title: 'Summer Dress',
        },
      ].map((item, index) => (
        <ProductCardLarge
          key={index}
          product={{
            id: `grid-${index}`,
            handle: item.title.toLowerCase().replace(' ', '-'),
            images: [
              {
                width: 500,
                alt: `${item.title} - Main`,
                height: 400,
                src: `https://images.unsplash.com/${item.image}?w=500&h=400&fit=crop`,
              },
              {
                width: 200,
                alt: `${item.title} - Detail 1`,
                height: 200,
                src: `https://images.unsplash.com/${item.image}?w=200&h=200&fit=crop&crop=top`,
              },
              {
                width: 200,
                alt: `${item.title} - Detail 2`,
                height: 200,
                src: `https://images.unsplash.com/${item.image}?w=200&h=200&fit=crop&crop=center`,
              },
              {
                width: 200,
                alt: `${item.title} - Detail 3`,
                height: 200,
                src: `https://images.unsplash.com/${item.image}?w=200&h=200&fit=crop&crop=bottom`,
              },
            ],
            price: item.price,
            rating: item.rating,
            reviewNumber: Math.floor(Math.random() * 200) + 50,
            selectedOptions: [
              { name: 'Color', value: item.color },
              { name: 'Size', value: 'M' },
            ],
            title: item.title,
          }}
        />
      ))}
    </div>
  ),
}
