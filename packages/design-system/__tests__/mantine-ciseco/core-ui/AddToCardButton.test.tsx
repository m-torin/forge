import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import AddToCardButton from '../../../mantine-ciseco/components/AddToCardButton';

describe('AddToCardButton', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders with default text', () => {
    render(<AddToCardButton />);
    expect(screen.getByRole('button')).toHaveTextContent('Add to Cart');
  });

  it('renders with custom text', () => {
    render(<AddToCardButton text="Buy Now" />);
    expect(screen.getByRole('button')).toHaveTextContent('Buy Now');
  });

  it('handles click events', () => {
    render(<AddToCardButton onClick={mockOnClick} />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<AddToCardButton loading />);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('disables button when disabled prop is true', () => {
    render(<AddToCardButton disabled />);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('shows success animation after click', async () => {
    render(<AddToCardButton onClick={mockOnClick} />);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    // Check for success animation/icon
    await waitFor(() => {
      expect(screen.getByTestId('success-icon')).toBeInTheDocument();
    });

    // Animation should disappear after timeout
    await waitFor(
      () => {
        expect(screen.queryByTestId('success-icon')).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<AddToCardButton size="sm" />);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('size-sm');

    rerender(<AddToCardButton size="md" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('size-md');

    rerender(<AddToCardButton size="lg" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('size-lg');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<AddToCardButton variant="filled" />);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('variant-filled');

    rerender(<AddToCardButton variant="outline" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('variant-outline');

    rerender(<AddToCardButton variant="light" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('variant-light');
  });

  it('renders with custom className', () => {
    render(<AddToCardButton className="custom-button-class" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-button-class');
  });

  it('shows quantity selector when showQuantity is true', () => {
    render(<AddToCardButton showQuantity />);

    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    expect(screen.getByLabelText('Decrease quantity')).toBeInTheDocument();
    expect(screen.getByLabelText('Increase quantity')).toBeInTheDocument();
  });

  it('handles quantity changes', () => {
    const mockOnQuantityChange = vi.fn();
    render(
      <AddToCardButton showQuantity onQuantityChange={mockOnQuantityChange} initialQuantity={1} />,
    );

    const increaseButton = screen.getByLabelText('Increase quantity');
    const decreaseButton = screen.getByLabelText('Decrease quantity');
    const quantityInput = screen.getByRole('spinbutton');

    // Increase quantity
    fireEvent.click(increaseButton);
    expect(mockOnQuantityChange).toHaveBeenCalledWith(2);

    // Decrease quantity
    fireEvent.click(decreaseButton);
    fireEvent.click(decreaseButton);
    expect(mockOnQuantityChange).toHaveBeenCalledWith(0);

    // Direct input
    fireEvent.change(quantityInput, { target: { value: '5' } });
    expect(mockOnQuantityChange).toHaveBeenCalledWith(5);
  });

  it('prevents quantity from going below minimum', () => {
    const mockOnQuantityChange = vi.fn();
    render(
      <AddToCardButton
        showQuantity
        onQuantityChange={mockOnQuantityChange}
        initialQuantity={1}
        minQuantity={1}
      />,
    );

    const decreaseButton = screen.getByLabelText('Decrease quantity');

    fireEvent.click(decreaseButton);
    expect(mockOnQuantityChange).not.toHaveBeenCalled();
    expect(decreaseButton).toBeDisabled();
  });

  it('prevents quantity from exceeding maximum', () => {
    const mockOnQuantityChange = vi.fn();
    render(
      <AddToCardButton
        showQuantity
        onQuantityChange={mockOnQuantityChange}
        initialQuantity={5}
        maxQuantity={5}
      />,
    );

    const increaseButton = screen.getByLabelText('Increase quantity');

    fireEvent.click(increaseButton);
    expect(mockOnQuantityChange).not.toHaveBeenCalled();
    expect(increaseButton).toBeDisabled();
  });

  it('shows out of stock state', () => {
    render(<AddToCardButton outOfStock />);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Out of Stock');
  });

  it('renders with icon', () => {
    const TestIcon = () => <span data-testid="cart-icon">🛒</span>;
    render(<AddToCardButton icon={<TestIcon />} />);

    expect(screen.getByTestId('cart-icon')).toBeInTheDocument();
  });

  it('handles keyboard shortcuts', () => {
    render(<AddToCardButton onClick={mockOnClick} />);
    const button = screen.getByRole('button');

    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(button, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });

  it('shows tooltip on hover when provided', async () => {
    render(<AddToCardButton tooltip="Click to add this item to your cart" />);
    const button = screen.getByRole('button');

    fireEvent.mouseEnter(button);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Click to add this item to your cart');
    });

    fireEvent.mouseLeave(button);

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('integrates with notification system', async () => {
    const mockNotification = vi.fn();
    vi.mock('@repo/notifications/mantine-notifications', () => ({
      notify: {
        success: mockNotification,
      },
    }));

    render(<AddToCardButton showNotification />);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    await waitFor(() => {
      expect(mockNotification).toHaveBeenCalledWith(expect.stringContaining('added to cart'));
    });
  });
});
