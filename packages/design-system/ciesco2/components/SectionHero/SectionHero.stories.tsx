import type { Meta, StoryObj } from '@storybook/react';
import { SectionHero } from '@repo/design-system/ciesco2';

const meta: Meta<typeof SectionHero> = {
  title: 'ciesco2/SectionHero',
  component: SectionHero,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500',
  },
};

export const MinimalHeight: Story = {
  args: {
    className: 'min-h-[60vh]',
  },
};

export const FullHeight: Story = {
  args: {
    className: 'min-h-screen',
  },
};