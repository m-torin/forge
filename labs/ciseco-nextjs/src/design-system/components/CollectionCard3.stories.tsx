import CollectionCard3 from './CollectionCard3'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof CollectionCard3> = {
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    collection: {
      control: 'object',
      description: 'Collection data object',
    },
  },
  component: CollectionCard3,
  parameters: {
    docs: {
      description: {
        component:
          'A horizontal collection card with split layout - text content on the left and product image on the right, includes a call-to-action button.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/CollectionCard3',
}

export default meta
type Story = StoryObj<typeof meta>

const mockCollection = {
  id: 'gid://1',
  color: 'bg-indigo-50',
  count: 77,
  description: 'Discover the latest trends in fashion',
  handle: 'new-arrivals',
  image: {
    width: 400,
    alt: 'New arrivals collection',
    height: 400,
    src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
  },
  sortDescription: 'Fresh styles for the modern wardrobe',
  title: 'New Arrivals',
}

export const Default: Story = {
  args: {
    collection: mockCollection,
  },
}

export const SummerCollection: Story = {
  args: {
    collection: {
      ...mockCollection,
      color: 'bg-yellow-50',
      image: {
        width: 400,
        alt: 'Summer collection',
        height: 400,
        src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
      },
      sortDescription: 'Beat the heat with our cool collection',
      title: 'Summer Essentials',
    },
  },
}

export const WinterCollection: Story = {
  args: {
    collection: {
      ...mockCollection,
      color: 'bg-blue-50',
      image: {
        width: 400,
        alt: 'Winter collection',
        height: 400,
        src: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop',
      },
      sortDescription: 'Stay cozy with our winter essentials',
      title: 'Winter Warmth',
    },
  },
}

export const NoImage: Story = {
  args: {
    collection: {
      ...mockCollection,
      image: undefined,
    },
  },
}

export const LongTitle: Story = {
  args: {
    collection: {
      ...mockCollection,
      sortDescription: 'Luxury items handpicked by our fashion experts for the discerning customer',
      title: 'Premium Designer Collection',
    },
  },
}

export const HTMLDescription: Story = {
  args: {
    collection: {
      ...mockCollection,
      sortDescription: '<strong>Limited Edition</strong> items with <em>exclusive</em> designs',
    },
  },
}

export const NoHandle: Story = {
  args: {
    collection: {
      ...mockCollection,
      handle: undefined,
    },
  },
}

export const DifferentBackgrounds: Story = {
  render: () => (
    <div className="max-w-2xl space-y-6">
      <CollectionCard3
        collection={{
          ...mockCollection,
          color: 'bg-green-50',
          sortDescription: 'Bloom into spring with fresh styles',
          title: 'Spring Collection',
        }}
      />
      <CollectionCard3
        collection={{
          ...mockCollection,
          color: 'bg-orange-50',
          sortDescription: 'Autumn vibes with rich textures',
          title: 'Fall Collection',
        }}
      />
      <CollectionCard3
        collection={{
          ...mockCollection,
          color: 'bg-purple-50',
          sortDescription: 'Premium quality meets timeless design',
          title: 'Luxury Collection',
        }}
      />
    </div>
  ),
}

export const Grid: Story = {
  render: () => (
    <div className="grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">
      {[
        {
          color: 'bg-blue-50',
          desc: 'Comfort meets style in our sporty collection',
          image: 'photo-1571019613454-1cb2f99b2d8b',
          title: 'Athleisure',
        },
        {
          color: 'bg-gray-50',
          desc: 'Professional looks for the modern workplace',
          image: 'photo-1507003211169-0a1dd7228f2d',
          title: 'Business Casual',
        },
        {
          color: 'bg-pink-50',
          desc: 'Elegant pieces for special occasions',
          image: 'photo-1515372039744-b8f02a3ae446',
          title: 'Date Night',
        },
        {
          color: 'bg-green-50',
          desc: 'Relaxed styles for your downtime',
          image: 'photo-1521572163474-6864f9cf17ab',
          title: 'Weekend Vibes',
        },
      ].map((item, index) => (
        <CollectionCard3
          key={index}
          collection={{
            id: `gid://${index}`,
            color: item.color,
            handle: item.title.toLowerCase().replace(' ', '-'),
            image: {
              width: 400,
              alt: item.title,
              height: 400,
              src: `https://images.unsplash.com/${item.image}?w=400&h=400&fit=crop`,
            },
            sortDescription: item.desc,
            title: item.title,
          }}
        />
      ))}
    </div>
  ),
}

export const ResponsiveLayout: Story = {
  render: () => (
    <div className="max-w-4xl space-y-4">
      <div className="mb-4 text-sm text-gray-600">
        Responsive: Single column on mobile, side-by-side on larger screens
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <CollectionCard3 collection={mockCollection} />
        <CollectionCard3
          collection={{
            ...mockCollection,
            color: 'bg-pink-50',
            sortDescription: 'Curated picks from our editors',
            title: 'Featured Items',
          }}
        />
      </div>
    </div>
  ),
}
