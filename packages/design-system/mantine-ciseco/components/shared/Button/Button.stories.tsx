import { Meta, StoryObj } from '@storybook/react';

import Button from './Button';

const meta: Meta<typeof Button> = {
  argTypes: {
    as: {
      control: false,
      description: 'Component type to render as',
    },
    children: {
      control: 'text',
      description: 'Button content',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    fontSize: {
      control: 'text',
      description: 'Font size classes',
    },
    href: {
      control: 'text',
      description: 'URL to link to (makes button render as link)',
    },
    loading: {
      control: 'boolean',
      description: 'Whether the button is in loading state',
    },
    sizeClass: {
      control: 'text',
      description: 'Size padding classes',
    },
    targetBlank: {
      control: 'boolean',
      description: 'Whether to open link in new tab',
    },
  },
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          'A flexible button component that can render as different elements and supports loading states.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/Shared/Button',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default Button',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading Button',
    loading: true,
  },
};

export const AsLink: Story = {
  args: {
    children: 'Link Button',
    href: 'https://example.com',
  },
};

export const ExternalLink: Story = {
  args: {
    children: 'External Link',
    href: 'https://example.com',
    targetBlank: true,
  },
};

export const CustomSizing: Story = {
  args: {
    children: 'Large Button',
    fontSize: 'text-lg font-medium',
    sizeClass: 'py-4 px-8',
  },
};

export const SmallButton: Story = {
  args: {
    children: 'Small Button',
    fontSize: 'text-sm',
    sizeClass: 'py-2 px-3',
  },
};

export const CustomStyling: Story = {
  args: {
    children: 'Custom Styled',
    className: 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600',
  },
};

export const PrimaryVariant: Story = {
  args: {
    children: 'Primary Button',
    className: 'bg-primary-600 text-white hover:bg-primary-700 border border-primary-600',
  },
};

export const SecondaryVariant: Story = {
  args: {
    children: 'Secondary Button',
    className: 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300',
  },
};

export const OutlineVariant: Story = {
  args: {
    children: 'Outline Button',
    className: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
  },
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Button fontSize="text-xs" sizeClass="py-1 px-2">
        XS
      </Button>
      <Button fontSize="text-sm" sizeClass="py-2 px-3">
        Small
      </Button>
      <Button>Medium (Default)</Button>
      <Button fontSize="text-lg" sizeClass="py-4 px-6">
        Large
      </Button>
      <Button fontSize="text-xl" sizeClass="py-5 px-8">
        XL
      </Button>
    </div>
  ),
};

export const ButtonStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Button>Normal</Button>
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
      </div>
      <div className="flex space-x-4">
        <Button className="bg-blue-600 text-white hover:bg-blue-700">Primary</Button>
        <Button className="bg-blue-600 text-white" disabled>
          Primary Disabled
        </Button>
        <Button className="bg-blue-600 text-white" loading>
          Primary Loading
        </Button>
      </div>
    </div>
  ),
};

export const PolymorphicUsage: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Button>Button Element</Button>
        <Button as="div">Div Element</Button>
        <Button href="https://example.com">Link Element</Button>
      </div>
    </div>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <div className="w-64">
      <Button className="w-full justify-center bg-blue-600 text-white hover:bg-blue-700">
        Full Width Button
      </Button>
    </div>
  ),
};
