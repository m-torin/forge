import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import LikeButton from '../../../mantine-ciseco/components/LikeButton';

describe('LikeButton', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders like button', () => {
    render(<LikeButton />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows unliked state by default', () => {
    render(<LikeButton />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button.querySelector('.heart-outline')).toBeInTheDocument();
  });

  it('shows liked state when liked prop is true', () => {
    render(<LikeButton liked />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button.querySelector('.heart-filled')).toBeInTheDocument();
  });

  it('toggles like state on click', () => {
    render(<LikeButton onClick={mockOnClick} />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledWith(true);
  });

  it('toggles from liked to unliked', () => {
    render(<LikeButton liked onClick={mockOnClick} />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledWith(false);
  });

  it('shows animation on click', async () => {
    render(<LikeButton />);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    const heart = button.querySelector('.heart-icon');
    expect(heart).toHaveClass('animate-like');

    await waitFor(
      () => {
        expect(heart).not.toHaveClass('animate-like');
      },
      { timeout: 1000 },
    );
  });

  it('renders with custom size', () => {
    const { rerender } = render(<LikeButton size="sm" />);
    expect(screen.getByRole('button')).toHaveClass('size-sm');

    rerender(<LikeButton size="md" />);
    expect(screen.getByRole('button')).toHaveClass('size-md');

    rerender(<LikeButton size="lg" />);
    expect(screen.getByRole('button')).toHaveClass('size-lg');
  });

  it('renders with custom color', () => {
    render(<LikeButton color="red" />);
    const button = screen.getByRole('button');
    expect(button.querySelector('.heart-icon')).toHaveStyle({ color: 'red' });
  });

  it('renders with custom className', () => {
    render(<LikeButton className="custom-like-button" />);
    expect(screen.getByRole('button')).toHaveClass('custom-like-button');
  });

  it('shows count when provided', () => {
    render(<LikeButton count={42} showCount />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('updates count when liked', () => {
    const { rerender } = render(<LikeButton count={10} showCount />);
    expect(screen.getByText('10')).toBeInTheDocument();

    rerender(<LikeButton count={10} showCount liked />);
    expect(screen.getByText('11')).toBeInTheDocument();
  });

  it('formats large counts', () => {
    render(<LikeButton count={1234} showCount />);
    expect(screen.getByText('1.2k')).toBeInTheDocument();
  });

  it('renders disabled state', () => {
    render(<LikeButton disabled onClick={mockOnClick} />);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(<LikeButton loading />);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('shows tooltip on hover', async () => {
    render(<LikeButton tooltip="Add to favorites" />);
    const button = screen.getByRole('button');

    fireEvent.mouseEnter(button);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Add to favorites');
    });
  });

  it('shows different tooltip when liked', async () => {
    render(<LikeButton liked tooltip="Add to favorites" likedTooltip="Remove from favorites" />);
    const button = screen.getByRole('button');

    fireEvent.mouseEnter(button);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Remove from favorites');
    });
  });

  it('has proper ARIA attributes', () => {
    render(<LikeButton ariaLabel="Like this item" />);
    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('aria-label', 'Like this item');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<LikeButton variant="filled" />);
    expect(screen.getByRole('button')).toHaveClass('variant-filled');

    rerender(<LikeButton variant="outline" />);
    expect(screen.getByRole('button')).toHaveClass('variant-outline');

    rerender(<LikeButton variant="ghost" />);
    expect(screen.getByRole('button')).toHaveClass('variant-ghost');
  });

  it('handles keyboard shortcuts', () => {
    render(<LikeButton onClick={mockOnClick} />);
    const button = screen.getByRole('button');

    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledWith(true);

    fireEvent.keyDown(button, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalledWith(true);
  });

  it('shows ripple effect on click', () => {
    render(<LikeButton showRipple />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(button.querySelector('.ripple-effect')).toBeInTheDocument();
  });

  it('supports custom icons', () => {
    const CustomIcon = () => <span data-testid="custom-icon">⭐</span>;
    const CustomLikedIcon = () => <span data-testid="custom-liked-icon">🌟</span>;

    render(<LikeButton icon={<CustomIcon />} likedIcon={<CustomLikedIcon />} />);

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('shows custom liked icon when liked', () => {
    const CustomIcon = () => <span data-testid="custom-icon">⭐</span>;
    const CustomLikedIcon = () => <span data-testid="custom-liked-icon">🌟</span>;

    render(<LikeButton liked icon={<CustomIcon />} likedIcon={<CustomLikedIcon />} />);

    expect(screen.getByTestId('custom-liked-icon')).toBeInTheDocument();
  });

  it('integrates with analytics', () => {
    const mockTrack = vi.fn();
    vi.mock('@repo/analytics', () => ({
      track: mockTrack,
    }));

    render(<LikeButton trackAnalytics productId="123" />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(mockTrack).toHaveBeenCalledWith('Product Liked', {
      productId: '123',
    });
  });

  it('shows confirmation animation when liked', async () => {
    render(<LikeButton showConfirmation />);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('confirmation-particles')).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(screen.queryByTestId('confirmation-particles')).not.toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it('prevents rapid clicking', async () => {
    render(<LikeButton onClick={mockOnClick} debounce />);
    const button = screen.getByRole('button');

    // Click multiple times rapidly
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);

    // Wait for debounce
    await waitFor(
      () => {
        fireEvent.click(button);
        expect(mockOnClick).toHaveBeenCalledTimes(2);
      },
      { timeout: 500 },
    );
  });

  it('supports double-click to like', () => {
    render(<LikeButton doubleClickToLike onClick={mockOnClick} />);
    const button = screen.getByRole('button');

    fireEvent.doubleClick(button);
    expect(mockOnClick).toHaveBeenCalledWith(true);
  });
});
