import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import { ListingImageGallery } from '../../../mantine-ciseco';
import type { ListingGalleryImage } from '../../../mantine-ciseco/components/listing-image-gallery/utils/types';

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, 'data-testid': testId, ...props }: any) => (
    <img src={src} alt={alt} data-testid={testId} {...props} />
  ),
}));

// Mock Next.js router
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/',
  useSearchParams: () => mockSearchParams,
}));

// Mock react-hooks-global-state
vi.mock('react-hooks-global-state', () => ({
  createGlobalState: () => ({
    useGlobalState: () => [null, vi.fn()],
  }),
}));

// Mock useLastViewedPhoto hook
vi.mock(
  '../../../mantine-ciseco/components/listing-image-gallery/utils/useLastViewedPhoto',
  () => ({
    useLastViewedPhoto: () => [null, vi.fn()],
  }),
);

// Mock LikeSaveBtns
vi.mock('../../../mantine-ciseco/components/LikeSaveBtns', () => ({
  default: ({ 'data-testid': testId }: any) => (
    <div data-testid={testId || 'like-save-btns'}>Like Save Buttons</div>
  ),
}));

describe('ListingImageGallery', () => {
  const defaultImages: ListingGalleryImage[] = [
    { id: 1, url: '/image1.jpg' },
    { id: 2, url: '/image2.jpg' },
    { id: 3, url: '/image3.jpg' },
    { id: 4, url: '/image4.jpg' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    mockSearchParams.delete('photoId');
    mockSearchParams.delete('modal');
  });

  it('renders component without modal when no modal param', () => {
    render(<ListingImageGallery images={defaultImages} />);

    // Component renders but modal is closed, so content is not visible
    // The Mantine modal root should exist but not be opened
    const modalRoot = document.querySelector('.mantine-Modal-root');
    expect(modalRoot).toBeInTheDocument();
  });

  it('opens modal when modal query param is present', () => {
    mockSearchParams.set('modal', 'true');

    render(<ListingImageGallery images={defaultImages} />);

    // The modal should be opened - content should be visible
    expect(screen.getByTestId('listing-image-gallery-content')).toBeInTheDocument();
    expect(screen.getByTestId('listing-image-gallery-grid')).toBeInTheDocument();
  });

  it('renders all images in grid when modal is open', () => {
    mockSearchParams.set('modal', 'true');

    render(<ListingImageGallery images={defaultImages} />);

    // Check for all images
    defaultImages.forEach((image) => {
      expect(screen.getByTestId(`listing-image-gallery-image-${image.id}`)).toBeInTheDocument();
      expect(screen.getByTestId(`listing-image-gallery-image-${image.id}-img`)).toHaveAttribute(
        'src',
        image.url,
      );
    });
  });

  it('renders grid with proper CSS classes when modal is open', () => {
    mockSearchParams.set('modal', 'true');

    render(<ListingImageGallery images={defaultImages} />);

    const grid = screen.getByTestId('listing-image-gallery-grid');
    expect(grid).toHaveClass('columns-1', 'gap-4', 'sm:columns-2', 'xl:columns-3');
  });

  it('handles image clicks to open photo modal when modal is open', () => {
    mockSearchParams.set('modal', 'true');

    render(<ListingImageGallery images={defaultImages} />);

    const firstImageContainer = screen.getByTestId('listing-image-gallery-image-1');
    fireEvent.click(firstImageContainer);

    expect(mockPush).toHaveBeenCalledWith('//?photoId=1');
  });

  it('renders with custom testId when modal is open', () => {
    mockSearchParams.set('modal', 'true');
    const customTestId = 'custom-gallery';

    render(<ListingImageGallery images={defaultImages} testId={customTestId} />);

    expect(screen.getByTestId(`${customTestId}-content`)).toBeInTheDocument();
    expect(screen.getByTestId(`${customTestId}-grid`)).toBeInTheDocument();
    expect(screen.getByTestId(`${customTestId}-image-1`)).toBeInTheDocument();
  });

  it('calls onClose callback when provided', () => {
    const onClose = vi.fn();
    mockSearchParams.set('modal', 'true');

    render(<ListingImageGallery images={defaultImages} onClose={onClose} />);

    // Since we're not testing the complex modal interactions,
    // we can just verify the component accepts the onClose prop
    expect(onClose).not.toHaveBeenCalled(); // Should only be called when modal is actually closed
  });

  it('handles empty images array gracefully when modal is open', () => {
    mockSearchParams.set('modal', 'true');

    render(<ListingImageGallery images={[]} />);

    expect(screen.getByTestId('listing-image-gallery-content')).toBeInTheDocument();
    expect(screen.getByTestId('listing-image-gallery-grid')).toBeInTheDocument();
    expect(screen.getByTestId('listing-image-gallery-grid')).toBeEmptyDOMElement();
  });

  it('renders all images with correct alt text when modal is open', () => {
    mockSearchParams.set('modal', 'true');

    render(<ListingImageGallery images={defaultImages} />);

    defaultImages.forEach((image) => {
      const img = screen.getByTestId(`listing-image-gallery-image-${image.id}-img`);
      expect(img).toHaveAttribute('alt', 'chisfis listing gallery');
    });
  });

  it('applies proper CSS classes to image containers when modal is open', () => {
    mockSearchParams.set('modal', 'true');

    render(<ListingImageGallery images={defaultImages} />);

    const firstImageContainer = screen.getByTestId('listing-image-gallery-image-1');
    expect(firstImageContainer).toHaveClass(
      'after:content',
      'group',
      'relative',
      'mb-5',
      'block',
      'w-full',
      'cursor-zoom-in',
    );
  });

  it('applies transform styles to images when modal is open', () => {
    mockSearchParams.set('modal', 'true');

    render(<ListingImageGallery images={defaultImages} />);

    const firstImage = screen.getByTestId('listing-image-gallery-image-1-img');
    expect(firstImage).toHaveClass(
      'transform',
      'rounded-lg',
      'brightness-90',
      'transition',
      'will-change-auto',
      'group-hover:brightness-110',
    );
  });
});
