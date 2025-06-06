import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import { ProgressiveImage } from '../../../mantine-ciseco/components/ProgressiveImage';

describe('ProgressiveImage', () => {
  const defaultProps = {
    src: '/high-res-image.jpg',
    alt: 'Test Image',
  };

  beforeEach(() => {
    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn().mockImplementation((target) => {
        // Simulate image entering viewport
        setTimeout(() => {
          callback([{ isIntersecting: true, target }]);
        }, 100);
      }),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  it('renders placeholder when not visible', () => {
    render(<ProgressiveImage {...defaultProps} placeholder="/placeholder.jpg" />);
    const placeholder = screen.getByTestId('placeholder');
    expect(placeholder).toBeInTheDocument();
  });

  it('loads image when in viewport', async () => {
    render(<ProgressiveImage {...defaultProps} />);

    await waitFor(() => {
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', defaultProps.src);
    });
  });

  it('renders with alt text', () => {
    render(<ProgressiveImage {...defaultProps} />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', defaultProps.alt);
  });

  it('handles image load error', () => {
    render(<ProgressiveImage {...defaultProps} />);
    const image = screen.getByRole('img');
    fireEvent.error(image);
    expect(screen.getByText('Failed to load image')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<ProgressiveImage {...defaultProps} className="custom-image" />);
    const container = screen.getByRole('img').parentElement;
    expect(container).toHaveClass('custom-image');
  });

  it('handles responsive image sources', () => {
    const responsiveSrc = {
      small: '/small.jpg',
      medium: '/medium.jpg',
      large: '/large.jpg',
    };
    render(<ProgressiveImage {...defaultProps} src={responsiveSrc} />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', responsiveSrc.large);
  });
});
