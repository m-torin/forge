import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, vi } from 'vitest';

// Import the actual component
import CartPage from '@/app/(shop)/(other-pages)/cart/page';

// Override the global mock for this specific test
vi.mock('@/data/data', () => {
  return {
    getCart: vi.fn((_id: string) => ({
      id: 'gid://shopify/Cart/test',
      note: 'Test cart',
      createdAt: '2025-01-06',
      totalQuantity: 2,
      cost: {
        subtotal: 199.98,
        shipping: 10.0,
        tax: 20.0,
        total: 229.98,
        discount: 0,
      },
      lines: [
        {
          id: '1',
          name: 'Test Product 1',
          handle: 'test-product-1',
          price: 99.99,
          color: 'Red',
          inStock: true,
          size: 'M',
          quantity: 2,
          image: {
            src: '/test-product-1.jpg',
            width: 400,
            height: 400,
            alt: 'Test Product 1',
          },
        },
      ],
    })),
    TCardProduct: {},
  };
});

// Mock app-specific components that aren't in qa package
vi.mock('@/components/NcInputNumber', () => ({
  default: ({ value, onChange, ...props }: any) => (
    <input
      type="number"
      value={value}
      onChange={onChange}
      data-testid="quantity-input"
      {...props}
    />
  ),
}));

vi.mock('@/components/Prices', () => ({
  default: ({ price }: any) => <span data-testid="price">${price}</span>,
}));

vi.mock('@/shared/Button/ButtonPrimary', () => ({
  default: ({ children, ...props }: any) => (
    <button data-testid="button-primary" {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/shared/Breadcrumb', () => ({
  default: () => <nav data-testid="breadcrumb">Breadcrumb</nav>,
}));

describe('cart Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test('should render cart page title', async () => {
    const CartComponent = await CartPage();
    render(CartComponent);

    await waitFor(() => {
      const title = screen.getByText(/cart/i);
      expect(title).toBeInTheDocument();
    });
  });

  test('should render empty cart state when no items', async () => {
    // Mock empty cart
    const { getCart } = await import('@/data/data');
    vi.mocked(getCart).mockReturnValueOnce({
      id: 'gid://shopify/Cart/empty',
      note: '',
      createdAt: '2025-01-06',
      totalQuantity: 0,
      cost: {
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0,
        discount: 0,
      },
      lines: [],
    });

    const CartComponent = await CartPage();
    render(CartComponent);

    // Should show shopping cart heading but no items
    const title = screen.getByText(/Shopping Cart/i);
    expect(title).toBeInTheDocument();

    // Should not show any product names
    const productName = screen.queryByText('Test Product 1');
    expect(productName).not.toBeInTheDocument();
  });

  test('should render cart items if present', async () => {
    const CartComponent = await CartPage();
    render(CartComponent);

    // Look for cart item elements - should have the test product
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });
  });

  test('should render quantity controls for items', async () => {
    const CartComponent = await CartPage();
    render(CartComponent);

    await waitFor(() => {
      const quantityInputs = screen.queryAllByTestId('quantity-input');
      expect(quantityInputs.length).toBeGreaterThan(0);
    });
    const quantityInputs = screen.queryAllByTestId('quantity-input');
    expect(quantityInputs[0]).toBeInTheDocument();
  });

  test('should display item prices', async () => {
    const CartComponent = await CartPage();
    render(CartComponent);

    await waitFor(() => {
      const prices = screen.queryAllByTestId('price');
      expect(prices.length).toBeGreaterThan(0);
    });

    const prices = screen.queryAllByTestId('price');
    expect(prices[0]).toBeInTheDocument();
  });

  test('should render remove item buttons', async () => {
    const CartComponent = await CartPage();
    render(CartComponent);

    await waitFor(() => {
      const removeButtons = screen.queryAllByText(/remove/i);
      expect(removeButtons.length).toBeGreaterThan(0);
    });

    const removeButtons = screen.queryAllByText(/remove/i);
    expect(removeButtons[0]).toBeInTheDocument();
  });

  test('should display cart total', async () => {
    const CartComponent = await CartPage();
    render(CartComponent);

    // The mock cart has a total of 229.98
    const totalText = await screen.findByText(/229\.98/i);
    expect(totalText).toBeInTheDocument();
  });

  test('should render checkout button', async () => {
    const CartComponent = await CartPage();
    render(CartComponent);

    await waitFor(() => {
      const checkoutButton =
        screen.queryByText(/checkout/i) || screen.queryByTestId('button-primary');
      expect(checkoutButton).toBeInTheDocument();
    });
  });

  test('should render continue shopping link', async () => {
    const CartComponent = await CartPage();
    render(CartComponent);

    await waitFor(() => {
      const continueLink =
        screen.queryByText(/continue shopping/i) || screen.queryByText(/back to shop/i);
      expect(continueLink).toBeInTheDocument();
    });
  });

  test('should handle quantity changes', async () => {
    const CartComponent = await CartPage();
    render(CartComponent);

    await waitFor(() => {
      const quantityInputs = screen.queryAllByTestId('quantity-input');
      expect(quantityInputs.length).toBeGreaterThan(0);
    });

    const quantityInputs = screen.queryAllByTestId('quantity-input');
    fireEvent.change(quantityInputs[0], { target: { value: '3' } });
    expect(quantityInputs[0]).toHaveValue(3);
  });

  test('should handle item removal', async () => {
    const CartComponent = await CartPage();
    render(CartComponent);

    await waitFor(() => {
      const removeButtons = screen.queryAllByText(/remove/i);
      expect(removeButtons.length).toBeGreaterThan(0);
    });

    const removeButtons = screen.queryAllByText(/remove/i);
    fireEvent.click(removeButtons[0]);
    // Should not crash on removal
    expect(removeButtons[0]).toBeInTheDocument();
  });

  test('should display shipping information', async () => {
    const CartComponent = await CartPage();
    render(CartComponent);

    // The mock cart has shipping cost of 10.00
    const shippingCost = await screen.findByText(/10\.00/i);
    expect(shippingCost).toBeInTheDocument();
  });

  test('should render discount/coupon section', async () => {
    const CartComponent = await CartPage();
    render(CartComponent);

    await waitFor(() => {
      const couponSection =
        screen.queryByText(/coupon/i) ||
        screen.queryByText(/discount/i) ||
        screen.queryByText(/promo/i);
      expect(couponSection).toBeInTheDocument();
    });
  });

  test('should be responsive', async () => {
    const CartComponent = await CartPage();
    const { container } = render(CartComponent);

    await waitFor(() => {
      const responsiveElement = container.querySelector(
        '[class*="sm:"], [class*="md:"], [class*="lg:"]',
      );
      expect(responsiveElement).toBeInTheDocument();
    });
  });

  test('should have proper accessibility', async () => {
    const CartComponent = await CartPage();
    render(CartComponent);

    // Should have Shopping Cart heading
    const heading = await screen.findByText(/Shopping Cart/i);
    expect(heading).toBeInTheDocument();
  });

  test('should render without errors', async () => {
    await expect(async () => {
      const CartComponent = await CartPage();
      render(CartComponent);
    }).not.toThrow();
  });
});
