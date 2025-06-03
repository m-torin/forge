import Image from 'next/image';

import { AspectRatio } from '@repo/design-system/uix';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * Displays content within a desired ratio.
 */
const meta: Meta<typeof AspectRatio> = {
  argTypes: {},
  component: AspectRatio,
  decorators: [
    (Story: any) => (
      <div className="w-1/2">
        <Story />
      </div>
    ),
  ],
  render: (args: any) => (
    <AspectRatio {...args} className="bg-slate-50 dark:bg-slate-800">
      <Image
        className="rounded-md object-cover"
        alt="Photo by Alvaro Pinot"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        src="https://images.unsplash.com/photo-1576075796033-848c2a5f3696?w=800&dpr=2&q=80"
      />
    </AspectRatio>
  ),
  tags: ['autodocs'],
  title: 'uix/ui/AspectRatio',
} satisfies Meta<typeof AspectRatio>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the aspect ratio.
 */
export const Default: Story = {
  args: {
    ratio: 16 / 9,
  },
};

/**
 * Use the `1:1` aspect ratio to display a square image.
 */
export const Square: Story = {
  args: {
    ratio: 1,
  },
};

/**
 * Use the `4:3` aspect ratio to display a landscape image.
 */
export const Landscape: Story = {
  args: {
    ratio: 4 / 3,
  },
};

/**
 * Use the `2.35:1` aspect ratio to display a cinemascope image.
 */
export const Cinemascope: Story = {
  args: {
    ratio: 2.35 / 1,
  },
};
