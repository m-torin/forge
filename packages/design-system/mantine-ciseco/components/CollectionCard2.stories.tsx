import CollectionCard2 from './CollectionCard2';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof CollectionCard2> = {
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    collection: {
      control: 'object',
      description: 'Collection data object',
    },
    ratioClass: {
      control: 'text',
      description: 'Aspect ratio CSS class for the card',
    },
  },
  component: CollectionCard2,
  parameters: {
    docs: {
      description: {
        component:
          'A vertical collection card with large image, background color, and centered text layout.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/CollectionCard2',
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockCollection = {
  id: 'gid://1',
  color: 'bg-indigo-50',
  count: 77,
  description: 'Stylish jackets for every occasion',
  handle: 'jackets',
  image: {
    width: 400,
    alt: 'Jackets collection',
    height: 400,
    src: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop',
  },
  sortDescription: 'Newest arrivals',
  title: 'Jackets',
};

export const Default: Story = {
  args: {
    collection: mockCollection,
  },
};

export const SquareRatio: Story = {
  args: {
    collection: mockCollection,
    ratioClass: 'aspect-square',
  },
};

export const RectangleRatio: Story = {
  args: {
    collection: mockCollection,
    ratioClass: 'aspect-[4/3]',
  },
};

export const TallRatio: Story = {
  args: {
    collection: mockCollection,
    ratioClass: 'aspect-[3/4]',
  },
};

export const DifferentColors: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-6 w-96">
      <CollectionCard2
        collection={{
          ...mockCollection,
          color: 'bg-yellow-50',
          sortDescription: 'Bright & vibrant',
          title: 'Summer Collection',
        }}
      />
      <CollectionCard2
        collection={{
          ...mockCollection,
          color: 'bg-blue-50',
          sortDescription: 'Warm & cozy',
          title: 'Winter Collection',
        }}
      />
      <CollectionCard2
        collection={{
          ...mockCollection,
          color: 'bg-green-50',
          sortDescription: 'Fresh & light',
          title: 'Spring Collection',
        }}
      />
      <CollectionCard2
        collection={{
          ...mockCollection,
          color: 'bg-orange-50',
          sortDescription: 'Rich & earthy',
          title: 'Fall Collection',
        }}
      />
    </div>
  ),
};

export const NoImage: Story = {
  args: {
    collection: {
      ...mockCollection,
      image: undefined,
    },
  },
};

export const LongTitle: Story = {
  args: {
    collection: {
      ...mockCollection,
      sortDescription: 'Luxury coats and jackets for the season',
      title: 'Premium Winter Outerwear Collection',
    },
  },
};

export const HTMLDescription: Story = {
  args: {
    collection: {
      ...mockCollection,
      sortDescription: '<strong>Featured</strong> items with <em>special</em> pricing',
    },
  },
};

export const NoHandle: Story = {
  args: {
    collection: {
      ...mockCollection,
      handle: undefined,
    },
  },
};

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-6 max-w-4xl">
      {[
        {
          color: 'bg-blue-50',
          desc: 'Casual wear',
          image: 'photo-1521572163474-6864f9cf17ab',
          title: 'T-Shirts',
        },
        {
          color: 'bg-indigo-50',
          desc: 'Denim collection',
          image: 'photo-1542272604-787c3835535d',
          title: 'Jeans',
        },
        {
          color: 'bg-purple-50',
          desc: 'Footwear',
          image: 'photo-1549298916-b41d501d3772',
          title: 'Shoes',
        },
        {
          color: 'bg-pink-50',
          desc: 'Complete your look',
          image: 'photo-1553062407-98eeb64c6a62',
          title: 'Accessories',
        },
        {
          color: 'bg-green-50',
          desc: 'Stylish carriers',
          image: 'photo-1553062407-98eeb64c6a62',
          title: 'Bags',
        },
        {
          color: 'bg-yellow-50',
          desc: 'Timepieces',
          image: 'photo-1523275335684-37898b6baf30',
          title: 'Watches',
        },
      ].map((item, index) => (
        <CollectionCard2
          key={`${item.title}-${index}`}
          collection={{
            id: `gid://${index}`,
            color: item.color,
            handle: item.title.toLowerCase(),
            image: {
              width: 300,
              alt: item.title,
              height: 300,
              src: `https://images.unsplash.com/${item.image}?w=300&h=300&fit=crop`,
            },
            sortDescription: item.desc,
            title: item.title,
          }}
        />
      ))}
    </div>
  ),
};

export const ResponsiveGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
      {Array.from({ length: 6 }, (_, i) => (
        <CollectionCard2
          key={`collection-${i}`}
          collection={{
            id: `gid://${i}`,
            color: [
              'bg-blue-50',
              'bg-green-50',
              'bg-purple-50',
              'bg-pink-50',
              'bg-yellow-50',
              'bg-indigo-50',
            ][i],
            handle: `collection-${i + 1}`,
            image: {
              width: 300,
              alt: `Collection ${i + 1}`,
              height: 300,
              src: `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop&seed=${i}`,
            },
            sortDescription: `Description ${i + 1}`,
            title: `Collection ${i + 1}`,
          }}
        />
      ))}
    </div>
  ),
};
