import type { Meta, StoryObj } from '@storybook/nextjs';

const HelloWorld = () => (
  <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
    <h1>Hello World!</h1>
    <p>This is a simple test story to ensure Storybook builds successfully.</p>
  </div>
);

const meta: Meta<typeof HelloWorld> = {
  title: 'Test/HelloWorld',
  component: HelloWorld,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
