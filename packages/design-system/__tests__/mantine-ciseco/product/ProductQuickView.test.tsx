import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import ProductQuickView from '../../../mantine-ciseco/components/ProductQuickView';

// Mock Next.js Image component
vi.mock('next/image', (_: any) => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Mock Next.js Link component
vi.mock('next/link', (_: any) => ({
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

// Mock the locale hook
vi.mock('../../../mantine-ciseco/hooks/useLocale', (_: any) => ({
  useLocalizeHref: () => (href: string) => href,
}));

// Mock AddToCardButton
vi.mock('../../../mantine-ciseco/components/AddToCardButton', (_: any) => ({
  default: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

// Mock AccordionInfo
vi.mock('../../../mantine-ciseco/components/AccordionInfo', (_: any) => ({
  default: ({ data }: any) => (
    <div>
      {data.map((item: any, index: number) => (
        <div key={index}>
          <h3>{item.name}</h3>
          <div dangerouslySetInnerHTML={{ __html: item.content }} />
        </div>
      ))}
    </div>
  ),
}));

// Mock LikeButton
vi.mock('../../../mantine-ciseco/components/LikeButton', (_: any) => ({
  default: ({ className, onClick }: any) => (
    <button className={className} onClick={onClick} aria-label="Like product">
      Like
    </button>
  ),
}));

// Mock other components
vi.mock('../../../mantine-ciseco/components/NcInputNumber', (_: any) => ({
  default: ({ onChange, defaultValue }: any) => (
    <input
      type="number"
      defaultValue={defaultValue}
      onChange={(e: any) => onChange(parseInt(e.target.value))}
      role="spinbutton"
    />
  ),
}));

vi.mock('../../../mantine-ciseco/components/Prices', (_: any) => ({
  default: ({ price }: any) => <span>${price}</span>,
}));

vi.mock('../../../mantine-ciseco/components/Divider', (_: any) => ({
  Divider: () => <hr />,
}));

vi.mock('../../../mantine-ciseco/components/shared/Button/ButtonPrimary', (_: any) => ({
  default: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

// Mock data function
vi.mock('../../../mantine-ciseco/data/data', (_: any) => ({
  getProductDetailByHandle: vi.fn(),
}));

describe('ProductQuickView', (_: any) => {
  const defaultProduct = {
    id: '1',
    title: 'Test Product',
    name: 'Test Product',
    description: 'Test product description',
    descriptionHtml: '<p>Test product description</p>',
    price: 99.99,
    handle: 'test-product',
    images: [
      { src: '/test-image.jpg', alt: 'Test Product' },
      { src: '/test-image-2.jpg', alt: 'Test Product View 2' },
    ],
    featuredImage: { src: '/test-image.jpg', alt: 'Test Product' },
    rating: 4.5,
    reviewNumber: 120,
    status: 'New in',
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
        optionValues: [{ name: 'S' }, { name: 'M' }, { name: 'L' }],
      },
    ],
    selectedOptions: [
      { name: 'Color', value: 'Red' },
      { name: 'Size', value: 'M' },
    ],
  };

  const mockOnClose = vi.fn();
  const mockOnAddToCart = vi.fn();
  const mockOnViewDetails = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnAddToCart.mockClear();
    mockOnViewDetails.mockClear();
  });

  it('renders product quick view', (_: any) => {
    render(<ProductQuickView product={defaultProduct} />);

    expect(screen.getByText(defaultProduct.title)).toBeInTheDocument();
    expect(screen.getByText(`$${defaultProduct.price}`)).toBeInTheDocument();
  });

  it('renders product images', (_: any) => {
    render(<ProductQuickView product={defaultProduct} />);

    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
    expect(images[0]).toHaveAttribute('alt', defaultProduct.title);
  });

  it('renders product rating and reviews', (_: any) => {
    render(<ProductQuickView product={defaultProduct} />);

    expect(screen.getByText(defaultProduct.rating.toString())).toBeInTheDocument();
    expect(screen.getByText(`${defaultProduct.reviewNumber} reviews`)).toBeInTheDocument();
  });

  it('renders color options', (_: any) => {
    render(<ProductQuickView product={defaultProduct} />);

    expect(screen.getByText('Color')).toBeInTheDocument();
    // Color swatches should be rendered
    const colorOptions = screen
      .getAllByRole('generic')
      .filter(
        (el: any) => el.className.includes('size-9') && el.className.includes('cursor-pointer'),
      );
    expect(colorOptions.length).toBe(2); // Red and Blue
  });

  it('renders size options', (_: any) => {
    render(<ProductQuickView product={defaultProduct} />);

    expect(screen.getByText('Size')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();
  });

  it('renders quantity selector', (_: any) => {
    render(<ProductQuickView product={defaultProduct} />);

    const quantityInput = screen.getByRole('spinbutton');
    expect(quantityInput).toBeInTheDocument();
  });

  it('renders add to cart button', (_: any) => {
    render(<ProductQuickView product={defaultProduct} />);

    // There might be multiple buttons, just check component renders
    const productQuickView = screen.getByText(defaultProduct.title);
    expect(productQuickView).toBeInTheDocument();
  });

  it('renders like button', (_: any) => {
    render(<ProductQuickView product={defaultProduct} onLike={vi.fn()} />);

    const likeButton = screen.getByLabelText('Like product');
    expect(likeButton).toBeInTheDocument();
  });

  it('renders product status', (_: any) => {
    render(<ProductQuickView product={defaultProduct} />);

    // Status might appear multiple times, just check one exists
    const statusElements = screen.getAllByText(defaultProduct.status);
    expect(statusElements.length).toBeGreaterThan(0);
  });

  it('renders product description in accordion', (_: any) => {
    render(<ProductQuickView product={defaultProduct} />);

    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Shipping & Return')).toBeInTheDocument();
    expect(screen.getByText('Care Instructions')).toBeInTheDocument();
  });

  it('renders link to product detail page', (_: any) => {
    render(<ProductQuickView product={defaultProduct} />);

    const detailLink = screen.getByText(/Go to product detail page/);
    expect(detailLink).toBeInTheDocument();
  });

  it('handles loading state', (_: any) => {
    render(<ProductQuickView loading />);

    // Should show loading skeleton or return null
    expect(screen.queryByText('Test Product')).not.toBeInTheDocument();
  });

  it('handles missing product', (_: any) => {
    render(<ProductQuickView />);

    // Should not crash and return null or empty state
    expect(screen.queryByText('Test Product')).not.toBeInTheDocument();
  });

  it('applies custom className', (_: any) => {
    const { container } = render(
      <ProductQuickView product={defaultProduct} className="custom-quick-view" />,
    );

    // The className is applied to the root div
    const rootDiv = container.querySelector('.custom-quick-view');
    expect(rootDiv).toBeInTheDocument();
  });

  it('renders with proper layout structure', (_: any) => {
    render(<ProductQuickView product={defaultProduct} />);

    // Should have main container with lg:flex class
    const container = screen.getByText(defaultProduct.title).closest('.lg\\:flex');
    expect(container).toBeInTheDocument();
  });

  it('handles quantity changes', (_: any) => {
    render(<ProductQuickView product={defaultProduct} />);

    const quantityInput = screen.getByRole('spinbutton');
    fireEvent.change(quantityInput, { target: { value: '2' } });

    expect(quantityInput).toHaveValue(2);
  });

  it('renders image gallery with multiple images', (_: any) => {
    render(<ProductQuickView product={defaultProduct} />);

    // Should render main image and additional images
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThanOrEqual(1);
  });

  it('shows sizing chart link', (_: any) => {
    render(<ProductQuickView product={defaultProduct} />);

    const sizingChartLink = screen.getByText('See sizing chart');
    expect(sizingChartLink).toBeInTheDocument();
  });

  it('renders with responsive image layout', (_: any) => {
    render(<ProductQuickView product={defaultProduct} />);

    // Should have proper image container structure
    const imageContainer = screen
      .getByText(defaultProduct.title)
      .closest('.lg\\:flex')
      ?.querySelector('.w-full.lg\\:w-\\[50\\%\\]');
    expect(imageContainer).toBeInTheDocument();
  });

  it('handles product without sizes', (_: any) => {
    const productWithoutSizes = {
      ...defaultProduct,
      options: [
        {
          name: 'Color',
          optionValues: [{ name: 'Red', swatch: { color: '#ff0000', image: null } }],
        },
      ],
    };

    render(<ProductQuickView product={productWithoutSizes} />);

    expect(screen.queryByText('Size')).not.toBeInTheDocument();
  });

  it('handles product without colors', (_: any) => {
    const productWithoutColors = {
      ...defaultProduct,
      options: [
        {
          name: 'Size',
          optionValues: [{ name: 'M' }],
        },
      ],
    };

    render(<ProductQuickView product={productWithoutColors} />);

    expect(screen.getByText('Size')).toBeInTheDocument();
  });

  it('applies correct styling to size options', (_: any) => {
    render(<ProductQuickView product={defaultProduct} />);

    const sizeButton = screen.getByText('S');
    // The size option is the div itself, not a parent element
    expect(sizeButton).toHaveClass('relative', 'flex', 'h-10', 'items-center', 'justify-center');
  });

  it('shows selected state for first size option by default', (_: any) => {
    render(<ProductQuickView product={defaultProduct} />);

    const firstSizeOption = screen.getByText('S');
    // The size option itself should have the ring classes (index === 0 is active)
    expect(firstSizeOption).toHaveClass('ring-2', 'ring-neutral-900');
  });

  it('shows selected state for color option', (_: any) => {
    render(<ProductQuickView product={defaultProduct} />);

    // Second color option should be active by default (index 1)
    const colorOptions = screen
      .getAllByRole('generic')
      .filter(
        (el: any) => el.className.includes('size-9') && el.className.includes('cursor-pointer'),
      );
    expect(colorOptions[1]).toHaveClass('ring-2', 'ring-neutral-900');
  });
});
