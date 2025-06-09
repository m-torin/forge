import CollectionCard6 from './CollectionCard6'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof CollectionCard6> = {
  argTypes: {
    bgSvgUrl: {
      control: 'text',
      description: 'URL for background SVG decoration',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    collection: {
      control: 'object',
      description: 'Collection data object',
    },
  },
  component: CollectionCard6,
  parameters: {
    docs: {
      description: {
        component:
          'A square collection card with centered layout, circular image, and call-to-action link. Features subtle background image support.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/CollectionCard6',
}

export default meta
type Story = StoryObj<typeof meta>

const mockCollection = {
  id: 'gid://1',
  color: 'bg-yellow-50',
  count: 127,
  description: 'Light and breezy summer collection',
  handle: 'summer-vibes',
  image: {
    width: 200,
    alt: 'Summer collection',
    height: 200,
    src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
  },
  sortDescription: 'Bright & colorful',
  title: 'Summer Vibes',
}

export const Default: Story = {
  args: {
    collection: mockCollection,
  },
}

export const WithBackgroundSVG: Story = {
  args: {
    bgSvgUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop&auto=format',
    collection: mockCollection,
  },
}

export const ElegantCollection: Story = {
  args: {
    collection: {
      ...mockCollection,
      color: 'bg-purple-50',
      image: {
        width: 200,
        alt: 'Elegant collection',
        height: 200,
        src: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop',
      },
      sortDescription: 'Sophisticated & chic',
      title: 'Elegant Evening',
    },
  },
}

export const CasualCollection: Story = {
  args: {
    collection: {
      ...mockCollection,
      color: 'bg-green-50',
      image: {
        width: 200,
        alt: 'Casual collection',
        height: 200,
        src: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&h=200&fit=crop',
      },
      sortDescription: 'Relaxed & easy-going',
      title: 'Casual Comfort',
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
      sortDescription: 'Luxury meets functionality',
      title: 'Premium Designer Winter Collection',
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

export const Grid: Story = {
  render: () => (
    <div className="grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
      {[
        {
          color: 'bg-blue-50',
          desc: 'Active lifestyle',
          image: 'photo-1571019613454-1cb2f99b2d8b',
          title: 'Sporty',
        },
        {
          color: 'bg-gray-50',
          desc: 'Professional look',
          image: 'photo-1507003211169-0a1dd7228f2d',
          title: 'Business',
        },
        {
          color: 'bg-pink-50',
          desc: 'Night out style',
          image: 'photo-1515372039744-b8f02a3ae446',
          title: 'Party',
        },
        {
          color: 'bg-green-50',
          desc: 'Everyday wear',
          image: 'photo-1521572163474-6864f9cf17ab',
          title: 'Casual',
        },
        {
          color: 'bg-amber-50',
          desc: 'Retro vibes',
          image: 'photo-1445205170230-053b83016050',
          title: 'Vintage',
        },
        {
          color: 'bg-neutral-50',
          desc: 'Less is more',
          image: 'photo-1434389677669-e08b4cac3105',
          title: 'Minimal',
        },
        {
          color: 'bg-orange-50',
          desc: 'Free spirit',
          image: 'photo-1469334031218-e382a71b716b',
          title: 'Boho',
        },
        {
          color: 'bg-purple-50',
          desc: 'Sparkle & shine',
          image: 'photo-1523275335684-37898b6baf30',
          title: 'Glam',
        },
      ].map((item, index) => (
        <CollectionCard6
          key={index}
          collection={{
            id: `gid://${index}`,
            color: item.color,
            handle: item.title.toLowerCase(),
            image: {
              width: 200,
              alt: item.title,
              height: 200,
              src: `https://images.unsplash.com/${item.image}?w=200&h=200&fit=crop`,
            },
            sortDescription: item.desc,
            title: item.title,
          }}
        />
      ))}
    </div>
  ),
}

export const DifferentSizes: Story = {
  render: () => (
    <div className="grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Small (Mobile)</h3>
        <div className="w-48">
          <CollectionCard6 collection={mockCollection} />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Medium (Tablet)</h3>
        <div className="w-64">
          <CollectionCard6 collection={mockCollection} />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Large (Desktop)</h3>
        <div className="w-80">
          <CollectionCard6 collection={mockCollection} />
        </div>
      </div>
    </div>
  ),
}

export const SeasonalCollections: Story = {
  render: () => (
    <div className="grid max-w-5xl grid-cols-2 gap-6 lg:grid-cols-4">
      <CollectionCard6
        collection={{
          id: 'spring',
          color: 'bg-green-50',
          handle: 'spring',
          image: {
            width: 200,
            alt: 'Spring collection',
            height: 200,
            src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=200&h=200&fit=crop',
          },
          sortDescription: 'Fresh & floral',
          title: 'Spring',
        }}
      />
      <CollectionCard6
        collection={{
          id: 'summer',
          color: 'bg-yellow-50',
          handle: 'summer',
          image: {
            width: 200,
            alt: 'Summer collection',
            height: 200,
            src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
          },
          sortDescription: 'Bright & breezy',
          title: 'Summer',
        }}
      />
      <CollectionCard6
        collection={{
          id: 'fall',
          color: 'bg-orange-50',
          handle: 'fall',
          image: {
            width: 200,
            alt: 'Fall collection',
            height: 200,
            src: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop',
          },
          sortDescription: 'Warm & cozy',
          title: 'Fall',
        }}
      />
      <CollectionCard6
        collection={{
          id: 'winter',
          color: 'bg-blue-50',
          handle: 'winter',
          image: {
            width: 200,
            alt: 'Winter collection',
            height: 200,
            src: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop',
          },
          sortDescription: 'Elegant & layered',
          title: 'Winter',
        }}
      />
    </div>
  ),
}
