import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import CollectionCard1 from '../../../mantine-ciseco/components/CollectionCard1';
import { mockCollection } from '../test-utils';

describe('CollectionCard1', () => {
  const defaultCollection = mockCollection();
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders collection card with basic info', () => {
    render(<CollectionCard1 collection={defaultCollection} />);

    expect(screen.getByText(defaultCollection.name)).toBeInTheDocument();
    expect(screen.getByText(defaultCollection.description)).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('alt', defaultCollection.name);
  });

  it('renders collection image', () => {
    render(<CollectionCard1 collection={defaultCollection} />);
    const image = screen.getByRole('img');

    expect(image).toHaveAttribute('src', defaultCollection.image);
    expect(image).toHaveAttribute('alt', defaultCollection.name);
  });

  it('handles click on card', () => {
    render(<CollectionCard1 collection={defaultCollection} onClick={mockOnClick} />);
    const card = screen.getByTestId('collection-card');

    fireEvent.click(card);
    expect(mockOnClick).toHaveBeenCalledWith(defaultCollection);
  });

  it('shows product count', () => {
    render(<CollectionCard1 collection={defaultCollection} showProductCount />);
    expect(screen.getByText(`${defaultCollection.productCount} items`)).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<CollectionCard1 collection={defaultCollection} className="custom-collection-card" />);
    expect(screen.getByTestId('collection-card')).toHaveClass('custom-collection-card');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<CollectionCard1 collection={defaultCollection} size="sm" />);
    expect(screen.getByTestId('collection-card')).toHaveClass('size-sm');

    rerender(<CollectionCard1 collection={defaultCollection} size="md" />);
    expect(screen.getByTestId('collection-card')).toHaveClass('size-md');

    rerender(<CollectionCard1 collection={defaultCollection} size="lg" />);
    expect(screen.getByTestId('collection-card')).toHaveClass('size-lg');
  });

  it('renders with overlay text', () => {
    render(<CollectionCard1 collection={defaultCollection} overlay />);
    const textOverlay = screen.getByTestId('text-overlay');
    expect(textOverlay).toBeInTheDocument();
    expect(textOverlay).toHaveClass('overlay-style');
  });

  it('shows hover effects', () => {
    render(<CollectionCard1 collection={defaultCollection} />);
    const card = screen.getByTestId('collection-card');

    fireEvent.mouseEnter(card);
    expect(card).toHaveClass('hover-effect');

    fireEvent.mouseLeave(card);
    expect(card).not.toHaveClass('hover-effect');
  });

  it('renders with aspect ratio', () => {
    render(<CollectionCard1 collection={defaultCollection} aspectRatio="4/3" />);
    const imageContainer = screen.getByRole('img').parentElement;
    expect(imageContainer).toHaveStyle({ aspectRatio: '4/3' });
  });

  it('handles keyboard navigation', () => {
    render(<CollectionCard1 collection={defaultCollection} onClick={mockOnClick} />);
    const card = screen.getByTestId('collection-card');

    card.focus();
    expect(card).toHaveFocus();

    fireEvent.keyDown(card, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledWith(defaultCollection);

    fireEvent.keyDown(card, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });

  it('renders loading state', () => {
    render(<CollectionCard1 loading />);

    expect(screen.getByTestId('collection-card-skeleton')).toBeInTheDocument();
    expect(screen.queryByText(defaultCollection.name)).not.toBeInTheDocument();
  });

  it('lazy loads images', () => {
    render(<CollectionCard1 collection={defaultCollection} lazyLoad />);
    const image = screen.getByRole('img');

    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('renders with badge when featured', () => {
    const featuredCollection = mockCollection({ featured: true });
    render(<CollectionCard1 collection={featuredCollection} />);

    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('renders with custom badge', () => {
    render(<CollectionCard1 collection={defaultCollection} badge="New Collection" />);
    expect(screen.getByText('New Collection')).toBeInTheDocument();
  });

  it('shows collection stats', () => {
    const collectionWithStats = mockCollection({
      productCount: 25,
      averagePrice: 99.99,
      rating: 4.5,
    });

    render(<CollectionCard1 collection={collectionWithStats} showStats />);

    expect(screen.getByText('25 items')).toBeInTheDocument();
    expect(screen.getByText('Avg $99.99')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('renders with gradient overlay', () => {
    render(<CollectionCard1 collection={defaultCollection} gradient />);
    const overlay = screen.getByTestId('gradient-overlay');
    expect(overlay).toBeInTheDocument();
  });

  it('handles image loading error', () => {
    render(<CollectionCard1 collection={defaultCollection} />);
    const image = screen.getByRole('img');

    fireEvent.error(image);
    expect(image).toHaveAttribute('src', '/placeholder-collection.png');
  });

  it('renders with custom image aspect ratio', () => {
    render(<CollectionCard1 collection={defaultCollection} imageAspectRatio="16/9" />);
    const imageContainer = screen.getByRole('img').parentElement;
    expect(imageContainer).toHaveClass('aspect-video');
  });

  it('shows "Explore" button on hover', async () => {
    render(<CollectionCard1 collection={defaultCollection} showExploreButton />);
    const card = screen.getByTestId('collection-card');

    fireEvent.mouseEnter(card);

    await waitFor(() => {
      expect(screen.getByText('Explore Collection')).toBeInTheDocument();
    });
  });

  it('renders with price range', () => {
    const collectionWithPrices = mockCollection({
      minPrice: 29.99,
      maxPrice: 199.99,
    });

    render(<CollectionCard1 collection={collectionWithPrices} showPriceRange />);

    expect(screen.getByText('$29.99 - $199.99')).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    render(<CollectionCard1 collection={defaultCollection} onClick={mockOnClick} />);
    const card = screen.getByTestId('collection-card');

    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('tabindex', '0');
    expect(card).toHaveAttribute('aria-label', `View ${defaultCollection.name} collection`);
  });

  it('renders with custom colors', () => {
    render(
      <CollectionCard1
        collection={defaultCollection}
        colors={{
          background: 'bg-blue-100',
          text: 'text-blue-900',
        }}
      />,
    );
    const card = screen.getByTestId('collection-card');
    expect(card).toHaveClass('bg-blue-100', 'text-blue-900');
  });

  it('supports responsive design', () => {
    render(
      <CollectionCard1
        collection={defaultCollection}
        responsive={{
          showProductCount: { base: false, md: true },
          showStats: { base: false, lg: true },
        }}
      />,
    );

    const card = screen.getByTestId('collection-card');
    expect(card).toHaveClass('responsive-collection-card');
  });

  it('renders with animation on mount', () => {
    render(<CollectionCard1 collection={defaultCollection} animate />);
    const card = screen.getByTestId('collection-card');

    expect(card).toHaveClass('animate-fade-in');
  });

  it('renders with discount badge', () => {
    const saleCollection = mockCollection({
      onSale: true,
      discount: 20,
    });

    render(<CollectionCard1 collection={saleCollection} />);
    expect(screen.getByText('20% OFF')).toBeInTheDocument();
  });
});
