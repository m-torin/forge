// @ts-nocheck - Test file with component prop compatibility issues
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test-utils';
import ProductCardLarge from '../../../mantine-ciseco/components/ProductCardLarge';
import { mockProduct } from '../test-utils';

// Mock the Link component
vi.mock('next/link', (_: any) => ({
  default: ({ children, className, href, ...props }: any) => (
    <a className={className} href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock the useLocalizeHref hook
vi.mock('../../../mantine-ciseco/hooks/useLocale', (_: any) => ({
  useLocalizeHref: () => (href: string) => `/en${href}`,
}));

// Mock NcImage to avoid Next.js Image issues
vi.mock('../../../mantine-ciseco/components/shared/NcImage/NcImage', (_: any) => ({
  default: ({ alt, src, containerClassName, fill, sizes, ...props }: any) => {
    const imgSrc = typeof src === 'object' ? src.src : src;
    const imgAlt = alt || (typeof src === 'object' ? src.alt : '');
    return (
      <div className={containerClassName}>
        <img alt={imgAlt} src={imgSrc} {...props} />
      </div>
    );
  },
}));

describe('ProductCardLarge', (_: any) => {
  const defaultProduct = mockProduct({ title: 'Test Product' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders product card with basic info', (_: any) => {
    const product = mockProduct({ title: 'Test Product', price: 99.99 });
    render(<ProductCardLarge product={product} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  it('displays product rating and reviews', (_: any) => {
    const productWithReviews = mockProduct({ reviewNumber: 120 });
    render(<ProductCardLarge product={productWithReviews} />);

    expect(
      screen.getByText(`${productWithReviews.rating} (${productWithReviews.reviewNumber} reviews)`),
    ).toBeInTheDocument();
  });

  it('renders main product image', (_: any) => {
    render(<ProductCardLarge product={defaultProduct} />);

    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
    // NcImage mock receives the image object
  });

  it('renders thumbnail gallery with up to 3 additional images', (_: any) => {
    const productWithMultipleImages = mockProduct({
      title: 'Test Product',
      images: [
        { src: '/img1.jpg', alt: 'Main image' },
        { src: '/img2.jpg', alt: 'Thumb 1' },
        { src: '/img3.jpg', alt: 'Thumb 2' },
        { src: '/img4.jpg', alt: 'Thumb 3' },
        { src: '/img5.jpg', alt: 'Not rendered' }, // More than 4 images
      ],
    });

    render(<ProductCardLarge product={productWithMultipleImages} />);

    const images = screen.getAllByRole('img');
    // One main image + up to 3 thumbnails = 4 max
    expect(images.length).toBe(4);
  });

  it('displays selected color option', (_: any) => {
    const productWithColor = mockProduct({
      selectedOptions: [{ name: 'Color', value: 'Red' }],
    });

    render(<ProductCardLarge product={productWithColor} />);
    expect(screen.getByText('Red')).toBeInTheDocument();
  });

  it('renders as a link to product page', (_: any) => {
    render(<ProductCardLarge product={defaultProduct} />);

    // There might be multiple links, find the main product link
    const links = screen.getAllByRole('link');
    const productLink = links.find((link: any) =>
      link.getAttribute('href')?.includes(`/products/${defaultProduct.handle}`),
    );
    expect(productLink).toBeInTheDocument();
  });

  it('applies custom className', (_: any) => {
    const { container } = render(
      <ProductCardLarge product={defaultProduct} className="custom-class" />,
    );

    // Check if any element has the custom class
    const customElement = container.querySelector('.custom-class');
    expect(customElement).toBeInTheDocument();
  });

  it('handles products without images gracefully', (_: any) => {
    const productWithoutImages = mockProduct({ images: [] });

    render(<ProductCardLarge product={productWithoutImages} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('handles products without color option', (_: any) => {
    const productWithoutColor = mockProduct({
      selectedOptions: [],
    });

    render(<ProductCardLarge product={productWithoutColor} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('uses responsive container classes', (_: any) => {
    const { container } = render(<ProductCardLarge product={defaultProduct} />);

    const imageContainers = container.querySelectorAll('.sm\\:h-28');
    expect(imageContainers.length).toBeGreaterThan(0);
  });
});
