import { render, screen } from '@repo/testing/vitest';
import { describe, expect, it, vi } from 'vitest';
import { Toolbar } from '../../components/toolbar';

// Import the mocked modules
vi.mock('@vercel/toolbar/next');
vi.mock('../../keys', () => ({
  keys: vi.fn(),
}));

describe('Toolbar', () => {
  it('renders the VercelToolbar when FLAGS_SECRET is set', () => {
    // Mock keys to return FLAGS_SECRET
    const { keys } = require('../../keys');
    keys.mockReturnValue({
      FLAGS_SECRET: 'test-flags-secret',
    });

    render(<Toolbar />);

    expect(screen.getByTestId('vercel-toolbar')).toBeInTheDocument();
  });

  it('does not render the VercelToolbar when FLAGS_SECRET is not set', () => {
    // Mock keys to return no FLAGS_SECRET
    const { keys } = require('../../keys');
    keys.mockReturnValue({
      FLAGS_SECRET: undefined,
    });

    render(<Toolbar />);

    expect(screen.queryByTestId('vercel-toolbar')).not.toBeInTheDocument();
  });

  it('does not render the VercelToolbar when FLAGS_SECRET is empty', () => {
    // Mock keys to return empty FLAGS_SECRET
    const { keys } = require('../../keys');
    keys.mockReturnValue({
      FLAGS_SECRET: '',
    });

    render(<Toolbar />);

    expect(screen.queryByTestId('vercel-toolbar')).not.toBeInTheDocument();
  });

  it('calls the keys function to get the FLAGS_SECRET', () => {
    // Mock keys
    const { keys } = require('../../keys');
    keys.mockReturnValue({
      FLAGS_SECRET: 'test-flags-secret',
    });

    render(<Toolbar />);

    expect(keys).toHaveBeenCalled();
  });
});
