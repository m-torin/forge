import { describe, it, expect, vi } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  checkAccessibility,
  waitForAnimation,
} from '../test-utils';
import { ListingImageGallery } from '../../../mantine-ciseco';
import type { ListingGalleryImage } from '../../../mantine-ciseco/components/listing-image-gallery/utils/types';

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

describe('ListingImageGallery', () => {
  const defaultImages: ListingGalleryImage[] = [
    { id: 1, url: '/image1.jpg' },
    { id: 2, url: '/image2.jpg' },
    { id: 3, url: '/image3.jpg' },
    { id: 4, url: '/image4.jpg' },
  ];

  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParams.delete('photoId');
    mockSearchParams.delete('modal');
  });

  it('renders image gallery with images in a grid', () => {
    const { container } = render(<ListingImageGallery images={defaultImages} />);

    const images = screen.getAllByRole('img', { name: 'chisfis listing gallery' });
    expect(images).toHaveLength(defaultImages.length);

    images.forEach((img, index) => {
      expect(img).toHaveAttribute('src', defaultImages[index].url);
    });

    // Check accessibility
    checkAccessibility(container);
  });

  it('opens modal when image is clicked', async () => {
    const { container } = render(<ListingImageGallery images={defaultImages} />);

    const firstImage = screen.getAllByRole('img', { name: 'chisfis listing gallery' })[0];
    fireEvent.click(firstImage);

    expect(mockPush).toHaveBeenCalledWith('/?photoId=1');

    // Check accessibility
    checkAccessibility(container);
  });

  it('navigates through images in modal using arrow keys', async () => {
    // Mock search params to show modal with first image
    mockSearchParams.set('photoId', '1');
    mockSearchParams.set('modal', 'true');

    const { container } = render(<ListingImageGallery images={defaultImages} />);

    // Navigate to next image
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(mockPush).toHaveBeenCalledWith('/?photoId=2');

    // Navigate to previous image
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(mockPush).toHaveBeenCalledWith('/?photoId=1');

    // Check accessibility
    checkAccessibility(container);
  });

  it('navigates through images in modal using swipe gestures', async () => {
    // Mock search params to show modal with first image
    mockSearchParams.set('photoId', '1');
    mockSearchParams.set('modal', 'true');

    const { container } = render(<ListingImageGallery images={defaultImages} />);

    // Swipe left to next image
    const modal = screen.getByRole('dialog');
    fireEvent.touchStart(modal, { touches: [{ clientX: 100 }] });
    fireEvent.touchEnd(modal, { changedTouches: [{ clientX: 50 }] });

    expect(mockPush).toHaveBeenCalledWith('/?photoId=2');

    // Swipe right to previous image
    fireEvent.touchStart(modal, { touches: [{ clientX: 50 }] });
    fireEvent.touchEnd(modal, { changedTouches: [{ clientX: 100 }] });

    expect(mockPush).toHaveBeenCalledWith('/?photoId=1');

    // Check accessibility
    checkAccessibility(container);
  });

  it('shows bottom navigation with thumbnails in modal', async () => {
    // Mock search params to show modal with first image
    mockSearchParams.set('photoId', '1');
    mockSearchParams.set('modal', 'true');

    const { container } = render(<ListingImageGallery images={defaultImages} />);

    // Check for thumbnails
    const thumbnails = screen.getAllByRole('img', { name: 'small photos on the bottom' });
    expect(thumbnails).toHaveLength(defaultImages.length);

    // Check accessibility
    checkAccessibility(container);
  });

  it('navigates to image when thumbnail is clicked', async () => {
    // Mock search params to show modal with first image
    mockSearchParams.set('photoId', '1');
    mockSearchParams.set('modal', 'true');

    const { container } = render(<ListingImageGallery images={defaultImages} />);

    // Click second thumbnail
    const thumbnails = screen.getAllByRole('img', { name: 'small photos on the bottom' });
    fireEvent.click(thumbnails[1]);

    expect(mockPush).toHaveBeenCalledWith('/?photoId=2');

    // Check accessibility
    checkAccessibility(container);
  });

  it('calls onClose when modal is closed', async () => {
    const onClose = vi.fn();
    // Mock search params to show modal with first image
    mockSearchParams.set('photoId', '1');
    mockSearchParams.set('modal', 'true');

    const { container } = render(<ListingImageGallery images={defaultImages} onClose={onClose} />);

    // Close modal
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/?');

    // Check accessibility
    checkAccessibility(container);
  });

  it('shows loading state for images', async () => {
    // Mock search params to show modal with first image
    mockSearchParams.set('photoId', '1');
    mockSearchParams.set('modal', 'true');

    const { container } = render(<ListingImageGallery images={defaultImages} />);

    const modalImage = screen.getByRole('img', { name: 'Chisfis listing gallery' });
    fireEvent.load(modalImage);

    // Check that navigation buttons are visible after image loads
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();

    // Check accessibility
    checkAccessibility(container);
  });

  it('shows social sharing buttons in modal', async () => {
    // Mock search params to show modal with first image
    mockSearchParams.set('photoId', '1');
    mockSearchParams.set('modal', 'true');

    const { container } = render(<ListingImageGallery images={defaultImages} />);

    // Check for social sharing buttons
    expect(screen.getByRole('link', { name: /open fullsize version/i })).toBeInTheDocument();

    // Check accessibility
    checkAccessibility(container);
  });

  it('scrolls to last viewed photo when modal is closed', async () => {
    // Mock search params to show modal with first image
    mockSearchParams.set('photoId', '1');
    mockSearchParams.set('modal', 'true');

    const { container } = render(<ListingImageGallery images={defaultImages} />);

    // Close modal
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    // Mock search params to show no modal
    mockSearchParams.delete('photoId');
    mockSearchParams.delete('modal');

    // Re-render to trigger useEffect
    render(<ListingImageGallery images={defaultImages} />);

    // Check that the last viewed photo is scrolled into view
    const lastViewedPhoto = screen.getByTestId('last-viewed-photo');
    expect(lastViewedPhoto).toBeInTheDocument();

    // Check accessibility
    checkAccessibility(container);
  });

  it('handles keyboard navigation in modal', async () => {
    // Mock search params to show modal with first image
    mockSearchParams.set('photoId', '1');
    mockSearchParams.set('modal', 'true');

    const { container } = render(<ListingImageGallery images={defaultImages} />);

    // Test tab navigation
    const closeButton = screen.getByRole('button', { name: /close/i });
    const nextButton = screen.getByRole('button', { name: /next/i });
    const prevButton = screen.getByRole('button', { name: /previous/i });
    const shareButton = screen.getByRole('link', { name: /open fullsize version/i });

    // Focus should move in correct order
    closeButton.focus();
    expect(document.activeElement).toBe(closeButton);

    fireEvent.keyDown(closeButton, { key: 'Tab' });
    expect(document.activeElement).toBe(prevButton);

    fireEvent.keyDown(prevButton, { key: 'Tab' });
    expect(document.activeElement).toBe(nextButton);

    fireEvent.keyDown(nextButton, { key: 'Tab' });
    expect(document.activeElement).toBe(shareButton);

    // Check accessibility
    checkAccessibility(container);
  });

  it('handles touch events correctly', async () => {
    // Mock search params to show modal with first image
    mockSearchParams.set('photoId', '1');
    mockSearchParams.set('modal', 'true');

    const { container } = render(<ListingImageGallery images={defaultImages} />);

    const modal = screen.getByRole('dialog');

    // Test touch start
    fireEvent.touchStart(modal, { touches: [{ clientX: 100, clientY: 100 }] });
    expect(modal).toHaveClass('touch-active');

    // Test touch move
    fireEvent.touchMove(modal, { touches: [{ clientX: 50, clientY: 100 }] });
    expect(modal).toHaveClass('touch-moving');

    // Test touch end
    fireEvent.touchEnd(modal, { changedTouches: [{ clientX: 50, clientY: 100 }] });
    expect(modal).not.toHaveClass('touch-active');
    expect(modal).not.toHaveClass('touch-moving');

    // Check accessibility
    checkAccessibility(container);
  });

  it('handles window resize correctly', async () => {
    const { container } = render(<ListingImageGallery images={defaultImages} />);

    // Test window resize
    window.innerWidth = 768;
    fireEvent.resize(window);

    // Wait for resize handler to complete
    await waitForAnimation();

    // Check that grid layout has updated
    const grid = container.querySelector('.columns-1');
    expect(grid).toHaveClass('sm:columns-2');

    // Check accessibility
    checkAccessibility(container);
  });
});
