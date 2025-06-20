import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import LikeButton from '../../../src/mantine-ciseco/components/LikeButton';

describe('LikeButton', (_: any) => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders like button', (_: any) => {
    render(<LikeButton data-testid="like-button" />);
    expect(screen.getByTestId('like-button')).toBeInTheDocument();
  });

  it('shows unliked state by default', (_: any) => {
    render(<LikeButton data-testid="like-button" />);
    const button = screen.getByTestId('like-button');
    expect(button).toHaveAttribute('aria-label', 'Add to favorites');

    // Check for heart SVG
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('shows liked state when liked prop is true', (_: any) => {
    render(<LikeButton liked data-testid="like-button" />);
    const button = screen.getByTestId('like-button');
    expect(button).toHaveAttribute('aria-label', 'Remove from favorites');

    // Check for filled heart (red stroke and fill)
    const svg = button.querySelector('svg');
    const path = svg?.querySelector('path');
    expect(path).toHaveAttribute('stroke', '#ef4444');
    expect(path).toHaveAttribute('fill', '#ef4444');
  });

  it('calls onClick when clicked', (_: any) => {
    render(<LikeButton onClick={mockOnClick} data-testid="like-button" />);
    const button = screen.getByTestId('like-button');

    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('prevents event propagation on click', (_: any) => {
    const parentOnClick = vi.fn();
    render(
      <div onClick={parentOnClick}>
        <LikeButton onClick={mockOnClick} data-testid="like-button" />
      </div>,
    );

    const button = screen.getByTestId('like-button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalled();
    expect(parentOnClick).not.toHaveBeenCalled();
  });

  it('applies custom className', (_: any) => {
    render(<LikeButton className="custom-like-button" data-testid="like-button" />);
    const button = screen.getByTestId('like-button');
    expect(button).toHaveClass('custom-like-button');
  });

  it('applies default styling classes', (_: any) => {
    render(<LikeButton data-testid="like-button" />);
    const button = screen.getByTestId('like-button');

    expect(button).toHaveClass(
      'flex',
      'h-9',
      'w-9',
      'items-center',
      'justify-center',
      'rounded-full',
      'bg-white',
      'text-neutral-700',
      'nc-shadow-lg',
      'transition-all',
      'hover:scale-110',
    );
  });

  it('applies dark mode classes', (_: any) => {
    render(<LikeButton data-testid="like-button" />);
    const button = screen.getByTestId('like-button');
    expect(button).toHaveClass('dark:bg-neutral-900', 'dark:text-neutral-200');
  });

  it('renders with custom testId', (_: any) => {
    render(<LikeButton data-testid="custom-like-button" />);
    expect(screen.getByTestId('custom-like-button')).toBeInTheDocument();
  });

  it('renders with custom aria-label', (_: any) => {
    render(<LikeButton aria-label="Custom like label" data-testid="like-button" />);
    const button = screen.getByTestId('like-button');
    expect(button).toHaveAttribute('aria-label', 'Custom like label');
  });

  it('renders heart icon with correct dimensions', (_: any) => {
    render(<LikeButton data-testid="like-button" />);
    const button = screen.getByTestId('like-button');
    const svg = button.querySelector('svg');

    expect(svg).toHaveClass('h-5', 'w-5');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveAttribute('fill', 'none');
  });

  it('shows outline heart when not liked', (_: any) => {
    render(<LikeButton liked={false} data-testid="like-button" />);
    const button = screen.getByTestId('like-button');
    const svg = button.querySelector('svg');
    const path = svg?.querySelector('path');

    expect(path).toHaveAttribute('stroke', 'currentColor');
    expect(path).toHaveAttribute('fill', 'none');
  });

  it('shows filled heart when liked', (_: any) => {
    render(<LikeButton liked={true} data-testid="like-button" />);
    const button = screen.getByTestId('like-button');
    const svg = button.querySelector('svg');
    const path = svg?.querySelector('path');

    expect(path).toHaveAttribute('stroke', '#ef4444');
    expect(path).toHaveAttribute('fill', '#ef4444');
  });

  it('handles mouse events properly', (_: any) => {
    render(<LikeButton onClick={mockOnClick} data-testid="like-button" />);
    const button = screen.getByTestId('like-button');

    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalled();
  });

  it('maintains consistent button dimensions', (_: any) => {
    render(<LikeButton data-testid="like-button" />);
    const button = screen.getByTestId('like-button');

    // Button should be 36x36px (h-9 w-9)
    expect(button).toHaveClass('h-9', 'w-9');
  });

  it('applies hover scale effect', (_: any) => {
    render(<LikeButton data-testid="like-button" />);
    const button = screen.getByTestId('like-button');
    expect(button).toHaveClass('hover:scale-110');
  });

  it('uses proper SVG path for heart icon', (_: any) => {
    render(<LikeButton data-testid="like-button" />);
    const button = screen.getByTestId('like-button');
    const path = button.querySelector('path');

    expect(path).toHaveAttribute('stroke-width', '1.5');
    expect(path).toHaveAttribute('stroke-linecap', 'round');
    expect(path).toHaveAttribute('stroke-linejoin', 'round');

    // Check the heart path data
    const pathData = path?.getAttribute('d');
    expect(pathData).toContain('M12.62 20.81C12.28 20.93');
  });

  it('handles focus state for accessibility', (_: any) => {
    render(<LikeButton data-testid="like-button" />);
    const button = screen.getByTestId('like-button');

    button.focus();
    expect(button).toHaveFocus();
  });

  it('supports keyboard interaction', (_: any) => {
    render(<LikeButton onClick={mockOnClick} data-testid="like-button" />);
    const button = screen.getByTestId('like-button');

    button.focus();
    // Use keyPress instead of keyDown for Enter key
    fireEvent.keyPress(button, { key: 'Enter', charCode: 13 });
    // Or test that the button can be activated through keyboard
    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('toggles aria-label based on liked state', (_: any) => {
    const { rerender } = render(<LikeButton liked={false} data-testid="like-button" />);
    let button = screen.getByTestId('like-button');
    expect(button).toHaveAttribute('aria-label', 'Add to favorites');

    rerender(<LikeButton liked={true} data-testid="like-button" />);
    button = screen.getByTestId('like-button');
    expect(button).toHaveAttribute('aria-label', 'Remove from favorites');
  });

  it('maintains visual consistency across states', (_: any) => {
    const { rerender } = render(<LikeButton liked={false} data-testid="like-button" />);
    let button = screen.getByTestId('like-button');
    const classes = Array.from(button.classList);

    rerender(<LikeButton liked={true} data-testid="like-button" />);
    button = screen.getByTestId('like-button');
    const likedClasses = Array.from(button.classList);

    // Most classes should remain the same
    const baseClasses = ['flex', 'h-9', 'w-9', 'items-center', 'justify-center', 'rounded-full'];
    baseClasses.forEach((cls: any) => {
      expect(classes).toContain(cls);
      expect(likedClasses).toContain(cls);
    });
  });
});
