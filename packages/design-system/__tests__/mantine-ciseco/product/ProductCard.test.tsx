import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import ProductCard from '../../../mantine-ciseco/components/ProductCard';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, 'data-testid': testId, ...props }: any) => (
    <img src={src} alt={alt} width={width} height={height} data-testid={testId} {...props} />
  ),
}));

// Mock ProgressiveImage component
vi.mock('../../../mantine-ciseco/components/ProgressiveImage', () => ({
  ProgressiveImage: ({ src, alt, 'data-testid': testId, ...props }: any) => (
    <img src={src} alt={alt} data-testid={testId} {...props} />
  ),
}));

// Mock AddToCardButton to avoid notification issues
vi.mock('../../../mantine-ciseco/components/AddToCardButton', () => ({
  default: ({ children, onClick, 'data-testid': testId, ...props }: any) => (
    <button onClick={onClick} data-testid={testId} {...props}>
      {children}
    </button>
  ),
}));

// Mock the locale hook
vi.mock('../../../mantine-ciseco/hooks/useLocale', () => ({
  useLocalizeHref: () => (href: string) => href,
}));

// Mock Prices component
vi.mock('../../../mantine-ciseco/components/Prices', () => ({
  default: ({ price, salePrice, showDiscount }: any) => (
    <div>
      {salePrice ? (
        <div>
          <span>${salePrice}</span>
          <span className="line-through">${price}</span>
          {showDiscount && <span>{Math.round(((price - salePrice) / price) * 100)}% OFF</span>}
        </div>
      ) : (
        <span>${price}</span>
      )}
    </div>
  ),
}));

// Mock ProductStatus component
vi.mock('../../../mantine-ciseco/components/ProductStatus', () => ({
  default: ({ status, 'data-testid': testId }: any) => (
    <div data-testid={testId}>{status && <span>{status}</span>}</div>
  ),
}));

// Mock LikeButton component
vi.mock('../../../mantine-ciseco/components/LikeButton', () => ({
  default: ({ 'data-testid': testId, onClick, ...props }: any) => (
    <button data-testid={testId} onClick={onClick} {...props}>
      Like
    </button>
  ),
}));

// Mock Mantine Drawer
vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual('@mantine/core');
  return {
    ...actual,
    Drawer: ({ children, opened, onClose, title }: any) =>
      opened ? (
        <div data-testid="drawer-modal" role="dialog">
          <div>{title}</div>
          {children}
        </div>
      ) : null,
    ScrollArea: ({ children }: any) => <div>{children}</div>,
  };
});

// Mock Mantine hooks
vi.mock('@mantine/hooks', () => ({
  useDisclosure: () => [false, { close: vi.fn(), open: vi.fn() }],
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ href, children, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe('ProductCard', () => {
  const defaultProduct = {
    id: 'gid://1',
    title: 'Test Product',
    handle: 'test-product',
    price: 99.99,
    featuredImage: {
      src: '/images/test.jpg',
      alt: 'Test Product',
      width: 800,
      height: 600,
    },
    images: [
      {
        src: '/images/test.jpg',
        alt: 'Test Product',
        width: 800,
        height: 600,
      },
    ],
    rating: 4.5,
    reviewNumber: 10,
    status: 'New in',
    selectedOptions: [
      { name: 'Color', value: 'Red' },
      { name: 'Size', value: 'M' },
    ],
    options: [
      {
        name: 'Color',
        optionValues: [
          { name: 'Red', swatch: { color: '#ff0000', image: null } },
          { name: 'Blue', swatch: { color: '#0000ff', image: null } },
        ],
      },
    ],
    vendor: 'Test Vendor',
    createdAt: '2025-01-01T00:00:00-00:00',
  };

  const mockOnClick = vi.fn();
  const mockOnAddToCart = vi.fn();
  const mockOnLike = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
    mockOnAddToCart.mockClear();
    mockOnLike.mockClear();
  });

  it('renders product card with basic info', () => {
    render(<ProductCard product={defaultProduct} />);

    expect(screen.getByText(defaultProduct.title)).toBeInTheDocument();
    expect(screen.getByText(`$${defaultProduct.price}`)).toBeInTheDocument();
  });

  it('renders product image', () => {
    render(<ProductCard product={defaultProduct} />);
    const image = screen.getByTestId('product-card-image');
    expect(image).toBeInTheDocument();
  });

  it('renders placeholder when no image', () => {
    const productWithoutImage = { ...defaultProduct, featuredImage: undefined };
    render(<ProductCard product={productWithoutImage} />);

    const placeholder = screen.getByTestId('placeholder');
    expect(placeholder).toBeInTheDocument();
  });

  it('handles click on card', () => {
    render(<ProductCard product={defaultProduct} onClick={mockOnClick} />);
    const card = screen.getByTestId('product-card');

    fireEvent.click(card);
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('renders sale price when available', () => {
    const productWithSale = {
      ...defaultProduct,
      price: 100,
      salePrice: 75,
    };
    render(<ProductCard product={productWithSale} />);

    expect(screen.getByText('$75')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
  });

  it('shows discount percentage', () => {
    const productWithSale = {
      ...defaultProduct,
      price: 100,
      salePrice: 75,
    };
    // Pass the showDiscount prop to the mock Prices component
    render(
      <ProductCard product={productWithSale} data={{ ...productWithSale, showDiscount: true }} />,
    );

    expect(screen.getByText('25% OFF')).toBeInTheDocument();
  });

  it('renders product rating', () => {
    render(<ProductCard product={defaultProduct} showRating />);

    expect(screen.getByText(defaultProduct.rating.toString())).toBeInTheDocument();
    expect(screen.getByText(`(${defaultProduct.reviewNumber})`)).toBeInTheDocument();
  });

  it('renders like button when showLike is true', () => {
    render(<ProductCard product={defaultProduct} showLike onLike={mockOnLike} />);
    const likeButton = screen.getByTestId('product-card-like-button');

    expect(likeButton).toBeInTheDocument();
    fireEvent.click(likeButton);
    expect(mockOnLike).toHaveBeenCalled();
  });

  it('renders add to cart button on hover', async () => {
    render(<ProductCard product={defaultProduct} showAddToCart onAddToCart={mockOnAddToCart} />);

    const card = screen.getByTestId('product-card');
    fireEvent.mouseEnter(card);

    const addToCartButton = screen.getByTestId('product-card-add-to-cart-button');
    expect(addToCartButton).toBeInTheDocument();

    fireEvent.click(addToCartButton);
    expect(mockOnAddToCart).toHaveBeenCalled();
  });

  it('renders product variants', () => {
    render(<ProductCard product={defaultProduct} showVariants />);

    defaultProduct.options[0].optionValues.forEach((color) => {
      const testId = `product-card-color-option-${color.name.toLowerCase().replace(/\s+/g, '-')}`;
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    });
  });

  it('shows out of stock overlay', () => {
    const outOfStockProduct = {
      ...defaultProduct,
      status: 'out-of-stock',
    };
    render(<ProductCard product={outOfStockProduct} />);

    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    expect(screen.getByTestId('product-card')).toHaveClass('opacity-75');
  });

  it('renders with different layouts', () => {
    const { rerender } = render(<ProductCard product={defaultProduct} layout="grid" />);
    expect(screen.getByTestId('product-card')).toHaveClass('layout-grid');

    rerender(<ProductCard product={defaultProduct} layout="list" />);
    expect(screen.getByTestId('product-card')).toHaveClass('layout-list');
  });

  it('renders with custom className', () => {
    render(<ProductCard product={defaultProduct} className="custom-product-card" />);
    expect(screen.getByTestId('product-card')).toHaveClass('custom-product-card');
  });

  it('shows quick view button', () => {
    const mockOnQuickView = vi.fn();
    render(<ProductCard product={defaultProduct} showQuickView onQuickView={mockOnQuickView} />);

    const card = screen.getByTestId('product-card');
    fireEvent.mouseEnter(card);

    const quickViewButton = screen.getByTestId('product-card-quick-view-button');
    fireEvent.click(quickViewButton);
    expect(mockOnQuickView).toHaveBeenCalled();
  });

  it('renders product badges', () => {
    const productWithBadges = {
      ...defaultProduct,
      badges: ['New', 'Best Seller', 'Limited'],
    };
    render(<ProductCard product={productWithBadges} />);

    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Best Seller')).toBeInTheDocument();
    expect(screen.getByText('Limited')).toBeInTheDocument();
  });

  it('lazy loads images', () => {
    render(<ProductCard product={defaultProduct} lazyLoad />);
    const image = screen.getByTestId('product-card-image');

    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('renders skeleton loading state', () => {
    render(<ProductCard product={defaultProduct} loading />);

    expect(screen.getByTestId('product-card-skeleton')).toBeInTheDocument();
    expect(screen.queryByText(defaultProduct.title)).not.toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    render(
      <ProductCard product={defaultProduct} onClick={mockOnClick} showLike onLike={mockOnLike} />,
    );

    const card = screen.getByTestId('product-card');
    card.focus();

    // Enter key triggers click
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('shows compare checkbox', () => {
    const mockOnCompare = vi.fn();
    render(<ProductCard product={defaultProduct} showCompare onCompare={mockOnCompare} />);

    const compareCheckbox = screen.getByTestId('product-card-compare-checkbox');
    fireEvent.click(compareCheckbox);
    expect(mockOnCompare).toHaveBeenCalled();
  });

  it('uses custom price formatter', () => {
    const formatter = (price: number) => `€${price.toFixed(2)}`;
    render(<ProductCard product={defaultProduct} priceFormatter={formatter} />);

    expect(screen.getByText(`€${defaultProduct.price.toFixed(2)}`)).toBeInTheDocument();
  });

  it('renders product status badge', () => {
    render(<ProductCard product={defaultProduct} />);
    const statusBadge = screen.getByTestId('product-card-status');
    expect(statusBadge).toBeInTheDocument();
  });

  it('applies correct card structure classes', () => {
    render(<ProductCard product={defaultProduct} />);
    const card = screen.getByTestId('product-card');

    expect(card).toHaveClass('nc-ProductCard', 'relative', 'flex', 'flex-col', 'bg-transparent');
  });

  it('renders Link wrapper with correct href', () => {
    render(<ProductCard product={defaultProduct} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/products/${defaultProduct.handle}`);
  });

  it('handles missing product data gracefully', () => {
    render(<ProductCard />);
    // Should not crash and render placeholder
    const placeholder = screen.getByTestId('placeholder');
    expect(placeholder).toBeInTheDocument();
  });

  it('applies tabIndex when onClick is provided', () => {
    render(<ProductCard product={defaultProduct} onClick={mockOnClick} />);
    const card = screen.getByTestId('product-card');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('does not apply tabIndex when onClick is not provided', () => {
    render(<ProductCard product={defaultProduct} />);
    const card = screen.getByTestId('product-card');
    expect(card).not.toHaveAttribute('tabIndex');
  });

  it('handles color selection display', () => {
    render(<ProductCard product={defaultProduct} />);

    // Should display the selected color value
    const colorText = screen.getByText('Red');
    expect(colorText).toBeInTheDocument();
  });
});
