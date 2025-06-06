import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import { SectionHero } from '../../../mantine-ciseco';

describe('SectionHero', () => {
  const defaultProps = {
    heading: 'Welcome to Our Store',
    subheading: 'Discover amazing products',
    backgroundImage: '/hero-bg.jpg',
  };

  it('renders hero section with heading and subheading', () => {
    render(<SectionHero {...defaultProps} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(defaultProps.heading);
    expect(screen.getByText(defaultProps.subheading)).toBeInTheDocument();
  });

  it('renders with background image', () => {
    render(<SectionHero {...defaultProps} />);
    const heroSection = screen.getByTestId('hero-section');

    expect(heroSection).toHaveStyle({
      backgroundImage: `url(${defaultProps.backgroundImage})`,
    });
  });

  it('renders call-to-action buttons', () => {
    const ctaButtons = [
      { text: 'Shop Now', href: '/shop', variant: 'primary' },
      { text: 'Learn More', href: '/about', variant: 'secondary' },
    ];

    render(<SectionHero {...defaultProps} ctaButtons={ctaButtons} />);

    expect(screen.getByRole('link', { name: 'Shop Now' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Learn More' })).toBeInTheDocument();
  });

  it('handles CTA button clicks', () => {
    const mockOnCta = vi.fn();
    const ctaButtons = [{ text: 'Shop Now', onClick: mockOnCta, variant: 'primary' }];

    render(<SectionHero {...defaultProps} ctaButtons={ctaButtons} />);

    const ctaButton = screen.getByRole('button', { name: 'Shop Now' });
    fireEvent.click(ctaButton);

    expect(mockOnCta).toHaveBeenCalled();
  });

  it('renders with video background', () => {
    render(
      <SectionHero
        {...defaultProps}
        videoBackground="/hero-video.mp4"
        videoProps={{ muted: true, autoPlay: true }}
      />,
    );

    const video = screen.getByRole('presentation'); // Video element
    expect(video).toHaveAttribute('src', '/hero-video.mp4');
    expect(video).toHaveAttribute('muted');
    expect(video).toHaveAttribute('autoplay');
  });

  it('supports full height layout', () => {
    render(<SectionHero {...defaultProps} fullHeight />);
    const heroSection = screen.getByTestId('hero-section');

    expect(heroSection).toHaveClass('min-h-screen');
  });

  it('renders with overlay', () => {
    render(<SectionHero {...defaultProps} overlay overlayOpacity={0.6} />);
    const overlay = screen.getByTestId('hero-overlay');

    expect(overlay).toHaveStyle({ opacity: '0.6' });
  });

  it('supports text alignment options', () => {
    const { rerender } = render(<SectionHero {...defaultProps} textAlign="left" />);
    expect(screen.getByTestId('hero-content')).toHaveClass('text-left');

    rerender(<SectionHero {...defaultProps} textAlign="center" />);
    expect(screen.getByTestId('hero-content')).toHaveClass('text-center');

    rerender(<SectionHero {...defaultProps} textAlign="right" />);
    expect(screen.getByTestId('hero-content')).toHaveClass('text-right');
  });

  it('renders with animated elements', () => {
    render(<SectionHero {...defaultProps} animated />);

    const heading = screen.getByRole('heading');
    const subheading = screen.getByText(defaultProps.subheading);

    expect(heading).toHaveClass('animate-fade-in-up');
    expect(subheading).toHaveClass('animate-fade-in-up');
  });

  it('handles scroll indicator', () => {
    render(<SectionHero {...defaultProps} showScrollIndicator />);

    const scrollIndicator = screen.getByTestId('scroll-indicator');
    expect(scrollIndicator).toBeInTheDocument();

    fireEvent.click(scrollIndicator);
    // Should trigger smooth scroll
  });
});
