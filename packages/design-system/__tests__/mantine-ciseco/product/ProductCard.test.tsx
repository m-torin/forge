import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '../test-utils';
import ProductCard from '../../../mantine-ciseco/components/ProductCard';
import { mockProduct } from '../test-utils';

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
  useLocalizeHref: () => (href: string) => `/en${href}`,
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
    // Check for placeholder or image
    const placeholder = screen.queryByTestId('placeholder');
    const image = screen.queryByRole('img');
    expect(placeholder || image).toBeInTheDocument();
  });

  it('renders product image or placeholder', () => {
    render(<ProductCard product={defaultProduct} />);
    // Check for either image or placeholder during loading
    const placeholder = screen.queryByTestId('placeholder');
    const image = screen.queryByRole('img');
    expect(placeholder || image).toBeInTheDocument();
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
    expect(screen.getByText('$100')).toHaveClass('line-through');
  });

  it('shows discount percentage', () => {
    const productWithSale = {
      ...defaultProduct,
      price: 100,
      salePrice: 75,
    };
    render(<ProductCard product={productWithSale} showDiscount />);

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

    await waitFor(() => {
      const addToCartButton = screen.getByTestId('product-card-add-to-cart-button');
      expect(addToCartButton).toBeInTheDocument();
    });

    const addToCartButton = screen.getByTestId('product-card-add-to-cart-button');
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

  it('shows multiple product images on hover', async () => {
    render(<ProductCard product={defaultProduct} showImageGallery />);
    const card = screen.getByTestId('product-card');

    fireEvent.mouseEnter(card);

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(defaultProduct.images.length);
    });
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
});
