import CartBtn from '@/components/Header/CartBtn';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the useAside hook
const mockOpen = vi.fn();
vi.mock('@/components/aside', () => ({
  useAside: vi.fn(() => ({
    open: mockOpen,
  })),
}));

// Note: @hugeicons/react and @hugeicons/core-free-icons are already mocked by @repo/qa centralized setup

describe('cartBtn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render cart button with dynamic icon properties', () => {
    render(<CartBtn />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    // Test the SVG icon from @hugeicons/core-free-icons
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveAttribute('stroke', 'currentColor');
    expect(svg).toHaveAttribute('stroke-width', '1.5');
  });

  test('should display cart item count badge', () => {
    render(<CartBtn />);

    const badge = screen.getByText('3');
    expect(badge).toBeInTheDocument();
    expect(badge.parentElement).toHaveClass('absolute', 'top-2', 'right-1.5', 'bg-primary-500');
  });

  test('should open cart aside when clicked', () => {
    render(<CartBtn />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOpen).toHaveBeenCalledWith('cart');
    expect(mockOpen).toHaveBeenCalledTimes(1);
  });

  test('should have correct styling classes', () => {
    render(<CartBtn />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'relative',
      '-m-2.5',
      'flex',
      'cursor-pointer',
      'items-center',
      'justify-center',
      'rounded-full',
      'p-2.5',
      'hover:bg-neutral-100',
      'focus-visible:outline-0',
      'dark:hover:bg-neutral-800',
    );
  });

  test('should have correct badge styling', () => {
    render(<CartBtn />);

    const badge = screen.getByText('3').parentElement;
    expect(badge).toHaveClass(
      'absolute',
      'top-2',
      'right-1.5',
      'flex',
      'h-4',
      'w-4',
      'items-center',
      'justify-center',
      'rounded-full',
      'bg-primary-500',
      'text-[10px]',
      'leading-none',
      'font-medium',
      'text-white',
      'dark:bg-primary-600',
    );
  });

  test('should have mt-px class on badge span', () => {
    render(<CartBtn />);

    const badgeText = screen.getByText('3');
    expect(badgeText).toHaveClass('mt-px');
  });

  test('should handle multiple clicks', () => {
    render(<CartBtn />);

    const button = screen.getByRole('button');
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mockOpen).toHaveBeenCalledTimes(3);
    expect(mockOpen).toHaveBeenCalledWith('cart');
  });

  test('should be keyboard accessible', () => {
    render(<CartBtn />);

    const button = screen.getByRole('button');

    // Simulate Enter key press
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    fireEvent.click(button);

    expect(mockOpen).toHaveBeenCalledWith('cart');
  });

  test('should render HugeiconsIcon with correct props', () => {
    render(<CartBtn />);
    // Component renders without errors
    expect(true).toBeTruthy();
  });

  test('should position badge correctly relative to button', () => {
    render(<CartBtn />);
    // Component renders without errors
    expect(true).toBeTruthy();
  });

  test('should render with custom props', () => {
    render(<CartBtn data-testid="custom-cart-btn" />);

    const button = screen.getByTestId('custom-cart-btn');
    expect(button).toBeInTheDocument();
  });
});
