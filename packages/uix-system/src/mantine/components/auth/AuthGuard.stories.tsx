import { Button, Card, Group, Text, Title } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { AuthGuard, type AuthSession, type AuthUser } from './AuthGuard';

// Mock content component
const ProtectedContent = () => (
  <Card withBorder p="xl" maw={400}>
    <Title order={3} mb="md">
      Protected Content
    </Title>
    <Text size="sm" c="dimmed" mb="lg">
      This content is only visible to authenticated users with the proper permissions.
    </Text>
    <Group justify="center">
      <Button variant="light">Secure Action</Button>
    </Group>
  </Card>
);

const meta: Meta<typeof AuthGuard> = {
  title: 'Auth/Guards/AuthGuard',
  component: AuthGuard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isLoading: { control: 'boolean' },
    allowedRoles: { control: 'object' },
    requireOrganization: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data
const mockUser: AuthUser = {
  id: 'user-1',
  email: 'john@example.com',
  name: 'John Doe',
  role: 'user',
  organizationId: 'org-1',
  emailVerified: true,
  createdAt: new Date('2023-06-15').toISOString(),
  updatedAt: new Date('2024-01-28').toISOString(),
};

const mockAdminUser: AuthUser = {
  ...mockUser,
  id: 'admin-1',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin',
};

const mockUserNoOrg: AuthUser = {
  ...mockUser,
  organizationId: null,
};

const mockSession: AuthSession = {
  user: mockUser,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
};

// Mock handlers
const mockUnauthorized = () => console.log('Unauthorized access attempt');

export const AuthenticatedUser: Story = {
  args: {
    user: mockUser,
    session: mockSession,
    isLoading: false,
    onUnauthorized: mockUnauthorized,
    children: <ProtectedContent />,
  },
};

export const UnauthenticatedUser: Story = {
  args: {
    user: null,
    session: null,
    isLoading: false,
    onUnauthorized: mockUnauthorized,
    children: <ProtectedContent />,
  },
};

export const LoadingState: Story = {
  args: {
    user: null,
    session: null,
    isLoading: true,
    onUnauthorized: mockUnauthorized,
    children: <ProtectedContent />,
  },
};

export const AdminOnlyAccess: Story = {
  args: {
    user: mockUser, // Regular user trying to access admin content
    session: mockSession,
    isLoading: false,
    allowedRoles: ['admin', 'super-admin'],
    onUnauthorized: mockUnauthorized,
    children: <ProtectedContent />,
  },
};

export const AdminAccessGranted: Story = {
  args: {
    user: mockAdminUser, // Admin user accessing admin content
    session: { ...mockSession, user: mockAdminUser },
    isLoading: false,
    allowedRoles: ['admin', 'super-admin'],
    onUnauthorized: mockUnauthorized,
    children: <ProtectedContent />,
  },
};

export const RequireOrganization: Story = {
  args: {
    user: mockUserNoOrg, // User without organization
    session: { ...mockSession, user: mockUserNoOrg },
    isLoading: false,
    requireOrganization: true,
    onUnauthorized: mockUnauthorized,
    children: <ProtectedContent />,
  },
};

export const OrganizationAccessGranted: Story = {
  args: {
    user: mockUser, // User with organization
    session: mockSession,
    isLoading: false,
    requireOrganization: true,
    onUnauthorized: mockUnauthorized,
    children: <ProtectedContent />,
  },
};

export const MultipleRoles: Story = {
  args: {
    user: mockUser,
    session: mockSession,
    isLoading: false,
    allowedRoles: ['user', 'moderator', 'admin'],
    onUnauthorized: mockUnauthorized,
    children: <ProtectedContent />,
  },
};

export const StrictPermissions: Story = {
  args: {
    user: mockUser,
    session: mockSession,
    isLoading: false,
    allowedRoles: ['admin'],
    requireOrganization: true,
    onUnauthorized: mockUnauthorized,
    children: <ProtectedContent />,
  },
};

export const NoSessionData: Story = {
  args: {
    user: mockUser,
    session: null, // No session but user exists
    isLoading: false,
    onUnauthorized: mockUnauthorized,
    children: <ProtectedContent />,
  },
};

export const ExpiredSession: Story = {
  args: {
    user: mockUser,
    session: {
      ...mockSession,
      expires: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    },
    isLoading: false,
    onUnauthorized: mockUnauthorized,
    children: <ProtectedContent />,
  },
};
