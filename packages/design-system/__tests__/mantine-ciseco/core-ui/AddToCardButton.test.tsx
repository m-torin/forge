import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import AddToCardButton from '../../../mantine-ciseco/components/AddToCardButton';
import { notify } from '@repo/notifications/mantine-notifications';

// Mock next/image
vi.mock('next/image', (_: any) => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Notifications are already mocked in vitest.setup.ts

describe('AddToCardButton', (_: any) => {
  const defaultProps = {
    title: 'Test Product',
    imageUrl: '/test-product.jpg',
    price: 99.99,
    quantity: 1,
    color: 'Red',
    size: 'M',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders as a button by default', (_: any) => {
    render(<AddToCardButton {...defaultProps}>Add to Cart</AddToCardButton>);

    const button = screen.getByTestId('add-to-cart-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Add to Cart');
  });

  it('renders with custom component when as prop is provided', (_: any) => {
    render(
      <AddToCardButton {...defaultProps} as="div">
        Add to Cart
      </AddToCardButton>,
    );

    const element = screen.getByText('Add to Cart');
    expect(element.tagName).toBe('DIV');
  });

  it('applies custom className', (_: any) => {
    render(
      <AddToCardButton {...defaultProps} className="custom-class">
        Add to Cart
      </AddToCardButton>,
    );

    const button = screen.getByTestId('add-to-cart-button');
    expect(button).toHaveClass('custom-class');
  });

  it('shows notification when clicked', (_: any) => {
    render(<AddToCardButton {...defaultProps}>Add to Cart</AddToCardButton>);

    const button = screen.getByTestId('add-to-cart-button');
    fireEvent.click(button);

    expect(notify.custom).toHaveBeenCalledWith({
      id: 'nc-product-notify',
      autoClose: 4000,
      message: expect.any(Object),
      position: 'top-right',
      styles: {
        root: {
          backgroundColor: 'transparent',
          border: 'none',
          boxShadow: 'none',
          padding: 0,
        },
      },
      withCloseButton: false,
    });
  });

  it('passes through additional props', (_: any) => {
    render(
      <AddToCardButton {...defaultProps} data-testid="add-to-cart" disabled>
        Add to Cart
      </AddToCardButton>,
    );

    const button = screen.getByTestId('add-to-cart');
    expect(button).toBeDisabled();
  });

  it('handles click event', (_: any) => {
    render(<AddToCardButton {...defaultProps}>Add to Cart</AddToCardButton>);

    const button = screen.getByTestId('add-to-cart-button');
    fireEvent.click(button);

    // The internal notification should be called
    expect(notify.custom).toHaveBeenCalled();
  });

  describe('NotifyAddToCart component', (_: any) => {
    it('displays product information in notification', (_: any) => {
      render(<AddToCardButton {...defaultProps}>Add to Cart</AddToCardButton>);

      const button = screen.getByTestId('add-to-cart-button');
      fireEvent.click(button);

      // The notification should have been called with a React element containing product info
      const callArgs = (notify.custom as any).mock.calls[0][0];
      expect(callArgs.message).toBeDefined();

      // We can't easily test the React element content without rendering it,
      // but we can verify the notification was called with the right structure
      expect(callArgs.id).toBe('nc-product-notify');
      expect(callArgs.autoClose).toBe(4000);
    });
  });

  it('works without optional props', (_: any) => {
    const minimalProps = {
      title: 'Test Product',
      imageUrl: '/test-product.jpg',
      price: 99.99,
      quantity: 1,
    };

    render(<AddToCardButton {...minimalProps}>Add to Cart</AddToCardButton>);

    const button = screen.getByTestId('add-to-cart-button');
    fireEvent.click(button);

    expect(notify.custom).toHaveBeenCalled();
  });
});
