import CheckoutPage from '@/app/(shop)/(other-pages)/checkout/page';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, vi } from 'vitest';

// Mock getCart function
vi.mock('@/data/data', () => ({
  getCart: vi.fn((_id: string) => ({
    id: 'gid://shopify/Cart/checkout',
    note: 'Checkout cart',
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
        name: 'Product 1',
        handle: 'product-1',
        price: 99.99,
        color: 'Red',
        size: 'M',
        quantity: 2,
        image: {
          src: '/product-1.jpg',
          width: 400,
          height: 400,
          alt: 'Product 1',
        },
      },
    ],
  })),
  TCardProduct: {},
}));

// Mock components
vi.mock('@/app/(shop)/(other-pages)/checkout/Information', () => ({
  default: () => <div data-testid="checkout-information">Checkout Information Form</div>,
}));

vi.mock('@/shared/Button/ButtonPrimary', () => ({
  default: ({ children, className, ...props }: any) => (
    <button className={className} data-testid="button-primary" {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/Prices', () => ({
  default: ({ price, className }: any) => (
    <span className={className} data-testid="price">
      ${price}
    </span>
  ),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, className, fill, priority, ...props }: any) => (
    <img
      src={src}
      alt={alt}
      className={className}
      data-testid="product-image"
      data-fill={fill ? 'true' : 'false'}
      data-priority={priority ? 'true' : 'false'}
      {...props}
    />
  ),
}));

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

vi.mock('@/shared/Breadcrumb', () => ({
  default: () => <nav data-testid="breadcrumb">Breadcrumb</nav>,
}));

vi.mock('@/shared/fieldset', () => ({
  Field: ({ children, ...props }: any) => (
    <div data-testid="field" {...props}>
      {children}
    </div>
  ),
  Label: ({ children, ...props }: any) => (
    <label data-testid="label" {...props}>
      {children}
    </label>
  ),
}));

vi.mock('@/shared/input', () => ({
  Input: ({ ...props }: any) => <input data-testid="input" {...props} />,
}));

vi.mock('@/shared/link', () => ({
  Link: ({ children, ...props }: any) => (
    <a data-testid="link" {...props}>
      {children}
    </a>
  ),
}));

describe('checkout Page', () => {
  test('should render checkout page', async () => {
    const CheckoutComponent = await CheckoutPage();
    render(CheckoutComponent);

    const checkoutForm = screen.getByTestId('checkout-information');
    expect(checkoutForm).toBeInTheDocument();
  });

  test('should render checkout information form', async () => {
    const CheckoutComponent = await CheckoutPage();
    render(CheckoutComponent);

    const informationForm = screen.getByTestId('checkout-information');
    expect(informationForm).toBeInTheDocument();
    expect(informationForm).toHaveTextContent('Checkout Information Form');
  });

  test('should display order summary', async () => {
    const CheckoutComponent = await CheckoutPage();
    render(CheckoutComponent);

    const orderSummary = screen.queryByText(/order summary/i) || screen.queryByText(/summary/i);
    expect(orderSummary).toBeInTheDocument();
  });

  test('should show cart items in summary', async () => {
    const CheckoutComponent = await CheckoutPage();
    render(CheckoutComponent);

    const cartItems = screen.queryAllByTestId('product-image');
    expect(cartItems.length).toBeGreaterThan(0);
    expect(cartItems[0]).toBeInTheDocument();
  });

  test('should display total amount', async () => {
    const CheckoutComponent = await CheckoutPage();
    render(CheckoutComponent);

    // Mock cart has total of 229.98
    const total = screen.getByText(/229\.98/i);
    expect(total).toBeInTheDocument();
  });

  test('should render payment section', async () => {
    const CheckoutComponent = await CheckoutPage();
    render(CheckoutComponent);

    const paymentSection = screen.queryByText(/payment/i) || screen.queryByText(/billing/i);
    expect(paymentSection).toBeInTheDocument();
  });

  test('should render shipping information section', async () => {
    const CheckoutComponent = await CheckoutPage();
    render(CheckoutComponent);

    // Shipping cost is 10.00 in mock
    const shippingCost = screen.getByText(/10\.00/i);
    expect(shippingCost).toBeInTheDocument();
  });

  test('should render place order button', async () => {
    const CheckoutComponent = await CheckoutPage();
    render(CheckoutComponent);

    const placeOrderButton =
      screen.queryByText(/place order/i) || screen.getByTestId('button-primary');
    expect(placeOrderButton).toBeInTheDocument();
  });

  test('should handle order submission', async () => {
    const CheckoutComponent = await CheckoutPage();
    render(CheckoutComponent);

    const submitButton = screen.queryByText(/place order/i) || screen.getByTestId('button-primary');
    fireEvent.click(submitButton);

    // Should not crash on order submission
    expect(submitButton).toBeInTheDocument();
  });

  test('should display shipping options', async () => {
    const CheckoutComponent = await CheckoutPage();
    render(CheckoutComponent);

    const shippingOptions =
      screen.queryByText(/standard/i) ||
      screen.queryByText(/express/i) ||
      screen.queryByText(/overnight/i);
    expect(shippingOptions).toBeInTheDocument();
  });

  test('should show payment methods', async () => {
    const CheckoutComponent = await CheckoutPage();
    render(CheckoutComponent);

    const paymentMethods = [
      screen.queryByText(/credit card/i),
      screen.queryByText(/paypal/i),
      screen.queryByText(/apple pay/i),
      screen.queryByText(/stripe/i),
    ].filter(Boolean);

    expect(paymentMethods.length).toBeGreaterThan(0);
    expect(paymentMethods[0]).toBeInTheDocument();
  });

  test('should calculate and display taxes', async () => {
    const CheckoutComponent = await CheckoutPage();
    render(CheckoutComponent);

    // Tax is 20.00 in mock
    const taxAmount = screen.getByText(/20\.00/i);
    expect(taxAmount).toBeInTheDocument();
  });

  test('should show discount/coupon section', async () => {
    const CheckoutComponent = await CheckoutPage();
    render(CheckoutComponent);

    const discountSection =
      screen.queryByText(/coupon/i) ||
      screen.queryByText(/discount/i) ||
      screen.queryByText(/promo/i);
    expect(discountSection).toBeInTheDocument();
  });

  test('should be responsive', async () => {
    const CheckoutComponent = await CheckoutPage();
    const { container } = render(CheckoutComponent);

    const responsiveElement = container.querySelector(
      '[class*="sm:"], [class*="md:"], [class*="lg:"]',
    );
    expect(responsiveElement).toBeInTheDocument();
  });

  test('should have proper form structure', async () => {
    const CheckoutComponent = await CheckoutPage();
    render(CheckoutComponent);

    const informationForm = screen.getByTestId('checkout-information');
    expect(informationForm).toBeInTheDocument();
  });

  test('should provide secure checkout indication', async () => {
    const CheckoutComponent = await CheckoutPage();
    render(CheckoutComponent);

    const securityIndicator =
      screen.queryByText(/secure/i) ||
      screen.queryByText(/ssl/i) ||
      screen.queryByText(/encrypted/i);
    expect(securityIndicator).toBeInTheDocument();
  });

  test('should render without errors', async () => {
    const CheckoutComponent = await CheckoutPage();
    expect(() => {
      render(CheckoutComponent);
    }).not.toThrow();
  });

  test('should maintain checkout flow progression', async () => {
    const CheckoutComponent = await CheckoutPage();
    render(CheckoutComponent);

    // Should have clear checkout steps or information form
    const checkoutForm = screen.getByTestId('checkout-information');
    expect(checkoutForm).toBeInTheDocument();
  });

  test('should handle back to cart navigation', async () => {
    const CheckoutComponent = await CheckoutPage();
    render(CheckoutComponent);

    const backToCartLink = screen.queryByText(/back to cart/i) || screen.queryByText(/edit cart/i);
    expect(backToCartLink).toBeInTheDocument();
  });
});
