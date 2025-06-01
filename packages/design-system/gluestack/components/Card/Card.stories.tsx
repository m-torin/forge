import type { Meta, StoryObj } from '@storybook/react';
import { Card, Button } from '@repo/design-system/gluestack';
import { View, Text, Image } from 'react-native';

const meta: Meta<typeof Card> = {
  title: 'gluestack/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['elevated', 'outline', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
  decorators: [
    (Story: any) => (
      <View style={{ padding: 20, maxWidth: 400 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args: any) => (
    <Card {...args}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
          Card Title
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
          This is a simple card component built with React Native and styled for cross-platform compatibility.
        </Text>
        <Button variant="primary" size="sm">
          Action
        </Button>
      </View>
    </Card>
  ),
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
  },
  render: (args: any) => (
    <Card {...args}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
          Elevated Card
        </Text>
        <Text style={{ fontSize: 14, color: '#666' }}>
          This card has elevation/shadow for a raised appearance.
        </Text>
      </View>
    </Card>
  ),
};

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
  render: (args: any) => (
    <Card {...args}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
          Outline Card
        </Text>
        <Text style={{ fontSize: 14, color: '#666' }}>
          This card has a border but no background color.
        </Text>
      </View>
    </Card>
  ),
};

export const WithImage: Story = {
  render: () => (
    <Card variant="elevated">
      <Image
        source={{ uri: 'https://picsum.photos/400/200' }}
        style={{ width: '100%', height: 200 }}
        resizeMode="cover"
      />
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
          Product Card
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
          A beautiful product with an image header and action buttons.
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button variant="primary" size="sm">
            Buy Now
          </Button>
          <Button variant="outline" size="sm">
            Add to Cart
          </Button>
        </View>
      </View>
    </Card>
  ),
};

export const ProfileCard: Story = {
  render: () => (
    <Card variant="elevated">
      <View style={{ padding: 20, alignItems: 'center' }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#007AFF',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
            JD
          </Text>
        </View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>
          John Doe
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>
          Software Engineer
        </Text>
        <Button variant="primary" fullWidth>
          View Profile
        </Button>
      </View>
    </Card>
  ),
};

export const CardSizes: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Card size="sm">
        <View style={{ padding: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Small Card</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>Compact content</Text>
        </View>
      </Card>
      <Card size="md">
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Medium Card</Text>
          <Text style={{ fontSize: 14, color: '#666' }}>Standard content</Text>
        </View>
      </Card>
      <Card size="lg">
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Large Card</Text>
          <Text style={{ fontSize: 16, color: '#666' }}>Spacious content</Text>
        </View>
      </Card>
    </View>
  ),
};