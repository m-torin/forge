import Heading from './Heading';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Heading> = {
  argTypes: {
    children: {
      control: 'text',
      description: 'Heading text content',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    description: {
      control: 'text',
      description: 'Optional description text below the heading',
    },
    fontClass: {
      control: 'text',
      description: 'CSS classes for font styling',
    },
    hasNextPrev: {
      control: 'boolean',
      description: 'Whether to show next/prev navigation buttons',
    },
    headingDim: {
      control: 'text',
      description: 'Dimmed text that appears after the main heading',
    },
    isCenter: {
      control: 'boolean',
      description: 'Whether to center align the heading',
    },
    level: {
      control: 'select',
      description: 'HTML heading level',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    },
    nextBtnDisabled: {
      control: 'boolean',
      description: 'Whether the next button is disabled',
    },
    onClickNext: {
      action: 'next clicked',
      description: 'Next button click handler',
    },
    onClickPrev: {
      action: 'prev clicked',
      description: 'Previous button click handler',
    },
    prevBtnDisabled: {
      control: 'boolean',
      description: 'Whether the previous button is disabled',
    },
  },
  component: Heading,
  parameters: {
    docs: {
      description: {
        component:
          'A flexible heading component with support for descriptions, different levels, navigation controls, and centering.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/Heading',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default Heading',
  },
};

export const WithDescription: Story = {
  args: {
    children: 'Heading with Description',
    description:
      'This is a description that provides additional context about the section or content that follows.',
  },
};

export const WithDimText: Story = {
  args: {
    children: 'Main Heading',
    headingDim: 'dimmed text',
  },
};

export const Centered: Story = {
  args: {
    children: 'Centered Heading',
    description: 'This heading and description are centered on the page.',
    isCenter: true,
  },
};

export const WithNavigation: Story = {
  args: {
    children: 'Heading with Navigation',
    description: 'This heading includes next and previous navigation buttons.',
    hasNextPrev: true,
  },
};

export const H1Level: Story = {
  args: {
    children: 'H1 Heading',
    fontClass: 'text-4xl md:text-5xl font-bold',
    level: 'h1',
  },
};

export const H3Level: Story = {
  args: {
    children: 'H3 Heading',
    fontClass: 'text-xl md:text-2xl font-semibold',
    level: 'h3',
  },
};

export const SmallHeading: Story = {
  args: {
    children: 'Small Heading',
    className: 'mb-6',
    fontClass: 'text-lg font-medium',
    level: 'h4',
  },
};

export const CustomStyling: Story = {
  args: {
    children: 'Custom Styled Heading',
    className: 'mb-8 p-4 bg-blue-50 rounded-lg',
    description: 'This heading has custom colors and styling.',
    fontClass: 'text-2xl font-bold text-blue-600',
  },
};

export const NavigationStates: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-2xl">
      <Heading hasNextPrev>Both buttons enabled</Heading>
      <Heading hasNextPrev prevBtnDisabled>
        Previous disabled
      </Heading>
      <Heading hasNextPrev nextBtnDisabled>
        Next disabled
      </Heading>
      <Heading hasNextPrev nextBtnDisabled prevBtnDisabled>
        Both disabled
      </Heading>
    </div>
  ),
};

export const DifferentLevels: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-2xl">
      <Heading fontClass="text-4xl font-bold" level="h1">
        H1 Heading
      </Heading>
      <Heading fontClass="text-3xl font-semibold" level="h2">
        H2 Heading
      </Heading>
      <Heading fontClass="text-2xl font-semibold" level="h3">
        H3 Heading
      </Heading>
      <Heading fontClass="text-xl font-medium" level="h4">
        H4 Heading
      </Heading>
      <Heading fontClass="text-lg font-medium" level="h5">
        H5 Heading
      </Heading>
      <Heading fontClass="text-base font-medium" level="h6">
        H6 Heading
      </Heading>
    </div>
  ),
};

export const AllFeatures: Story = {
  args: {
    children: 'Complete Heading Example',
    description:
      'This heading demonstrates all available features including description text, dimmed heading text, and navigation controls.',
    hasNextPrev: true,
    headingDim: 'with all features',
    isCenter: false,
    level: 'h2',
  },
};

export const CenteredWithNavigation: Story = {
  args: {
    children: 'Centered with Description',
    description:
      'This is a centered heading with a description. Navigation is not shown when centered.',
    hasNextPrev: true, // This won't show because isCenter is true
    isCenter: true,
  },
};

export const SectionHeaders: Story = {
  render: () => (
    <div className="space-y-12 w-full max-w-4xl">
      <Heading
        description="Welcome to our product showcase"
        fontClass="text-4xl font-bold"
        isCenter
        level="h1"
      >
        Product Showcase
      </Heading>

      <Heading description="Browse through our featured items" hasNextPrev level="h2">
        Featured Products
      </Heading>

      <Heading description="Read what our customers have to say" level="h2">
        Customer Reviews
      </Heading>

      <Heading fontClass="text-xl font-medium" className="mb-6" level="h3">
        Related Items
      </Heading>
    </div>
  ),
};
