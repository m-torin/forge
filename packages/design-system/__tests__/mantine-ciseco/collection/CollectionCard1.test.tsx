import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import CollectionCard1 from '../../../mantine-ciseco/components/CollectionCard1';
import { mockCollection } from '../test-utils';

// Mock the Link component
vi.mock('../../../mantine-ciseco/components/Link', () => ({
  Link: ({ children, className, href, ...props }: any) => (
    <a className={className} href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock the useLocalizeHref hook
vi.mock('../../../mantine-ciseco/hooks/useLocale', () => ({
  useLocalizeHref: () => (href: string) => `/en${href}`,
}));

// Mock NcImage component to avoid Next.js Image issues
vi.mock('../../../mantine-ciseco/components/shared/NcImage/NcImage', () => ({
  default: ({ alt, src, containerClassName, fill, sizes, ...props }: any) => (
    <div className={containerClassName}>
      <img alt={alt} src={typeof src === 'object' ? src.src : src} {...props} />
    </div>
  ),
}));

describe('CollectionCard1', () => {
  const defaultCollection = mockCollection();

  it('renders collection card with basic info', () => {
    render(<CollectionCard1 collection={defaultCollection} />);

    expect(screen.getByText(defaultCollection.title!)).toBeInTheDocument();
    expect(screen.getByText(defaultCollection.sortDescription!)).toBeInTheDocument();
    expect(screen.getByAltText(defaultCollection.image!.alt)).toBeInTheDocument();
  });

  it('renders collection image with correct src and alt', () => {
    render(<CollectionCard1 collection={defaultCollection} />);
    const image = screen.getByAltText(defaultCollection.image!.alt);

    expect(image).toHaveAttribute('src', defaultCollection.image!.src);
    expect(image).toHaveAttribute('alt', defaultCollection.image!.alt);
  });

  it('renders as a link with correct href', () => {
    render(<CollectionCard1 collection={defaultCollection} />);
    const link = screen.getByRole('link');

    expect(link).toHaveAttribute('href', `/en/collections/${defaultCollection.handle}`);
  });

  it('renders with custom className', () => {
    render(<CollectionCard1 collection={defaultCollection} className="custom-class" />);
    const link = screen.getByRole('link');

    expect(link).toHaveClass('custom-class');
  });

  it('renders with large size', () => {
    render(<CollectionCard1 collection={defaultCollection} size="large" />);

    const title = screen.getByText(defaultCollection.title!);
    const description = screen.getByText(defaultCollection.sortDescription!);

    expect(title).toHaveClass('text-lg');
    expect(description).toHaveClass('text-sm');
  });

  it('renders with normal size (default)', () => {
    render(<CollectionCard1 collection={defaultCollection} size="normal" />);

    const title = screen.getByText(defaultCollection.title!);
    const description = screen.getByText(defaultCollection.sortDescription!);

    expect(title).toHaveClass('text-base');
    expect(description).toHaveClass('text-xs');
  });

  it('renders title with proper styling', () => {
    render(<CollectionCard1 collection={defaultCollection} />);

    const title = screen.getByText(defaultCollection.title!);
    expect(title).toHaveClass(
      'font-semibold',
      'nc-card-title',
      'text-neutral-900',
      'dark:text-neutral-100',
    );
  });

  it('renders description with proper styling', () => {
    render(<CollectionCard1 collection={defaultCollection} />);

    const description = screen.getByText(defaultCollection.sortDescription!);
    expect(description).toHaveClass(
      'mt-[2px]',
      'block',
      'text-neutral-500',
      'dark:text-neutral-400',
    );
  });

  it('returns null when collection has no handle', () => {
    const collectionWithoutHandle = mockCollection({ handle: null });
    render(<CollectionCard1 collection={collectionWithoutHandle} />);

    // Should not render a link or any collection content
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByText(defaultCollection.title!)).not.toBeInTheDocument();
  });

  it('renders without image when image is not provided', () => {
    const collectionWithoutImage = mockCollection({ image: null });
    render(<CollectionCard1 collection={collectionWithoutImage} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText(collectionWithoutImage.title!)).toBeInTheDocument();
  });

  it('has proper link structure and classes', () => {
    render(<CollectionCard1 collection={defaultCollection} />);

    const link = screen.getByRole('link');
    expect(link).toHaveClass('flex', 'items-center');
  });

  it('positions image correctly based on size', () => {
    const { rerender } = render(<CollectionCard1 collection={defaultCollection} size="large" />);

    // For large size, the image container should have size-20 class
    const imageContainer = screen.getByAltText(defaultCollection.image!.alt).parentElement;
    expect(imageContainer).toHaveClass('size-20');

    rerender(<CollectionCard1 collection={defaultCollection} size="normal" />);

    // For normal size, the image container should have size-12 class
    const imageContainerNormal = screen.getByAltText(defaultCollection.image!.alt).parentElement;
    expect(imageContainerNormal).toHaveClass('size-12');
  });
});
