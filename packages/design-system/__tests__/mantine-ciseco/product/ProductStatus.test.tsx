import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import ProductStatus from '../../../mantine-ciseco/components/ProductStatus';

describe('ProductStatus', () => {
  it('renders available status', () => {
    render(<ProductStatus status="available" />);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('renders out of stock status', () => {
    render(<ProductStatus status="out-of-stock" />);
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('renders low stock status', () => {
    render(<ProductStatus status="low-stock" />);
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
  });

  it('renders pre-order status', () => {
    render(<ProductStatus status="pre-order" />);
    expect(screen.getByText('Pre-order')).toBeInTheDocument();
  });

  it('renders coming soon status', () => {
    render(<ProductStatus status="coming-soon" />);
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('renders discontinued status', () => {
    render(<ProductStatus status="discontinued" />);
    expect(screen.getByText('Discontinued')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<ProductStatus status="available" text="In Stock Now" />);
    expect(screen.getByText('In Stock Now')).toBeInTheDocument();
  });

  it('applies correct color for available status', () => {
    render(<ProductStatus status="available" />);
    const badge = screen.getByText('Available');
    expect(badge).toHaveClass('status-available', 'bg-green-100', 'text-green-800');
  });

  it('applies correct color for out of stock status', () => {
    render(<ProductStatus status="out-of-stock" />);
    const badge = screen.getByText('Out of Stock');
    expect(badge).toHaveClass('status-out-of-stock', 'bg-red-100', 'text-red-800');
  });

  it('applies correct color for low stock status', () => {
    render(<ProductStatus status="low-stock" />);
    const badge = screen.getByText('Low Stock');
    expect(badge).toHaveClass('status-low-stock', 'bg-orange-100', 'text-orange-800');
  });

  it('applies correct color for pre-order status', () => {
    render(<ProductStatus status="pre-order" />);
    const badge = screen.getByText('Pre-order');
    expect(badge).toHaveClass('status-pre-order', 'bg-blue-100', 'text-blue-800');
  });

  it('applies correct color for coming soon status', () => {
    render(<ProductStatus status="coming-soon" />);
    const badge = screen.getByText('Coming Soon');
    expect(badge).toHaveClass('status-coming-soon', 'bg-purple-100', 'text-purple-800');
  });

  it('applies correct color for discontinued status', () => {
    render(<ProductStatus status="discontinued" />);
    const badge = screen.getByText('Discontinued');
    expect(badge).toHaveClass('status-discontinued', 'bg-gray-100', 'text-gray-800');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<ProductStatus status="available" size="xs" />);
    expect(screen.getByText('Available')).toHaveClass('size-xs');

    rerender(<ProductStatus status="available" size="sm" />);
    expect(screen.getByText('Available')).toHaveClass('size-sm');

    rerender(<ProductStatus status="available" size="md" />);
    expect(screen.getByText('Available')).toHaveClass('size-md');

    rerender(<ProductStatus status="available" size="lg" />);
    expect(screen.getByText('Available')).toHaveClass('size-lg');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<ProductStatus status="available" variant="filled" />);
    expect(screen.getByText('Available')).toHaveClass('variant-filled');

    rerender(<ProductStatus status="available" variant="outline" />);
    expect(screen.getByText('Available')).toHaveClass('variant-outline');

    rerender(<ProductStatus status="available" variant="light" />);
    expect(screen.getByText('Available')).toHaveClass('variant-light');

    rerender(<ProductStatus status="available" variant="dot" />);
    expect(screen.getByText('Available')).toHaveClass('variant-dot');
  });

  it('renders with custom className', () => {
    render(<ProductStatus status="available" className="custom-status" />);
    expect(screen.getByText('Available')).toHaveClass('custom-status');
  });

  it('shows stock count when provided', () => {
    render(<ProductStatus status="low-stock" stockCount={5} />);
    expect(screen.getByText('5 left')).toBeInTheDocument();
  });

  it('shows stock count for available items', () => {
    render(<ProductStatus status="available" stockCount={100} showCount />);
    expect(screen.getByText('100 in stock')).toBeInTheDocument();
  });

  it('renders with icon when showIcon is true', () => {
    render(<ProductStatus status="available" showIcon />);
    expect(screen.getByTestId('status-icon')).toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    const CustomIcon = () => <span data-testid="custom-icon">✓</span>;
    render(<ProductStatus status="available" icon={<CustomIcon />} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders with dot indicator', () => {
    render(<ProductStatus status="available" variant="dot" />);
    expect(screen.getByTestId('status-dot')).toBeInTheDocument();
  });

  it('shows pulse animation for urgent status', () => {
    render(<ProductStatus status="low-stock" animate />);
    const badge = screen.getByText('Low Stock');
    expect(badge).toHaveClass('animate-pulse');
  });

  it('renders with tooltip information', async () => {
    render(<ProductStatus status="low-stock" tooltip="Only a few items left in stock" />);

    const badge = screen.getByText('Low Stock');
    fireEvent.mouseEnter(badge);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Only a few items left in stock');
    });
  });

  it('handles click events when clickable', () => {
    const mockOnClick = vi.fn();
    render(<ProductStatus status="available" clickable onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('renders with availability date', () => {
    render(<ProductStatus status="pre-order" availableDate="2024-12-25" showDate />);
    expect(screen.getByText(/Available Dec 25, 2024/)).toBeInTheDocument();
  });

  it('shows estimated restock date', () => {
    render(<ProductStatus status="out-of-stock" restockDate="2024-06-15" showRestockDate />);
    expect(screen.getByText(/Restock: Jun 15, 2024/)).toBeInTheDocument();
  });

  it('renders with progress bar for low stock', () => {
    render(<ProductStatus status="low-stock" stockCount={3} maxStock={10} showProgress />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '30');
  });

  it('supports different shapes', () => {
    const { rerender } = render(<ProductStatus status="available" shape="rounded" />);
    expect(screen.getByText('Available')).toHaveClass('rounded-full');

    rerender(<ProductStatus status="available" shape="square" />);
    expect(screen.getByText('Available')).toHaveClass('rounded-none');

    rerender(<ProductStatus status="available" shape="pill" />);
    expect(screen.getByText('Available')).toHaveClass('rounded-full', 'px-4');
  });

  it('renders with urgency indicator', () => {
    render(<ProductStatus status="low-stock" urgent />);
    const badge = screen.getByText('Low Stock');
    expect(badge).toHaveClass('urgent-status');
  });

  it('shows notification badge', () => {
    render(<ProductStatus status="available" notification />);
    expect(screen.getByTestId('notification-badge')).toBeInTheDocument();
  });

  it('supports dark mode styling', () => {
    render(<ProductStatus status="available" />);
    const badge = screen.getByText('Available');
    expect(badge).toHaveClass(
      'bg-green-100',
      'dark:bg-green-900',
      'text-green-800',
      'dark:text-green-200',
    );
  });

  it('handles responsive sizes', () => {
    render(
      <ProductStatus status="available" size={{ base: 'xs', sm: 'sm', md: 'md', lg: 'lg' }} />,
    );
    const badge = screen.getByText('Available');
    expect(badge).toHaveClass('size-xs', 'sm:size-sm', 'md:size-md', 'lg:size-lg');
  });

  it('renders with custom color scheme', () => {
    render(
      <ProductStatus
        status="available"
        colorScheme={{
          background: 'bg-custom-100',
          text: 'text-custom-800',
        }}
      />,
    );
    const badge = screen.getByText('Available');
    expect(badge).toHaveClass('bg-custom-100', 'text-custom-800');
  });
});
