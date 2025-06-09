import { MantineProvider } from '@mantine/core';
/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';

import { RegistryUserAssignments } from '../RegistryUserAssignments';

// Mock the actions
jest.mock('../../actions', () => ({
  removeRegistryUser: jest.fn().mockResolvedValue({ success: true }),
  updateRegistryUserRole: jest.fn().mockResolvedValue({ success: true }),
}));

// Mock the UserSelect component
jest.mock('../UserSelect', () => ({
  UserSelect: ({ onChange, value, ...props }: any) => (
    <div data-testid="mock-user-select" {...props}>
      Mock UserSelect
    </div>
  ),
}));

// Mock the pim-helpers
jest.mock('../../utils/pim-helpers', () => ({
  showErrorNotification: jest.fn(),
  showSuccessNotification: jest.fn(),
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

const mockUsers = [
  {
    id: 'user-1',
    role: 'OWNER' as const,
    user: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      image: null,
    },
  },
  {
    id: 'user-2',
    role: 'EDITOR' as const,
    user: {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      image: null,
    },
  },
];

describe('RegistryUserAssignments', () => {
  it('renders with title and description', () => {
    renderWithProvider(
      <RegistryUserAssignments editable={false} registryId="registry-1" users={mockUsers} />,
    );

    expect(screen.getByText('User Access')).toBeInTheDocument();
    expect(
      screen.getByText('Manage who can access this registry and their permissions'),
    ).toBeInTheDocument();
  });

  it('displays users in table format', () => {
    renderWithProvider(
      <RegistryUserAssignments editable={false} registryId="registry-1" users={mockUsers} />,
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('shows add users button when editable', () => {
    renderWithProvider(
      <RegistryUserAssignments editable={true} registryId="registry-1" users={mockUsers} />,
    );

    expect(screen.getByText('Add Users')).toBeInTheDocument();
  });

  it('does not show add users button when not editable', () => {
    renderWithProvider(
      <RegistryUserAssignments editable={false} registryId="registry-1" users={mockUsers} />,
    );

    expect(screen.queryByText('Add Users')).not.toBeInTheDocument();
  });

  it('shows empty state when no users', () => {
    renderWithProvider(
      <RegistryUserAssignments editable={false} registryId="registry-1" users={[]} />,
    );

    expect(screen.getByText('No users assigned to this registry')).toBeInTheDocument();
  });

  it('has correct test id', () => {
    renderWithProvider(
      <RegistryUserAssignments
        data-testid="custom-user-assignments"
        editable={false}
        registryId="registry-1"
        users={mockUsers}
      />,
    );

    expect(screen.getByTestId('custom-user-assignments')).toBeInTheDocument();
  });
});
