import { render, screen, waitFor } from '@testing-library/react';
import { SignedImage } from '../SignedImage';
import { getMediaUrlAction } from '@repo/storage/server/next';

// Mock the storage action
jest.mock('@repo/storage/server/next', () => ({
  getMediaUrlAction: jest.fn(),
}));

describe('signedImage', () => {
  const mockGetMediaUrlAction = getMediaUrlAction as jest.MockedFunction<typeof getMediaUrlAction>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should display signed URL when successful', async () => {
    const signedUrl = 'https://example.com/image.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256';
    mockGetMediaUrlAction.mockResolvedValue({
      success: true,
      data: signedUrl,
    });

    render(<SignedImage storageKey="test/image.jpg" alt="Test image" data-testid="signed-image" />);

    // Should show skeleton initially
    expect(screen.getByTestId('signed-image-skeleton')).toBeInTheDocument();

    // Wait for image to load
    await waitFor(() => {
      const img = screen.getByAltText('Test image');
      expect(img).toHaveAttribute('src', signedUrl);
    });

    // Verify the action was called with correct params
    expect(mockGetMediaUrlAction).toHaveBeenCalledWith('test/image.jpg', {
      context: 'product',
      enabled: true,
    });
  });

  test('should use fallback URL when signing fails', async () => {
    mockGetMediaUrlAction.mockResolvedValue({
      success: false,
      error: 'Failed to sign URL',
    });

    render(
      <SignedImage storageKey="test/image.jpg" fallbackUrl="/placeholder.jpg" alt="Test image" />,
    );

    await waitFor(() => {
      const img = screen.getByAltText('Test image');
      expect(img).toHaveAttribute('src', '/placeholder.jpg');
    });
  });

  test('should show error placeholder when no URL available', async () => {
    mockGetMediaUrlAction.mockResolvedValue({
      success: false,
      error: 'Not found',
    });

    render(<SignedImage storageKey="test/image.jpg" alt="Test image" data-testid="signed-image" />);

    await waitFor(() => {
      expect(screen.getByTestId('signed-image-error')).toBeInTheDocument();
    });
  });

  test('should refresh URL before expiration', async () => {
    const initialUrl = 'https://example.com/image.jpg?expires=1000';
    const refreshedUrl = 'https://example.com/image.jpg?expires=2000';

    mockGetMediaUrlAction
      .mockResolvedValueOnce({ success: true, data: initialUrl })
      .mockResolvedValueOnce({ success: true, data: refreshedUrl });

    jest.useFakeTimers();

    render(
      <SignedImage
        storageKey="test/image.jpg"
        alt="Test image"
        refreshInterval={1000} // 1 second for testing
      />,
    );

    // Initial load
    await waitFor(() => {
      expect(screen.getByAltText('Test image')).toHaveAttribute('src', initialUrl);
    });

    // Fast forward to trigger refresh
    jest.advanceTimersByTime(1100);

    await waitFor(() => {
      expect(screen.getByAltText('Test image')).toHaveAttribute('src', refreshedUrl);
    });

    expect(mockGetMediaUrlAction).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });

  test('should handle different contexts', async () => {
    mockGetMediaUrlAction.mockResolvedValue({
      success: true,
      data: 'https://example.com/admin-image.jpg',
    });

    render(<SignedImage storageKey="test/image.jpg" context="admin" alt="Admin image" />);

    await waitFor(() => {
      expect(mockGetMediaUrlAction).toHaveBeenCalledWith('test/image.jpg', {
        context: 'admin',
        enabled: true,
      });
    });
  });
});
