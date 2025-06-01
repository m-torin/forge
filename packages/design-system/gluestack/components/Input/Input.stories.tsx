import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@repo/design-system/gluestack';
import { View, Text } from 'react-native';

const meta: Meta<typeof Input> = {
  title: 'gluestack/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the input',
    },
    variant: {
      control: 'select',
      options: ['outline', 'filled', 'underlined'],
      description: 'Visual style variant',
    },
  },
  decorators: [
    (Story: any) => (
      <View style={{ padding: 20, width: 300 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  render: (args: any) => (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>
        Email Address
      </Text>
      <Input {...args} placeholder="john@example.com" />
    </View>
  ),
};

export const Password: Story = {
  args: {
    placeholder: 'Enter password...',
    secureTextEntry: true,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
    value: 'Cannot edit this',
  },
};

export const Sizes: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <View>
        <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Small</Text>
        <Input size="sm" placeholder="Small input" />
      </View>
      <View>
        <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Medium</Text>
        <Input size="md" placeholder="Medium input" />
      </View>
      <View>
        <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Large</Text>
        <Input size="lg" placeholder="Large input" />
      </View>
    </View>
  ),
};

export const Variants: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <View>
        <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Outline</Text>
        <Input variant="outline" placeholder="Outlined input" />
      </View>
      <View>
        <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Filled</Text>
        <Input variant="filled" placeholder="Filled input" />
      </View>
      <View>
        <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Underlined</Text>
        <Input variant="underlined" placeholder="Underlined input" />
      </View>
    </View>
  ),
};

export const FormExample: Story = {
  render: () => (
    <View style={{ gap: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
        Contact Form
      </Text>
      <View style={{ gap: 4 }}>
        <Text style={{ fontSize: 14, fontWeight: '500' }}>Name</Text>
        <Input placeholder="Your full name" />
      </View>
      <View style={{ gap: 4 }}>
        <Text style={{ fontSize: 14, fontWeight: '500' }}>Email</Text>
        <Input placeholder="your@email.com" />
      </View>
      <View style={{ gap: 4 }}>
        <Text style={{ fontSize: 14, fontWeight: '500' }}>Phone</Text>
        <Input placeholder="+1 (555) 123-4567" />
      </View>
      <View style={{ gap: 4 }}>
        <Text style={{ fontSize: 14, fontWeight: '500' }}>Message</Text>
        <Input 
          placeholder="Your message here..." 
          multiline 
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />
      </View>
    </View>
  ),
};