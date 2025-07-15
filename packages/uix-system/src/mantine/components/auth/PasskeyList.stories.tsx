import type { Meta, StoryObj } from '@storybook/nextjs';
import { PasskeyList, type Passkey } from './PasskeyList';

const meta: Meta<typeof PasskeyList> = {
  title: 'Auth/Security/PasskeyList',
  component: PasskeyList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    loading: { control: 'boolean' },
    error: { control: 'text' },
    showInfoAlert: { control: 'boolean' },
    showAddButton: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockPasskeys: Passkey[] = [
  {
    id: '1',
    name: 'MacBook Pro Touch ID',
    createdAt: '2024-01-15T10:30:00Z',
    lastUsedAt: '2024-01-28T14:22:00Z',
    deviceType: 'laptop',
  },
  {
    id: '2',
    name: 'iPhone Face ID',
    createdAt: '2024-01-10T09:15:00Z',
    lastUsedAt: '2024-01-27T16:45:00Z',
    deviceType: 'mobile',
  },
  {
    id: '3',
    name: 'YubiKey 5C',
    createdAt: '2023-12-20T11:00:00Z',
    lastUsedAt: '2024-01-25T08:30:00Z',
    deviceType: 'security-key',
  },
  {
    id: '4',
    name: 'Windows Hello',
    createdAt: '2024-01-08T13:45:00Z',
    deviceType: 'laptop',
  },
];

// Mock handlers
const mockAddPasskey = () => console.log('Add passkey clicked');
const mockDeletePasskey = (passkey: Passkey) => console.log('Delete passkey:', passkey);
const mockErrorDismiss = () => console.log('Error dismissed');

export const Default: Story = {
  args: {
    passkeys: mockPasskeys,
    onAddPasskey: mockAddPasskey,
    onDeletePasskey: mockDeletePasskey,
  },
};

export const EmptyState: Story = {
  args: {
    passkeys: [],
    onAddPasskey: mockAddPasskey,
    onDeletePasskey: mockDeletePasskey,
  },
};

export const Loading: Story = {
  args: {
    passkeys: [],
    loading: true,
    onAddPasskey: mockAddPasskey,
    onDeletePasskey: mockDeletePasskey,
  },
};

export const WithError: Story = {
  args: {
    passkeys: mockPasskeys,
    error: 'Failed to load passkeys. Please try again.',
    onAddPasskey: mockAddPasskey,
    onDeletePasskey: mockDeletePasskey,
    onErrorDismiss: mockErrorDismiss,
  },
};

export const SinglePasskey: Story = {
  args: {
    passkeys: [mockPasskeys[0]],
    onAddPasskey: mockAddPasskey,
    onDeletePasskey: mockDeletePasskey,
  },
};

export const CustomTexts: Story = {
  args: {
    passkeys: mockPasskeys,
    title: 'Security Keys',
    subtitle: 'Manage your hardware security keys and biometric authentication',
    addButtonText: 'Add Security Key',
    emptyStateTitle: 'No security keys found',
    emptyStateSubtitle: 'Add a security key for enhanced protection',
    infoText:
      'Security keys provide the highest level of account protection using FIDO2/WebAuthn standards.',
    onAddPasskey: mockAddPasskey,
    onDeletePasskey: mockDeletePasskey,
  },
};

export const ReadOnly: Story = {
  args: {
    passkeys: mockPasskeys,
    showAddButton: false,
    // No delete handler provided - makes it read-only
  },
};

export const NoInfoAlert: Story = {
  args: {
    passkeys: mockPasskeys,
    showInfoAlert: false,
    onAddPasskey: mockAddPasskey,
    onDeletePasskey: mockDeletePasskey,
  },
};

export const MobileDevicesOnly: Story = {
  args: {
    passkeys: [
      {
        id: '1',
        name: 'iPhone 15 Pro',
        createdAt: '2024-01-15T10:30:00Z',
        lastUsedAt: '2024-01-28T14:22:00Z',
        deviceType: 'mobile',
      },
      {
        id: '2',
        name: 'Samsung Galaxy S24',
        createdAt: '2024-01-10T09:15:00Z',
        deviceType: 'mobile',
      },
    ],
    onAddPasskey: mockAddPasskey,
    onDeletePasskey: mockDeletePasskey,
  },
};

export const SecurityKeysOnly: Story = {
  args: {
    passkeys: [
      {
        id: '1',
        name: 'YubiKey 5C NFC',
        createdAt: '2024-01-15T10:30:00Z',
        lastUsedAt: '2024-01-28T14:22:00Z',
        deviceType: 'security-key',
      },
      {
        id: '2',
        name: 'Titan Security Key',
        createdAt: '2024-01-10T09:15:00Z',
        lastUsedAt: '2024-01-25T16:45:00Z',
        deviceType: 'security-key',
      },
    ],
    onAddPasskey: mockAddPasskey,
    onDeletePasskey: mockDeletePasskey,
  },
};
