import type { Meta, StoryObj } from '@storybook/react';
import { Header } from '@repo/design-system/ciesco2';

const meta: Meta<typeof Header> = {
  title: 'ciesco2/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    hasBorderBottom: {
      control: 'boolean',
      description: 'Whether to show border bottom',
    },
  },
  decorators: [
    (Story: any) => (
      <div style={{ minHeight: '100px', background: '#f8f9fa' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithBackground: Story = {
  args: {
    hasBorderBottom: true,
  },
  decorators: [
    (Story: any) => (
      <div style={{ minHeight: '100px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Story />
      </div>
    ),
  ],
};

export const Transparent: Story = {
  args: {
    hasBorderBottom: false,
  },
  decorators: [
    (Story: any) => (
      <div 
        style={{ 
          minHeight: '400px', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative'
        }}
      >
        <Story />
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Welcome to Our Store</h1>
          <p style={{ fontSize: '1.2rem' }}>Discover amazing products at great prices</p>
        </div>
      </div>
    ),
  ],
};

export const DarkMode: Story = {
  args: {
    hasBorderBottom: true,
  },
  decorators: [
    (Story: any) => (
      <div style={{ minHeight: '100px', background: '#1a1a1a' }}>
        <Story />
      </div>
    ),
  ],
};