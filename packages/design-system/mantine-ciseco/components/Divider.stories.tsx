import { Meta, StoryObj } from '@storybook/react';

import { Divider } from './Divider';

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
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    soft: false,
  },
  render: (args: any) => (
    <div className="w-64">
      <p className="text-sm text-gray-600 mb-4">Content above divider</p>
      <Divider {...args} />
      <p className="text-sm text-gray-600 mt-4">Content below divider</p>
    </div>
  ),
};

export const Soft: Story = {
  args: {
    soft: true,
  },
  render: (args: any) => (
    <div className="w-64">
      <p className="text-sm text-gray-600 mb-4">Content above divider</p>
      <Divider {...args} />
      <p className="text-sm text-gray-600 mt-4">Content below divider</p>
    </div>
  ),
};

export const WithCustomStyling: Story = {
  args: {
    className: 'my-8 border-blue-300',
    soft: false,
  },
  render: (args: any) => (
    <div className="w-64">
      <p className="text-sm text-gray-600 mb-4">Content above divider</p>
      <Divider {...args} />
      <p className="text-sm text-gray-600 mt-4">Content below divider</p>
    </div>
  ),
};

export const Comparison: Story = {
  render: () => (
    <div className="w-80 space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-4">Regular Divider</h3>
        <p className="text-sm text-gray-600 mb-4">Some content here</p>
        <Divider soft={false} />
        <p className="text-sm text-gray-600 mt-4">More content here</p>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-4">Soft Divider</h3>
        <p className="text-sm text-gray-600 mb-4">Some content here</p>
        <Divider soft={true} />
        <p className="text-sm text-gray-600 mt-4">More content here</p>
      </div>
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="bg-white rounded-lg shadow-lg p-6 w-80">
      <h2 className="text-lg font-semibold mb-4">Card Title</h2>
      <p className="text-sm text-gray-600 mb-4">
        This is some content in a card component. The divider helps separate different sections.
      </p>
      <Divider />
      <p className="text-sm text-gray-600 mt-4">
        This is content in another section after the divider.
      </p>
      <Divider soft />
      <div className="mt-4 flex justify-between items-center text-sm">
        <span className="text-gray-500">Footer content</span>
        <button className="text-blue-600 hover:text-blue-700">Action</button>
      </div>
    </div>
  ),
};

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
};

export const WithMargin: Story = {
  render: () => (
    <div className="w-64">
      <p className="text-sm text-gray-600">Content above</p>
      <Divider className="my-8" />
      <p className="text-sm text-gray-600">Content below with more space</p>
    </div>
  ),
};
