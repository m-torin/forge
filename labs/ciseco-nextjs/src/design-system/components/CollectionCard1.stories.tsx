import CollectionCard1 from './CollectionCard1'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof CollectionCard1> = {
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    collection: {
      control: 'object',
      description: 'Collection data object',
    },
    size: {
      control: 'select',
      description: 'Size variant of the card',
      options: ['normal', 'large'],
    },
  },
  component: CollectionCard1,
  parameters: {
    docs: {
      description: {
        component: 'A horizontal collection card component displaying collection image, title, description and count.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/CollectionCard1',
}

export default meta
type Story = StoryObj<typeof meta>

const mockCollection = {
  id: 'gid://1',
  color: 'bg-indigo-50',
  count: 77,
  description:
    'Stylish jackets for every occasion, from casual to formal. Explore our collection of trendy jackets that elevate your outfit.',
  handle: 'jackets',
  image: {
    width: 400,
    alt: 'Jackets collection',
    height: 400,
    src: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop',
  },
  sortDescription: 'Newest arrivals',
  title: 'Jackets',
}

export const Default: Story = {
  args: {
    collection: mockCollection,
    size: 'normal',
  },
}

export const LargeSize: Story = {
  args: {
    collection: mockCollection,
    size: 'large',
  },
}

export const WithoutImage: Story = {
  args: {
    collection: {
      ...mockCollection,
      image: undefined,
    },
    size: 'normal',
  },
}

export const LongTitle: Story = {
  args: {
    collection: {
      ...mockCollection,
      title: 'Premium Winter Jackets and Outerwear Collection',
    },
    size: 'normal',
  },
}

export const LongDescription: Story = {
  args: {
    collection: {
      ...mockCollection,
      description:
        'An extensive collection of premium quality jackets and outerwear designed for all seasons. From lightweight spring jackets to heavy-duty winter coats, we have everything you need to stay stylish and comfortable throughout the year.',
    },
    size: 'normal',
  },
}

export const HighCount: Story = {
  args: {
    collection: {
      ...mockCollection,
      count: 1250,
    },
    size: 'normal',
  },
}

export const NoHandle: Story = {
  args: {
    collection: {
      ...mockCollection,
      handle: undefined,
    },
    size: 'normal',
  },
}

export const DifferentCollections: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-4">
      <CollectionCard1
        collection={{
          id: 'gid://1',
          count: 155,
          description: 'Casual t-shirts for everyday wear',
          handle: 't-shirts',
          image: {
            width: 400,
            alt: 'T-Shirts collection',
            height: 400,
            src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
          },
          title: 'T-Shirts',
        }}
        size="normal"
      />
      <CollectionCard1
        collection={{
          id: 'gid://2',
          count: 35,
          description: 'Trendy jeans for a casual yet stylish look',
          handle: 'jeans',
          image: {
            width: 400,
            alt: 'Jeans collection',
            height: 400,
            src: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
          },
          title: 'Jeans',
        }}
        size="normal"
      />
      <CollectionCard1
        collection={{
          id: 'gid://3',
          count: 114,
          description: 'Trendy shoes for every occasion',
          handle: 'shoes',
          image: {
            width: 400,
            alt: 'Shoes collection',
            height: 400,
            src: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
          },
          title: 'Shoes',
        }}
        size="normal"
      />
    </div>
  ),
}

export const SizeComparison: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-medium">Normal Size</h3>
        <CollectionCard1 collection={mockCollection} size="normal" />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium">Large Size</h3>
        <CollectionCard1 collection={mockCollection} size="large" />
      </div>
    </div>
  ),
}
