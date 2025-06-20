import { MantineProvider } from '@mantine/core';
/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';

import { UserSelect } from '../UserSelect';

// Mock the getUsersForSelect action
jest.mock('../../actions', () => ({
  getUsersForSelect: jest.fn().mockResolvedValue({
    data: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        image: null,
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        image: null,
      },
    ],
    success: true,
  }),
}));

// Mock the pim-helpers
jest.mock('../../utils/pim-helpers', () => ({
  showErrorNotification: jest.fn(),
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

describe('userSelect', () => {
  test('renders with placeholder text', () => {
    renderWithProvider(<UserSelect onChange={() => {}} placeholder="Search users..." value={[]} />);

    expect(screen.getByText('Search users...')).toBeInTheDocument();
  });

  test('renders with label when provided', () => {
    renderWithProvider(
      <UserSelect
        onChange={() => {}}
        placeholder="Search users..."
        label="Select Users"
        value={[]}
      />,
    );

    expect(screen.getByText('Select Users')).toBeInTheDocument();
  });

  test('renders as disabled when disabled prop is true', () => {
    renderWithProvider(
      <UserSelect onChange={() => {}} placeholder="Search users..." disabled={true} value={[]} />,
    );

    const input = screen.getByRole('button');
    expect(input).toBeDisabled();
  });

  test('has correct test id', () => {
    renderWithProvider(
      <UserSelect
        data-testid="custom-user-select"
        onChange={() => {}}
        placeholder="Search users..."
        value={[]}
      />,
    );

    expect(screen.getByTestId('custom-user-select')).toBeInTheDocument();
  });
});
