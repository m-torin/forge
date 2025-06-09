import { Divider } from './Divider'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Divider> = {
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes for styling',
    },
    soft: {
      control: 'boolean',
      description: 'Whether to use a softer, lighter border',
    },
  },
  component: Divider,
  parameters: {
    docs: {
      description: {
        component: 'A horizontal divider component with soft and regular border options.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/Divider',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    soft: false,
  },
  render: (args) => (
    <div className="w-64">
      <p className="mb-4 text-sm text-gray-600">Content above divider</p>
      <Divider {...args} />
      <p className="mt-4 text-sm text-gray-600">Content below divider</p>
    </div>
  ),
}

export const Soft: Story = {
  args: {
    soft: true,
  },
  render: (args) => (
    <div className="w-64">
      <p className="mb-4 text-sm text-gray-600">Content above divider</p>
      <Divider {...args} />
      <p className="mt-4 text-sm text-gray-600">Content below divider</p>
    </div>
  ),
}

export const WithCustomStyling: Story = {
  args: {
    className: 'my-8 border-blue-300',
    soft: false,
  },
  render: (args) => (
    <div className="w-64">
      <p className="mb-4 text-sm text-gray-600">Content above divider</p>
      <Divider {...args} />
      <p className="mt-4 text-sm text-gray-600">Content below divider</p>
    </div>
  ),
}

export const Comparison: Story = {
  render: () => (
    <div className="w-80 space-y-8">
      <div>
        <h3 className="mb-4 text-sm font-medium">Regular Divider</h3>
        <p className="mb-4 text-sm text-gray-600">Some content here</p>
        <Divider soft={false} />
        <p className="mt-4 text-sm text-gray-600">More content here</p>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-medium">Soft Divider</h3>
        <p className="mb-4 text-sm text-gray-600">Some content here</p>
        <Divider soft={true} />
        <p className="mt-4 text-sm text-gray-600">More content here</p>
      </div>
    </div>
  ),
}

export const InCard: Story = {
  render: () => (
    <div className="w-80 rounded-lg bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-lg font-semibold">Card Title</h2>
      <p className="mb-4 text-sm text-gray-600">
        This is some content in a card component. The divider helps separate different sections.
      </p>
      <Divider />
      <p className="mt-4 text-sm text-gray-600">This is content in another section after the divider.</p>
      <Divider soft />
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-gray-500">Footer content</span>
        <button className="text-blue-600 hover:text-blue-700">Action</button>
      </div>
    </div>
  ),
}

export const MultipleDividers: Story = {
  render: () => (
    <div className="w-80 space-y-0">
      <div className="p-4">
        <h3 className="font-medium">Section 1</h3>
        <p className="text-sm text-gray-600">Content for first section</p>
      </div>
      <Divider />
      <div className="p-4">
        <h3 className="font-medium">Section 2</h3>
        <p className="text-sm text-gray-600">Content for second section</p>
      </div>
      <Divider soft />
      <div className="p-4">
        <h3 className="font-medium">Section 3</h3>
        <p className="text-sm text-gray-600">Content for third section</p>
      </div>
      <Divider />
      <div className="p-4">
        <h3 className="font-medium">Section 4</h3>
        <p className="text-sm text-gray-600">Content for fourth section</p>
      </div>
    </div>
  ),
}

export const WithMargin: Story = {
  render: () => (
    <div className="w-64">
      <p className="text-sm text-gray-600">Content above</p>
      <Divider className="my-8" />
      <p className="text-sm text-gray-600">Content below with more space</p>
    </div>
  ),
}
