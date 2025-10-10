import CollectionCard2 from '@/components/CollectionCard2';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

// Mock Next.js components
vi.mock('next/image', () => ({
  default: ({ src, alt, className, fill, priority, ...props }: any) => (
    <img
      src={src}
      alt={alt}
      className={className}
      data-testid="collection-image"
      data-fill={fill ? 'true' : 'false'}
      data-priority={priority ? 'true' : 'false'}
      {...props}
    />
  ),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('collectionCard2', () => {
  const mockCollection = {
    id: 'gid://2',
    title: 'Summer Collection',
    handle: 'summer',
    sortDescription: 'Bright and vibrant summer styles',
    image: {
      src: '/summer-collection.jpg',
      alt: 'Summer Collection',
      width: 400,
      height: 400,
    },
    color: 'bg-blue-50',
  };

  test('should render collection card', () => {
    render(<CollectionCard2 collection={mockCollection} />);

    const collectionName = screen.getByText('Summer Collection');
    expect(collectionName).toBeInTheDocument();
  });

  test('should render collection image', () => {
    render(<CollectionCard2 collection={mockCollection} />);

    // Next.js Image is mocked as img in tests
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    // Image component receives the whole image object, not just src
    expect(image).toHaveAttribute('alt', mockCollection.image.alt);
  });

  test('should render collection description', () => {
    render(<CollectionCard2 collection={mockCollection} />);

    // Description is rendered with dangerouslySetInnerHTML, so we need to check the container
    const description = screen.queryByText('Bright and vibrant summer styles');
    expect(description).toBeInTheDocument();
  });

  test('should render as link to collection', () => {
    render(<CollectionCard2 collection={mockCollection} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/collections/' + mockCollection.handle);
  });

  test('should display item count', () => {
    render(<CollectionCard2 collection={mockCollection} />);

    const itemCount = screen.queryByText(/45.*items?/i) || screen.queryByText('45');
    expect(itemCount).toBeInTheDocument();
  });

  test('should show featured badge if featured', () => {
    render(<CollectionCard2 collection={mockCollection} />);

    const featuredBadge = screen.queryByText(/featured|new|popular/i);
    expect(featuredBadge).toBeInTheDocument();
  });

  test('should apply theme color if provided', () => {
    const { container } = render(<CollectionCard2 collection={mockCollection} />);

    const colorElement = container.querySelector(
      '[class*="blue"], [style*="blue"], [class*="bg-blue"]',
    );
    expect(colorElement).toBeInTheDocument();
  });

  test('should handle missing image gracefully', () => {
    const collectionWithoutImage = { ...mockCollection, image: undefined };

    expect(() => {
      render(<CollectionCard2 collection={collectionWithoutImage} />);
    }).not.toThrow();
  });

  test('should handle missing description gracefully', () => {
    const collectionWithoutDesc = { ...mockCollection, sortDescription: '' };

    expect(() => {
      render(<CollectionCard2 collection={collectionWithoutDesc} />);
    }).not.toThrow();
  });

  test('should apply custom className', () => {
    const { container } = render(
      <CollectionCard2 collection={mockCollection} className="custom-card2" />,
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-card2');
  });

  test('should have proper card layout', () => {
    const { container } = render(<CollectionCard2 collection={mockCollection} />);

    // Should have card-like styling
    const cardElement = container.querySelector(
      '[class*="card"], [class*="border"], [class*="shadow"], [class*="rounded"]',
    );
    expect(cardElement).toBeInTheDocument();
  });

  test('should be responsive', () => {
    const { container } = render(<CollectionCard2 collection={mockCollection} />);

    const responsiveElement = container.querySelector(
      '[class*="sm:"], [class*="md:"], [class*="lg:"]',
    );
    expect(responsiveElement).toBeInTheDocument();
  });

  test('should handle hover effects', () => {
    const { container } = render(<CollectionCard2 collection={mockCollection} />);

    const hoverElement = container.querySelector('[class*="hover:"], [class*="transition"]');
    expect(hoverElement).toBeInTheDocument();
  });

  test('should render collection metadata', () => {
    render(<CollectionCard2 collection={mockCollection} />);

    // Check for title and count separately
    const title = screen.getByText('Summer Collection');
    expect(title).toBeInTheDocument();

    // Count might be displayed
    const count = screen.queryByText(/45/);
    expect(count).toBeInTheDocument();
  });

  test('should handle different card variants', () => {
    render(<CollectionCard2 collection={mockCollection} />);

    const collectionName = screen.getByText('Summer Collection');
    expect(collectionName).toBeInTheDocument();
  });

  test('should render without errors', () => {
    expect(() => {
      render(<CollectionCard2 collection={mockCollection} />);
    }).not.toThrow();
  });
});
