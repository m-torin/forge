import ProductStatus from '@/components/ProductStatus';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

// Mock the IconDiscount component
vi.mock('@/components/IconDiscount', () => ({
  default: ({ className }: { className: string }) => (
    <div data-testid="icon-discount" className={className}>
      Discount Icon
    </div>
  ),
}));

describe('productStatus Component', () => {
  test('renders "New in" status with sparkles icon', () => {
    render(<ProductStatus status="New in" />);

    const statusElement = screen.getByText('New in');
    expect(statusElement).toBeInTheDocument();

    const container = statusElement.closest('div');
    expect(container).toHaveClass(
      'nc-shadow-lg',
      'rounded-full',
      'flex',
      'items-center',
      'justify-center',
    );

    // Check for sparkles icon
    const sparklesIcon = container?.querySelector('svg');
    expect(sparklesIcon).toBeInTheDocument();
  });

  test('renders "50% Discount" status with discount icon', () => {
    render(<ProductStatus status="50% Discount" />);

    const statusElement = screen.getByText('50% Discount');
    expect(statusElement).toBeInTheDocument();

    const discountIcon = screen.getByTestId('icon-discount');
    expect(discountIcon).toBeInTheDocument();
    expect(discountIcon).toHaveClass('h-3.5', 'w-3.5');
  });

  test('renders "Sold Out" status with no symbol icon', () => {
    render(<ProductStatus status="Sold Out" />);

    const statusElement = screen.getByText('Sold Out');
    expect(statusElement).toBeInTheDocument();

    const container = statusElement.closest('div');
    const noSymbolIcon = container?.querySelector('svg');
    expect(noSymbolIcon).toBeInTheDocument();
  });

  test('renders "limited edition" status with clock icon', () => {
    render(<ProductStatus status="limited edition" />);

    const statusElement = screen.getByText('limited edition');
    expect(statusElement).toBeInTheDocument();

    const container = statusElement.closest('div');
    const clockIcon = container?.querySelector('svg');
    expect(clockIcon).toBeInTheDocument();
  });

  test('renders with default status when no status provided', () => {
    render(<ProductStatus />);

    const statusElement = screen.getByText('New in');
    expect(statusElement).toBeInTheDocument();
  });

  test('renders null when status is empty string', () => {
    const { container } = render(<ProductStatus status="" />);

    expect(container).toBeEmptyDOMElement();
  });

  test('renders default status when status is undefined', () => {
    render(<ProductStatus status={undefined} />);

    // Should render default "New in" status when undefined
    expect(screen.getByText('New in')).toBeInTheDocument();
  });

  test('renders null for unknown status', () => {
    const { container } = render(<ProductStatus status="Unknown Status" />);

    expect(container).toBeEmptyDOMElement();
  });

  test('applies custom className', () => {
    const customClass = 'custom-status-class';
    render(<ProductStatus status="New in" className={customClass} />);

    const statusElement = screen.getByText('New in');
    const container = statusElement.closest('div');
    expect(container).toHaveClass(customClass);
  });

  test('applies default className when not provided', () => {
    render(<ProductStatus status="New in" />);

    const statusElement = screen.getByText('New in');
    const container = statusElement.closest('div');
    expect(container).toHaveClass(
      'absolute',
      'top-3',
      'start-3',
      'px-2.5',
      'py-1.5',
      'text-xs',
      'bg-white',
      'dark:bg-neutral-900',
      'text-neutral-700',
      'dark:text-neutral-300',
    );
  });

  test('applies common styling classes to all status types', () => {
    const statuses = ['New in', '50% Discount', 'Sold Out', 'limited edition'];

    statuses.forEach(status => {
      const { unmount } = render(<ProductStatus status={status} />);

      const statusElement = screen.getByText(status);
      const container = statusElement.closest('div');

      expect(container).toHaveClass(
        'nc-shadow-lg',
        'rounded-full',
        'flex',
        'items-center',
        'justify-center',
      );

      unmount();
    });
  });

  test('renders status text with correct styling', () => {
    render(<ProductStatus status="New in" />);

    const statusElement = screen.getByText('New in');
    expect(statusElement).toHaveClass('ms-1', 'leading-none');
  });

  test('renders icons with correct size classes', () => {
    render(<ProductStatus status="New in" />);

    const statusElement = screen.getByText('New in');
    const container = statusElement.closest('div');
    const icon = container?.querySelector('svg');

    expect(icon).toHaveClass('h-3.5', 'w-3.5');
  });

  test('applies dark mode classes', () => {
    render(<ProductStatus status="New in" />);

    const statusElement = screen.getByText('New in');
    const container = statusElement.closest('div');
    expect(container).toHaveClass('dark:bg-neutral-900', 'dark:text-neutral-300');
  });

  test('handles case-sensitive status matching', () => {
    // Test that "limited edition" (lowercase) works but "Limited Edition" (title case) doesn't
    const { container: container1 } = render(<ProductStatus status="Limited Edition" />);
    expect(container1).toBeEmptyDOMElement();

    const { container: container2 } = render(<ProductStatus status="limited edition" />);
    expect(container2).not.toBeEmptyDOMElement();
  });
});
