import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import ProductStatus from '../../../mantine-ciseco/components/ProductStatus';

describe('ProductStatus', () => {
  it('renders new in status', () => {
    render(<ProductStatus status="New in" data-testid="product-status" />);
    expect(screen.getByTestId('product-status')).toBeInTheDocument();
    expect(screen.getByText('New in')).toBeInTheDocument();
  });

  it('renders discount status', () => {
    render(<ProductStatus status="50% Discount" data-testid="product-status" />);
    expect(screen.getByTestId('product-status')).toBeInTheDocument();
    expect(screen.getByText('50% Discount')).toBeInTheDocument();
  });

  it('renders sold out status', () => {
    render(<ProductStatus status="Sold Out" data-testid="product-status" />);
    expect(screen.getByTestId('product-status')).toBeInTheDocument();
    expect(screen.getByText('Sold Out')).toBeInTheDocument();
  });

  it('renders sold out status with out-of-stock', () => {
    render(<ProductStatus status="out-of-stock" />);
    expect(screen.getByText('Sold Out')).toBeInTheDocument();
  });

  it('renders limited edition status', () => {
    render(<ProductStatus status="limited edition" />);
    expect(screen.getByText('limited edition')).toBeInTheDocument();
  });

  it('renders default status when no status provided', () => {
    render(<ProductStatus />);
    expect(screen.getByText('New in')).toBeInTheDocument();
  });

  it('returns null for unsupported status', () => {
    const { container } = render(<ProductStatus status="unknown-status" />);
    // Should not render any status content, but Mantine may inject styles
    const statusElement =
      container.querySelector('[data-testid]') || container.querySelector('div:not(style)');
    expect(statusElement).toBeNull();
  });

  it('renders with custom className', () => {
    render(<ProductStatus status="New in" className="custom-class" data-testid="product-status" />);
    const element = screen.getByTestId('product-status');
    expect(element).toHaveClass('custom-class');
  });

  it('renders with testId', () => {
    render(<ProductStatus status="New in" data-testid="product-status" />);
    expect(screen.getByTestId('product-status')).toBeInTheDocument();
  });

  it('renders icons with status', () => {
    const { container } = render(<ProductStatus status="New in" />);
    const svgIcon = container.querySelector('svg');
    expect(svgIcon).toBeInTheDocument();
  });

  it('applies nc-shadow-lg class', () => {
    render(<ProductStatus status="New in" data-testid="product-status" />);
    const element = screen.getByTestId('product-status');
    expect(element).toHaveClass('nc-shadow-lg');
  });

  it('applies rounded-full class', () => {
    render(<ProductStatus status="New in" data-testid="product-status" />);
    const element = screen.getByTestId('product-status');
    expect(element).toHaveClass('rounded-full');
  });

  it('applies correct positioning classes', () => {
    render(<ProductStatus status="New in" data-testid="product-status" />);
    const element = screen.getByTestId('product-status');
    expect(element).toHaveClass('absolute', 'top-3', 'start-3');
  });

  it('contains proper text for different status values', () => {
    const statuses = [
      { status: 'New in', expectedText: 'New in' },
      { status: '50% Discount', expectedText: '50% Discount' },
      { status: 'Sold Out', expectedText: 'Sold Out' },
      { status: 'limited edition', expectedText: 'limited edition' },
    ];

    statuses.forEach(({ status, expectedText }) => {
      const { container } = render(<ProductStatus status={status} />);
      expect(screen.getByText(expectedText)).toBeInTheDocument();
      container.remove();
    });
  });

  it('applies default styling classes', () => {
    render(<ProductStatus status="New in" data-testid="product-status" />);
    const element = screen.getByTestId('product-status');
    expect(element).toHaveClass(
      'px-2.5',
      'py-1.5',
      'text-xs',
      'bg-white',
      'dark:bg-neutral-900',
      'text-neutral-700',
      'dark:text-neutral-300',
    );
  });

  it('renders different status types with their specific text content', () => {
    const statusTests = [
      { input: 'New in', expected: 'New in' },
      { input: '50% Discount', expected: '50% Discount' },
      { input: 'Sold Out', expected: 'Sold Out' },
      { input: 'out-of-stock', expected: 'Sold Out' },
      { input: 'limited edition', expected: 'limited edition' },
    ];

    statusTests.forEach(({ input, expected }) => {
      const { unmount } = render(<ProductStatus status={input} />);
      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });

  it('maintains consistent structure across all status types', () => {
    const statuses = ['New in', '50% Discount', 'Sold Out', 'limited edition'];

    statuses.forEach((status) => {
      const { container, unmount } = render(<ProductStatus status={status} />);
      const statusDiv = container.querySelector('div');

      // Check for consistent structure
      expect(statusDiv).toHaveClass(
        'nc-shadow-lg',
        'rounded-full',
        'flex',
        'items-center',
        'justify-center',
      );
      expect(statusDiv?.querySelector('svg')).toBeInTheDocument(); // Icon
      expect(statusDiv?.querySelector('span')).toBeInTheDocument(); // Text

      unmount();
    });
  });
});
