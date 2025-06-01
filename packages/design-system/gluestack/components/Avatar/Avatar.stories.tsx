import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from '@repo/design-system/gluestack';
import { View, Text } from 'react-native';

const meta: Meta<typeof Avatar> = {
  title: 'gluestack/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the avatar',
    },
    source: {
      control: 'text',
      description: 'Image source URL',
    },
    name: {
      control: 'text',
      description: 'Name for initials fallback',
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
    source: { uri: 'https://github.com/shadcn.png' },
  },
};

export const WithInitials: Story = {
  args: {
    name: 'John Doe',
  },
};

export const Sizes: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Avatar size="xs" name="John Doe" />
        <Text style={{ fontSize: 10 }}>XS</Text>
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Avatar size="sm" name="John Doe" />
        <Text style={{ fontSize: 10 }}>SM</Text>
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Avatar size="md" name="John Doe" />
        <Text style={{ fontSize: 10 }}>MD</Text>
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Avatar size="lg" name="John Doe" />
        <Text style={{ fontSize: 10 }}>LG</Text>
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Avatar size="xl" name="John Doe" />
        <Text style={{ fontSize: 10 }}>XL</Text>
      </View>
    </View>
  ),
};

export const WithImages: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
      <Avatar 
        source={{ uri: 'https://github.com/shadcn.png' }} 
        size="lg"
      />
      <Avatar 
        source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' }} 
        size="lg"
      />
      <Avatar 
        source={{ uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150' }} 
        size="lg"
      />
    </View>
  ),
};

export const UserProfile: Story = {
  render: () => (
    <View style={{ alignItems: 'center', gap: 16 }}>
      <Avatar 
        source={{ uri: 'https://github.com/shadcn.png' }} 
        size="xl"
      />
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>John Doe</Text>
        <Text style={{ fontSize: 14, color: '#6B7280' }}>Software Engineer</Text>
      </View>
    </View>
  ),
};

export const AvatarGroup: Story = {
  render: () => (
    <View style={{ gap: 20 }}>
      <View>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
          Team Members
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <Avatar 
            source={{ uri: 'https://github.com/shadcn.png' }} 
            size="md"
            style={{ marginRight: -8, borderWidth: 2, borderColor: 'white' }}
          />
          <Avatar 
            source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' }} 
            size="md"
            style={{ marginRight: -8, borderWidth: 2, borderColor: 'white' }}
          />
          <Avatar 
            source={{ uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150' }} 
            size="md"
            style={{ marginRight: -8, borderWidth: 2, borderColor: 'white' }}
          />
          <View 
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#E5E7EB',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: 'white',
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>+3</Text>
          </View>
        </View>
      </View>
    </View>
  ),
};

export const StatusIndicator: Story = {
  render: () => (
    <View style={{ gap: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: '600' }}>Online Status</Text>
      <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <View style={{ position: 'relative' }}>
            <Avatar source={{ uri: 'https://github.com/shadcn.png' }} size="lg" />
            <View 
              style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: '#10B981',
                borderWidth: 2,
                borderColor: 'white',
              }}
            />
          </View>
          <Text style={{ fontSize: 12 }}>Online</Text>
        </View>
        
        <View style={{ alignItems: 'center', gap: 8 }}>
          <View style={{ position: 'relative' }}>
            <Avatar name="Jane Smith" size="lg" />
            <View 
              style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: '#F59E0B',
                borderWidth: 2,
                borderColor: 'white',
              }}
            />
          </View>
          <Text style={{ fontSize: 12 }}>Away</Text>
        </View>

        <View style={{ alignItems: 'center', gap: 8 }}>
          <View style={{ position: 'relative' }}>
            <Avatar name="Bob Wilson" size="lg" />
            <View 
              style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: '#EF4444',
                borderWidth: 2,
                borderColor: 'white',
              }}
            />
          </View>
          <Text style={{ fontSize: 12 }}>Busy</Text>
        </View>
      </View>
    </View>
  ),
};