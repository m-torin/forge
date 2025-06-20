import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '../test-utils';
import CollectionCard2 from '../../../src/mantine-ciseco/components/CollectionCard2';
import { mockCollection } from '../test-utils';

// Mock next/image
vi.mock('next/image', (_: any) => ({
  default: ({ src, alt, 'data-testid': testId, ...props }: any) => (
    <img src={src} alt={alt} data-testid={testId} {...props} />
  ),
}));

// Mock useLocalizeHref hook
vi.mock('../../../src/mantine-ciseco/hooks/useLocale', (_: any) => ({
  useLocalizeHref: () => (href: string) => `/en${href}`,
}));

describe('CollectionCard2', (_: any) => {
  const defaultCollection = mockCollection({
    title: 'Test Collection',
    handle: 'test-collection',
    sortDescription: 'Test collection description',
    image: { src: '/test-collection.jpg', alt: 'Test Collection' },
    color: 'bg-indigo-50',
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders collection card with basic information', (_: any) => {
    render(<CollectionCard2 collection={defaultCollection} />);

    expect(screen.getByTestId('collection-card-2')).toBeInTheDocument();
    expect(screen.getByText(defaultCollection.title)).toBeInTheDocument();
  });

  it('renders as a link to the collection', (_: any) => {
    render(<CollectionCard2 collection={defaultCollection} />);

    const card = screen.getByTestId('collection-card-2');
    expect(card).toHaveAttribute('href', `/en/collections/${defaultCollection.handle}`);
  });

  it('displays collection image when provided', (_: any) => {
    render(<CollectionCard2 collection={defaultCollection} />);

    const image = screen.getByTestId('collection-card-2-image');
    expect(image).toHaveAttribute('src', defaultCollection.image.src);
    expect(image).toHaveAttribute('alt', defaultCollection.image.alt);
  });

  it('displays collection title', (_: any) => {
    render(<CollectionCard2 collection={defaultCollection} />);

    const title = screen.getByTestId('collection-card-2-title');
    expect(title).toHaveTextContent(defaultCollection.title);
  });

  it('displays collection description using dangerouslySetInnerHTML', (_: any) => {
    render(<CollectionCard2 collection={defaultCollection} />);

    const description = screen.getByTestId('collection-card-2-description');
    expect(description).toBeInTheDocument();
  });

  it('applies the collection color class', (_: any) => {
    render(<CollectionCard2 collection={defaultCollection} />);

    const imageContainer = screen.getByTestId('collection-card-2-image-container');
    expect(imageContainer).toHaveClass(defaultCollection.color);
  });

  it('renders with custom className', (_: any) => {
    const customClass = 'custom-collection-card';
    render(<CollectionCard2 collection={defaultCollection} className={customClass} />);

    const card = screen.getByTestId('collection-card-2');
    expect(card).toHaveClass(customClass);
  });

  it('renders with custom ratioClass', (_: any) => {
    const customRatio = 'aspect-video';
    render(<CollectionCard2 collection={defaultCollection} ratioClass={customRatio} />);

    const imageContainer = screen.getByTestId('collection-card-2-image-container');
    expect(imageContainer).toHaveClass(customRatio);
  });

  it('renders with default aspect-square ratio', (_: any) => {
    render(<CollectionCard2 collection={defaultCollection} />);

    const imageContainer = screen.getByTestId('collection-card-2-image-container');
    expect(imageContainer).toHaveClass('aspect-square');
  });

  it('renders with custom testId', (_: any) => {
    const customTestId = 'custom-collection-card';
    render(<CollectionCard2 collection={defaultCollection} testId={customTestId} />);

    expect(screen.getByTestId(customTestId)).toBeInTheDocument();
    expect(screen.getByTestId(`${customTestId}-title`)).toBeInTheDocument();
    expect(screen.getByTestId(`${customTestId}-image`)).toBeInTheDocument();
  });

  it('returns null when collection has no handle', (_: any) => {
    const collectionWithoutHandle = mockCollection({
      ...defaultCollection,
      handle: '',
    });

    render(<CollectionCard2 collection={collectionWithoutHandle} />);
    expect(screen.queryByTestId('collection-card-2')).not.toBeInTheDocument();
  });

  it('handles collections without images gracefully', (_: any) => {
    const collectionWithoutImage = mockCollection({
      ...defaultCollection,
      image: null,
    });

    render(<CollectionCard2 collection={collectionWithoutImage} />);

    expect(screen.getByTestId('collection-card-2')).toBeInTheDocument();
    expect(screen.queryByTestId('collection-card-2-image')).not.toBeInTheDocument();
  });
});
