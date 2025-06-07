import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import { ProgressiveImage } from '../../../mantine-ciseco/components/ProgressiveImage';

// Mock @mantine/hooks
vi.mock('@mantine/hooks', () => ({
  useIntersection: () => ({
    ref: vi.fn(),
    entry: { isIntersecting: true }
  }),
  useViewportSize: () => ({
    width: 1920,
    height: 1080
  })
}));

describe('ProgressiveImage', () => {
  const defaultProps = {
    src: '/high-res-image.jpg',
    alt: 'Test Image',
    width: 800,
    height: 600,
  };

  beforeEach(() => {
    // Mock IntersectionObserver to immediately trigger
    global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn().mockImplementation((target) => {
        // Immediately simulate image entering viewport
        callback([{ isIntersecting: true, target }], this);
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

  it('loads image when in viewport', () => {
    render(<ProgressiveImage {...defaultProps} />);
    
    const image = screen.getByAltText(defaultProps.alt);
    expect(image).toHaveAttribute('src', expect.stringContaining('high-res-image.jpg'));
  });

  it('renders with alt text', () => {
    render(<ProgressiveImage {...defaultProps} />);
    const image = screen.getByAltText(defaultProps.alt);
    expect(image).toHaveAttribute('alt', defaultProps.alt);
  });

  it('handles image load error', () => {
    render(<ProgressiveImage {...defaultProps} />);
    const image = screen.getByAltText(defaultProps.alt);
    fireEvent.error(image);
    expect(screen.getByText('Failed to load image')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(<ProgressiveImage {...defaultProps} className="custom-image" />);
    // The className is applied to the wrapper div
    const wrapper = container.querySelector('.custom-image');
    expect(wrapper).toBeInTheDocument();
  });

  it('handles responsive image sources', () => {
    const responsiveSrc = {
      small: '/small.jpg',
      medium: '/medium.jpg',
      large: '/large.jpg',
    };
    render(<ProgressiveImage {...defaultProps} src={responsiveSrc} />);
    const image = screen.getByAltText(defaultProps.alt);
    expect(image).toHaveAttribute('src', expect.stringContaining('large.jpg'));
  });
});
