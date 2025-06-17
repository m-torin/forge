import { Meta, StoryObj } from '@storybook/react';

import Input from './Input';

const meta: Meta<typeof Input> = {
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    fontClass: {
      control: 'text',
      description: 'Font styling classes',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    rounded: {
      control: 'text',
      description: 'Border radius classes',
    },
    sizeClass: {
      control: 'text',
      description: 'Size and padding classes',
    },
    type: {
      control: 'select',
      description: 'Input type',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
    },
  },
  component: Input,
  parameters: {
    docs: {
      description: {
        component:
          'A flexible input component with customizable styling, size, and rounded corners.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/Shared/Input',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const Email: Story = {
  args: {
    placeholder: 'Enter your email...',
    type: 'email',
  },
};

export const Password: Story = {
  args: {
    placeholder: 'Enter password...',
    type: 'password',
  },
};

export const Search: Story = {
  args: {
    placeholder: 'Search products...',
    type: 'search',
  },
};

export const Number: Story = {
  args: {
    max: 100,
    min: 0,
    placeholder: 'Enter quantity...',
    type: 'number',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input...',
  },
};

export const WithValue: Story = {
  args: {
    placeholder: 'Enter text...',
    value: 'Sample text content',
  },
};

export const Required: Story = {
  args: {
    placeholder: 'Required field...',
    required: true,
  },
};

export const RectangularCorners: Story = {
  args: {
    placeholder: 'Rectangular input...',
    rounded: 'rounded-lg',
  },
};

export const SquareCorners: Story = {
  args: {
    placeholder: 'Square corners...',
    rounded: 'rounded-none',
  },
};

export const SmallSize: Story = {
  args: {
    fontClass: 'text-xs font-normal',
    placeholder: 'Small input...',
    sizeClass: 'h-8 px-3 py-2',
  },
};

export const LargeSize: Story = {
  args: {
    fontClass: 'text-lg font-normal',
    placeholder: 'Large input...',
    sizeClass: 'h-14 px-6 py-4',
  },
};

export const CustomStyling: Story = {
  args: {
    className: 'border-blue-300 focus:border-blue-500 focus:ring-blue-200',
    placeholder: 'Custom styled input...',
  },
};

export const FormInputs: Story = {
  render: () => (
    <form className="space-y-4 w-80">
      <div>
        <label className="block text-sm font-medium mb-2">Name</label>
        <Input placeholder="Enter your name..." />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <Input placeholder="Enter your email..." type="email" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Phone</label>
        <Input placeholder="Enter your phone..." type="tel" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Website</label>
        <Input placeholder="Enter your website..." type="url" />
      </div>
    </form>
  ),
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <label className="block text-sm font-medium mb-2">Small</label>
        <Input
          fontClass="text-xs font-normal"
          placeholder="Small input..."
          sizeClass="h-8 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Default</label>
        <Input placeholder="Default input..." />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Large</label>
        <Input
          fontClass="text-lg font-normal"
          placeholder="Large input..."
          sizeClass="h-14 px-6 py-4"
        />
      </div>
    </div>
  ),
};

export const DifferentRounds: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <label className="block text-sm font-medium mb-2">Square</label>
        <Input placeholder="Square corners..." rounded="rounded-none" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Small Rounded</label>
        <Input placeholder="Small rounded..." rounded="rounded" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Medium Rounded</label>
        <Input placeholder="Medium rounded..." rounded="rounded-lg" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Fully Rounded (Default)</label>
        <Input placeholder="Fully rounded..." rounded="rounded-full" />
      </div>
    </div>
  ),
};

export const ValidationStates: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <label className="block text-sm font-medium mb-2">Normal</label>
        <Input placeholder="Normal state..." />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2 text-green-700">Success</label>
        <Input
          className="border-green-300 focus:border-green-500 focus:ring-green-200"
          placeholder="Success state..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2 text-red-700">Error</label>
        <Input
          className="border-red-300 focus:border-red-500 focus:ring-red-200"
          placeholder="Error state..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-500">Disabled</label>
        <Input disabled placeholder="Disabled state..." />
      </div>
    </div>
  ),
};
