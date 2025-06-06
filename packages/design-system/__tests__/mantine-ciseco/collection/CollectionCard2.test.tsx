import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import CollectionCard2 from '../../../mantine-ciseco/components/CollectionCard2';
import { mockCollection } from '../test-utils';

describe('CollectionCard2', () => {
  const defaultCollection = mockCollection();
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders collection card with variant 2 styling', () => {
    render(<CollectionCard2 collection={defaultCollection} />);

    expect(screen.getByText(defaultCollection.name)).toBeInTheDocument();
    expect(screen.getByTestId('collection-card-2')).toHaveClass('variant-2');
  });

  it('renders with horizontal layout', () => {
    render(<CollectionCard2 collection={defaultCollection} />);
    const card = screen.getByTestId('collection-card-2');
    expect(card).toHaveClass('flex-row', 'horizontal-layout');
  });

  it('shows collection image on the side', () => {
    render(<CollectionCard2 collection={defaultCollection} />);
    const image = screen.getByRole('img');
    const imageContainer = image.parentElement;

    expect(image).toHaveAttribute('src', defaultCollection.image);
    expect(imageContainer).toHaveClass('flex-shrink-0');
  });

  it('displays content in main area', () => {
    render(<CollectionCard2 collection={defaultCollection} />);

    const contentArea = screen.getByTestId('collection-content');
    expect(contentArea).toHaveClass('flex-1');
    expect(contentArea).toContainElement(screen.getByText(defaultCollection.name));
  });

  it('handles click events', () => {
    render(<CollectionCard2 collection={defaultCollection} onClick={mockOnClick} />);
    const card = screen.getByTestId('collection-card-2');

    fireEvent.click(card);
    expect(mockOnClick).toHaveBeenCalledWith(defaultCollection);
  });

  it('shows explore button in content area', () => {
    render(<CollectionCard2 collection={defaultCollection} showExploreButton />);
    expect(screen.getByText('Explore Collection')).toBeInTheDocument();
  });

  it('renders with different image positions', () => {
    const { rerender } = render(
      <CollectionCard2 collection={defaultCollection} imagePosition="left" />,
    );
    expect(screen.getByTestId('collection-card-2')).toHaveClass('image-left');

    rerender(<CollectionCard2 collection={defaultCollection} imagePosition="right" />);
    expect(screen.getByTestId('collection-card-2')).toHaveClass('image-right');
  });

  it('supports compact mode', () => {
    render(<CollectionCard2 collection={defaultCollection} compact />);
    const card = screen.getByTestId('collection-card-2');
    expect(card).toHaveClass('compact-mode');
  });
});
