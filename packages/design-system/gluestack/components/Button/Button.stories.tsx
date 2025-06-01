import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@repo/design-system/gluestack';
import { View, Text } from 'react-native';

const meta: Meta<typeof Button> = {
  title: 'gluestack/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    disabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
    fullWidth: {
      control: 'boolean',
    },
  },
  decorators: [
    (Story: any) => (
      <View style={{ padding: 20 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Destructive Button',
    variant: 'destructive',
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

export const Sizes: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </View>
  ),
};

export const Variants: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </View>
  ),
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
};

export const InteractiveExample: Story = {
  render: () => (
    <View style={{ gap: 20, width: 300 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
        React Native Button Examples
      </Text>
      <Button variant="primary" onPress={() => alert('Primary pressed!')}>
        Press Me (Primary)
      </Button>
      <Button variant="outline" onPress={() => alert('Outline pressed!')}>
        Press Me (Outline)
      </Button>
      <Button variant="ghost" size="sm">
        Small Ghost Button
      </Button>
    </View>
  ),
};