import Prices from './Prices'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Prices> = {
  argTypes: {
    className: {
      control: 'text',
      description: 'CSS classes for the wrapper',
    },
    contentClass: {
      control: 'text',
      description: 'CSS classes for the content styling',
    },
    price: {
      control: 'number',
      description: 'The price to display',
    },
  },
  component: Prices,
  parameters: {
    docs: {
      description: {
        component: 'A price display component with green styling and customizable appearance.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/Prices',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    price: 29.99,
  },
}

export const SmallPrice: Story = {
  args: {
    price: 9.99,
  },
}

export const LargePrice: Story = {
  args: {
    price: 1299.99,
  },
}

export const FreePrice: Story = {
  args: {
    price: 0,
  },
}

export const CustomStyling: Story = {
  args: {
    className: 'transform hover:scale-105 transition-transform',
    contentClass: 'py-2 px-4 text-lg font-bold',
    price: 49.99,
  },
}

export const CompactStyle: Story = {
  args: {
    contentClass: 'py-1 px-2 text-xs font-medium',
    price: 19.99,
  },
}

export const LargeStyle: Story = {
  args: {
    contentClass: 'py-3 px-6 text-xl font-bold',
    price: 89.99,
  },
}

export const WithDecimalPlaces: Story = {
  args: {
    price: 25.5,
  },
}

export const HighPrecision: Story = {
  args: {
    price: 99.999,
  },
}

export const MultiplePrices: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Prices price={9.99} />
      <Prices price={29.99} />
      <Prices price={49.99} />
      <Prices price={99.99} />
      <Prices price={199.99} />
    </div>
  ),
}

export const DifferentSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Prices contentClass="py-1 px-2 text-xs font-medium" price={29.99} />
      <Prices contentClass="py-1.5 px-3 text-sm font-medium" price={29.99} />
      <Prices contentClass="py-2 px-4 text-base font-medium" price={29.99} />
      <Prices contentClass="py-3 px-6 text-lg font-bold" price={29.99} />
      <Prices contentClass="py-4 px-8 text-xl font-bold" price={29.99} />
    </div>
  ),
}

export const InProductCard: Story = {
  render: () => (
    <div className="max-w-sm rounded-lg bg-white p-6 shadow-lg">
      <div className="mb-4 h-48 rounded-lg bg-gray-200" />
      <h3 className="mb-2 text-lg font-semibold">Product Name</h3>
      <p className="mb-4 text-sm text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      <div className="flex items-center justify-between">
        <Prices price={49.99} />
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
          Add to Cart
        </button>
      </div>
    </div>
  ),
}
