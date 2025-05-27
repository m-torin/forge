import { render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockVercelToolbar = vi.fn();
const mockKeys = vi.fn();

vi.mock('@vercel/toolbar/next', () => ({
  VercelToolbar: (props: any) => {
    mockVercelToolbar(props);
    return <div data-testid="vercel-toolbar">Vercel Toolbar</div>;
  },
}));

vi.mock('../keys', () => ({
  keys: () => mockKeys(),
}));

describe('Toolbar component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockKeys.mockReturnValue({ FLAGS_SECRET: 'secret_123' });
  });

  it('exports Toolbar component', async () => {
    const { Toolbar } = await import('../components/toolbar');
    expect(Toolbar).toBeDefined();
    expect(typeof Toolbar).toBe('function');
  });

  it('renders Vercel Toolbar when FLAGS_SECRET is set', async () => {
    const { Toolbar } = await import('../components/toolbar');
    const { getByTestId } = render(<Toolbar />);

    expect(getByTestId('vercel-toolbar')).toBeInTheDocument();
    expect(mockVercelToolbar).toHaveBeenCalled();
  });

  it('does not render when FLAGS_SECRET is not set', async () => {
    mockKeys.mockReturnValue({ FLAGS_SECRET: undefined });

    const { Toolbar } = await import('../components/toolbar');
    const { container } = render(<Toolbar />);

    expect(container).toBeEmptyDOMElement();
    expect(mockVercelToolbar).not.toHaveBeenCalled();
  });

  it('does not render when FLAGS_SECRET is empty string', async () => {
    mockKeys.mockReturnValue({ FLAGS_SECRET: '' });

    const { Toolbar } = await import('../components/toolbar');
    const { container } = render(<Toolbar />);

    expect(container).toBeEmptyDOMElement();
    expect(mockVercelToolbar).not.toHaveBeenCalled();
  });

  it('handles keys function throwing error', async () => {
    // Mock console.error to prevent test output pollution
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockKeys.mockImplementation(() => {
      throw new Error('Keys error');
    });

    const { Toolbar } = await import('../components/toolbar');

    // Component should throw when keys throws
    expect(() => render(<Toolbar />)).toThrow('Keys error');

    // Restore console.error
    consoleError.mockRestore();
  });

  it('re-renders correctly when FLAGS_SECRET changes', async () => {
    const { Toolbar } = await import('../components/toolbar');

    // First render with secret
    mockKeys.mockReturnValue({ FLAGS_SECRET: 'secret_1' });
    const { container, queryByTestId, rerender } = render(<Toolbar />);
    expect(queryByTestId('vercel-toolbar')).toBeInTheDocument();

    // Re-render without secret
    mockKeys.mockReturnValue({ FLAGS_SECRET: undefined });
    rerender(<Toolbar />);
    expect(queryByTestId('vercel-toolbar')).not.toBeInTheDocument();

    // Re-render with new secret
    mockKeys.mockReturnValue({ FLAGS_SECRET: 'secret_2' });
    rerender(<Toolbar />);
    expect(queryByTestId('vercel-toolbar')).toBeInTheDocument();
  });
});
