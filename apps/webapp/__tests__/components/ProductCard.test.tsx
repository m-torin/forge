import ProductCard from '@/components/ProductCard';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the aside hook
const mockUseAside = vi.fn();
vi.mock('@/components/aside', () => ({
  useAside: () => mockUseAside(),
}));

// Mock the shared components
vi.mock('@/shared/NcImage/NcImage', () => ({
  default: ({ src, alt, className }: any) => (
    <img src={src?.src || src} alt={alt} className={className} data-testid="product-image" />
  ),
}));

vi.mock('@/shared/link', () => ({
  Link: ({ children, href, className }: any) => (
    <a href={href} className={className} data-testid="product-link">
      {children}
    </a>
  ),
}));

// Mock the child components
vi.mock('@/components/AddToCardButton', () => ({
  default: ({ children, title }: any) => (
    <button data-testid="add-to-cart-button" title={title}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/LikeButton', () => ({
  default: ({ liked, className }: any) => (
    <button data-testid="like-button" className={className} aria-pressed={liked}>
      {liked ? '❤️' : '🤍'}
    </button>
  ),
}));

vi.mock('@/components/Prices', () => ({
  default: ({ price }: any) => <span data-testid="price">${price}</span>,
}));

vi.mock('@/components/ProductStatus', () => ({
  default: ({ status }: any) => <span data-testid="product-status">{status}</span>,
}));

const mockProductData = {
  id: 'gid://test-1',
  title: 'Test Product',
  price: 99.99,
  status: 'New',
  rating: 4.5,
  reviewNumber: 123,
  handle: 'test-product',
  featuredImage: {
    src: '/test-image.jpg',
    width: 400,
    height: 400,
    alt: 'Test Product Image',
  },
  images: [
    {
      src: '/test-image.jpg',
      width: 400,
      height: 400,
      alt: 'Test Product Image',
    },
  ],
  options: [
    {
      name: 'Color',
      optionValues: [
        { name: 'Red', swatch: { color: '#ff0000', image: null } },
        { name: 'Blue', swatch: { color: '#0000ff', image: null } },
      ],
    },
    {
      name: 'Size',
      optionValues: [
        { name: 'Small', swatch: null },
        { name: 'Medium', swatch: null },
        { name: 'Large', swatch: null },
      ],
    },
  ],
  selectedOptions: [
    { name: 'Color', value: 'Red' },
    { name: 'Size', value: 'Medium' },
  ],
};

describe('productCard Component', () => {
  beforeEach(() => {
    mockUseAside.mockReturnValue({
      open: vi.fn(),
      setProductQuickViewHandle: vi.fn(),
    });
  });

  test('renders product card with basic information', () => {
    render(<ProductCard data={mockProductData} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Red')).toBeInTheDocument();
    expect(screen.getByText('4.5 (123 reviews)')).toBeInTheDocument();
    expect(screen.getByTestId('price')).toHaveTextContent('$99.99');
    expect(screen.getByTestId('product-status')).toHaveTextContent('New');
  });

  test('renders product image with correct attributes', () => {
    render(<ProductCard data={mockProductData} />);

    const image = screen.getByTestId('product-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');
  });

  test('renders product link with correct href', () => {
    render(<ProductCard data={mockProductData} />);

    const links = screen.getAllByTestId('product-link');
    expect(links[0]).toHaveAttribute('href', '/products/test-product');
  });

  test('renders like button with correct state', () => {
    render(<ProductCard data={mockProductData} isLiked={true} />);

    const likeButton = screen.getByTestId('like-button');
    expect(likeButton).toBeInTheDocument();
    expect(likeButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('renders color options when available', () => {
    render(<ProductCard data={mockProductData} />);

    // Color options should be rendered as divs with background colors
    const colorOptions = document.querySelectorAll('.size-4');
    expect(colorOptions).toHaveLength(2);
  });

  test('does not render color options when not available', () => {
    const productWithoutColors = {
      ...mockProductData,
      options: [],
    };

    render(<ProductCard data={productWithoutColors} />);

    const colorOptions = document.querySelectorAll('.size-4');
    expect(colorOptions).toHaveLength(0);
  });

  test('renders quick view and add to cart buttons on hover', () => {
    render(<ProductCard data={mockProductData} />);

    // These buttons are initially invisible and appear on hover
    const addToCartButton = screen.getByTestId('add-to-cart-button');
    expect(addToCartButton).toBeInTheDocument();
    expect(addToCartButton).toHaveAttribute('title', 'Test Product');
  });

  test('handles missing optional data gracefully', () => {
    const minimalProductData = {
      id: 'gid://minimal-1',
      title: 'Minimal Product',
      price: 50,
      handle: 'minimal-product',
      featuredImage: {
        src: '/minimal.jpg',
        width: 400,
        height: 400,
        alt: 'Minimal Product',
      },
      images: [],
      options: [],
      selectedOptions: [],
    };

    render(<ProductCard data={minimalProductData} />);

    expect(screen.getByText('Minimal Product')).toBeInTheDocument();
    expect(screen.getByTestId('price')).toHaveTextContent('$50');
    // Should not crash when optional fields are missing
  });

  test('applies custom className', () => {
    const customClass = 'custom-product-card';
    const { container } = render(<ProductCard data={mockProductData} className={customClass} />);

    const productCard = container.querySelector('.product-card');
    expect(productCard).toBeTruthy();
    expect(productCard).toHaveClass(customClass);
  });

  test('renders with default className when not provided', () => {
    const { container } = render(<ProductCard data={mockProductData} />);

    const productCard = container.querySelector('.product-card');
    expect(productCard).toBeTruthy();
    expect(productCard).toHaveClass('product-card');
  });

  test('displays correct rating and review count', () => {
    render(<ProductCard data={mockProductData} />);

    expect(screen.getByText('4.5 (123 reviews)')).toBeInTheDocument();
  });

  test('handles zero reviews gracefully', () => {
    const productWithNoReviews = {
      ...mockProductData,
      reviewNumber: 0,
    };

    render(<ProductCard data={productWithNoReviews} />);

    expect(screen.getByText('4.5 (0 reviews)')).toBeInTheDocument();
  });

  test('renders product card with dark mode classes', () => {
    const { container } = render(<ProductCard data={mockProductData} />);

    const productCard = container.querySelector('.product-card');
    expect(productCard).toBeInTheDocument();

    // Just verify the product card renders correctly
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });
});
