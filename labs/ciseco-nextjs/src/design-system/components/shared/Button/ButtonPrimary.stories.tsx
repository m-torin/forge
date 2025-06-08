import ButtonPrimary from './ButtonPrimary';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ButtonPrimary> = {
  argTypes: {
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
  },
  component: ButtonPrimary,
  parameters: {
    docs: {
      description: {
        component:
          'A primary button component with dark styling and hover effects, extending the base Button component.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/Shared/ButtonPrimary',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Primary Button',
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

export const Small: Story = {
  args: {
    children: 'Small Button',
    fontSize: 'text-sm',
    sizeClass: 'py-2 px-3',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    fontSize: 'text-lg font-medium',
    sizeClass: 'py-4 px-8',
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <div className="flex items-center space-x-2">
        <svg stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4" fill="none">
          <path
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        <span>Add Item</span>
      </div>
    ),
  },
};

export const CallToAction: Story = {
  args: {
    children: 'Get Started Today',
    fontSize: 'text-lg font-semibold',
    sizeClass: 'py-4 px-8',
  },
};

export const ButtonStates: Story = {
  render: () => (
    <div className="flex space-x-4">
      <ButtonPrimary>Normal</ButtonPrimary>
      <ButtonPrimary disabled>Disabled</ButtonPrimary>
      <ButtonPrimary loading>Loading</ButtonPrimary>
    </div>
  ),
};

export const ButtonSizes: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <ButtonPrimary fontSize="text-xs" sizeClass="py-1 px-2">
        XS
      </ButtonPrimary>
      <ButtonPrimary fontSize="text-sm" sizeClass="py-2 px-3">
        Small
      </ButtonPrimary>
      <ButtonPrimary>Medium</ButtonPrimary>
      <ButtonPrimary fontSize="text-lg" sizeClass="py-4 px-6">
        Large
      </ButtonPrimary>
      <ButtonPrimary fontSize="text-xl" sizeClass="py-5 px-8">
        XL
      </ButtonPrimary>
    </div>
  ),
};

export const ActionButtons: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex space-x-3">
        <ButtonPrimary>Save Changes</ButtonPrimary>
        <ButtonPrimary>Cancel</ButtonPrimary>
      </div>
      <div className="flex space-x-3">
        <ButtonPrimary>Add to Cart</ButtonPrimary>
        <ButtonPrimary>Buy Now</ButtonPrimary>
      </div>
      <div className="flex space-x-3">
        <ButtonPrimary>Sign Up</ButtonPrimary>
        <ButtonPrimary>Learn More</ButtonPrimary>
      </div>
    </div>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <div className="w-64">
      <ButtonPrimary className="w-full justify-center">Full Width Button</ButtonPrimary>
    </div>
  ),
};

export const CustomStyling: Story = {
  args: {
    children: 'Custom Button',
    className:
      'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200',
  },
};
