import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import { ProgressiveImage } from '../../../mantine-ciseco/components/ProgressiveImage';

describe('ProgressiveImage', () => {
  const defaultProps = {
    src: '/high-res-image.jpg',
    alt: 'Test Image',
    width: 400,
    height: 300,
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

  it('renders container with proper structure', () => {
    render(<ProgressiveImage {...defaultProps} />);
    const container = screen.getByTestId('progressive-image-container');
    expect(container).toBeInTheDocument();
  });

  it('shows placeholder when provided', () => {
    render(
      <ProgressiveImage
        {...defaultProps}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,test"
      />,
    );
    const placeholder = screen.getByTestId('placeholder');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveStyle({ filter: 'blur(20px)' });
  });

  it('loads image when in viewport', async () => {
    render(<ProgressiveImage {...defaultProps} />);

    // Wait for intersection observer to trigger
    await waitFor(
      () => {
        const img = screen.getByRole('img');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('alt', 'Test Image');
      },
      { timeout: 200 },
    );
  });

  it('handles responsive src object', () => {
    const responsiveSrc = {
      small: '/image-small.jpg',
      medium: '/image-medium.jpg',
      large: '/image-large.jpg',
    };

    render(<ProgressiveImage {...defaultProps} src={responsiveSrc} />);

    // Component should exist even if image isn't loaded yet
    const container = screen.getByTestId('progressive-image-container');
    expect(container).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ProgressiveImage {...defaultProps} className="custom-class" />);
    const container = screen.getByTestId('progressive-image-container');
    expect(container).toHaveClass('custom-class');
  });

  it('renders with blurDataURL', () => {
    const blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...';
    render(<ProgressiveImage {...defaultProps} blurDataURL={blurDataURL} />);

    const placeholder = screen.getByTestId('placeholder');
    expect(placeholder).toHaveStyle({ backgroundImage: `url(${blurDataURL})` });
  });

  it('handles image load error', async () => {
    render(<ProgressiveImage {...defaultProps} />);

    await waitFor(() => {
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
    });

    const img = screen.getByRole('img');
    fireEvent.error(img);

    // After error, image should not be displayed
    await waitFor(() => {
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  it('transitions opacity on load', async () => {
    render(<ProgressiveImage {...defaultProps} />);

    await waitFor(() => {
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
    });

    const img = screen.getByRole('img');
    expect(img).toHaveClass('opacity-0');

    fireEvent.load(img);

    await waitFor(() => {
      expect(img).toHaveClass('opacity-100');
    });
  });

  it('hides placeholder after image loads', async () => {
    render(
      <ProgressiveImage
        {...defaultProps}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,test"
      />,
    );

    expect(screen.getByTestId('placeholder')).toBeInTheDocument();

    await waitFor(() => {
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
    });

    const img = screen.getByRole('img');
    fireEvent.load(img);

    await waitFor(() => {
      expect(screen.queryByTestId('placeholder')).not.toBeInTheDocument();
    });
  });

  it('renders with custom dimensions', () => {
    render(<ProgressiveImage {...defaultProps} width={600} height={400} />);

    const container = screen.getByTestId('progressive-image-container');
    expect(container).toBeInTheDocument();
  });

  it('supports fill prop', async () => {
    render(<ProgressiveImage {...defaultProps} fill />);

    await waitFor(() => {
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveClass('object-cover');
    });
  });

  it('uses rootMargin for intersection observer', () => {
    const observeMock = vi.fn();
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: observeMock,
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    render(<ProgressiveImage {...defaultProps} rootMargin="100px" />);

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ rootMargin: '100px' }),
    );
  });

  it('uses threshold for intersection observer', () => {
    const observeMock = vi.fn();
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: observeMock,
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    render(<ProgressiveImage {...defaultProps} threshold={0.5} />);

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ threshold: 0.5 }),
    );
  });
});
