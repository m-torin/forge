import CollectionCard4 from './CollectionCard4'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof CollectionCard4> = {
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
  component: CollectionCard4,
  parameters: {
    docs: {
      description: {
        component:
          'A card-style collection component with circular image, arrow icon, and optional background SVG. Features a clean vertical layout with hover effects.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/CollectionCard4',
}

export default meta
type Story = StoryObj<typeof meta>

const mockCollection = {
  id: 'gid://1',
  color: 'bg-yellow-50',
  count: 127,
  description: 'Stylish pieces for the sunny season',
  handle: 'summer-collection',
  image: {
    width: 200,
    alt: 'Summer collection',
    height: 200,
    src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
  },
  sortDescription: 'Light & airy fabrics',
  title: 'Summer Collection',
}

export const Default: Story = {
  args: {
    collection: mockCollection,
  },
}

export const WithBackgroundSVG: Story = {
  args: {
    bgSvgUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop&auto=format',
    collection: mockCollection,
  },
}

export const WinterCollection: Story = {
  args: {
    collection: {
      ...mockCollection,
      color: 'bg-blue-50',
      count: 89,
      image: {
        width: 200,
        alt: 'Winter collection',
        height: 200,
        src: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop',
      },
      sortDescription: 'Warm & cozy pieces',
      title: 'Winter Essentials',
    },
  },
}

export const LuxuryCollection: Story = {
  args: {
    collection: {
      ...mockCollection,
      color: 'bg-purple-50',
      count: 45,
      image: {
        width: 200,
        alt: 'Luxury collection',
        height: 200,
        src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
      },
      sortDescription: 'Premium materials & craftsmanship',
      title: 'Luxury Line',
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

export const LargeCount: Story = {
  args: {
    collection: {
      ...mockCollection,
      count: 1250,
    },
  },
}

export const HTMLContent: Story = {
  args: {
    collection: {
      ...mockCollection,
      sortDescription: '<em>Curated</em> by our experts',
      title: '<strong>Featured</strong> Collection',
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
    <div className="grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[
        {
          color: 'bg-blue-50',
          count: 156,
          desc: 'Active & comfortable',
          image: 'photo-1571019613454-1cb2f99b2d8b',
          title: 'Athleisure',
        },
        {
          color: 'bg-gray-50',
          count: 98,
          desc: 'Professional & elegant',
          image: 'photo-1507003211169-0a1dd7228f2d',
          title: 'Formal Wear',
        },
        {
          color: 'bg-pink-50',
          count: 203,
          desc: 'Effortlessly stylish',
          image: 'photo-1515372039744-b8f02a3ae446',
          title: 'Casual Chic',
        },
        {
          color: 'bg-green-50',
          count: 87,
          desc: 'Urban & trendy',
          image: 'photo-1521572163474-6864f9cf17ab',
          title: 'Street Style',
        },
        {
          color: 'bg-amber-50',
          count: 67,
          desc: 'Timeless classics',
          image: 'photo-1445205170230-053b83016050',
          title: 'Vintage',
        },
        {
          color: 'bg-neutral-50',
          count: 134,
          desc: 'Clean & simple',
          image: 'photo-1434389677669-e08b4cac3105',
          title: 'Minimalist',
        },
      ].map((item, index) => (
        <CollectionCard4
          key={index}
          collection={{
            id: `gid://${index}`,
            color: item.color,
            count: item.count,
            handle: item.title.toLowerCase().replace(' ', '-'),
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

export const WithCustomStyling: Story = {
  args: {
    className: 'shadow-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50',
    collection: mockCollection,
  },
}

export const ResponsiveLayout: Story = {
  render: () => (
    <div className="max-w-5xl space-y-4">
      <div className="mb-4 text-sm text-gray-600">Responsive grid: 1 column on mobile, 2 on tablet, 3 on desktop</div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <CollectionCard4
            key={`collection-card-${i}`}
            collection={{
              id: `gid://${i}`,
              color: ['bg-blue-50', 'bg-green-50', 'bg-purple-50', 'bg-pink-50', 'bg-yellow-50', 'bg-indigo-50'][i],
              count: Math.floor(Math.random() * 200) + 50,
              handle: `collection-${i + 1}`,
              image: {
                width: 200,
                alt: `Collection ${i + 1}`,
                height: 200,
                src: `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop&seed=${i}`,
              },
              sortDescription: `Style category ${i + 1}`,
              title: `Collection ${i + 1}`,
            }}
          />
        ))}
      </div>
    </div>
  ),
}
