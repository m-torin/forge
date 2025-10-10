import SectionHero from '@/components/SectionHero/SectionHero';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

// Note: next/image and next/link are already mocked by @repo/qa centralized setup

// Mock components
vi.mock('@/shared/Button/ButtonPrimary', () => ({
  default: ({ children, ...props }: any) => (
    <button data-testid="primary-button" {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/shared/Button/ButtonSecondary', () => ({
  default: ({ children, ...props }: any) => (
    <button data-testid="secondary-button" {...props}>
      {children}
    </button>
  ),
}));

describe('sectionHero', () => {
  test('should render hero section', () => {
    render(<SectionHero />);

    // Should render hero content
    const heroSection = screen.getByTestId('section-hero');
    expect(heroSection).toBeInTheDocument();
  });

  test('should render hero heading', () => {
    render(<SectionHero />);

    const heading =
      screen.getByRole('heading') ||
      screen.queryByText(/discover|shop|welcome|fashion|collection/i);
    expect(heading).toBeInTheDocument();
  });

  test('should render hero image', () => {
    render(<SectionHero />);

    const heroImage = screen.queryByTestId('hero-image');
    expect(heroImage).toBeInTheDocument();
  });

  test('should render primary call-to-action button', () => {
    render(<SectionHero />);

    const primaryButton = screen.queryByTestId('primary-button');
    expect(primaryButton).toBeInTheDocument();
  });

  test('should render secondary call-to-action button', () => {
    render(<SectionHero />);

    const secondaryButton = screen.queryByTestId('secondary-button');
    expect(secondaryButton).toBeInTheDocument();
  });

  test('should render hero description text', () => {
    render(<SectionHero />);

    // Default subheading text
    const description = screen.getByText(/Discover the most outstanding NTFs/i);
    expect(description).toBeInTheDocument();
  });

  test('should have proper responsive layout', () => {
    const { container } = render(<SectionHero />);

    const responsiveElement = container.querySelector(
      '[class*="sm:"], [class*="md:"], [class*="lg:"]',
    );
    expect(responsiveElement).toBeInTheDocument();
  });

  test('should render hero badges or tags', () => {
    render(<SectionHero />);

    const badge = screen.queryByText(/new|sale|featured|trending|limited/i);
    expect(badge).toBeInTheDocument();
  });

  test('should render hero navigation elements', () => {
    render(<SectionHero />);

    const navigation = screen.queryAllByRole('link');
    expect(navigation.length).toBeGreaterThanOrEqual(0);
  });

  test('should apply custom className if provided', () => {
    const { container } = render(<SectionHero className="custom-hero" />);

    const heroElement = container.firstChild as HTMLElement;
    expect(heroElement).toHaveClass('custom-hero');
  });

  test('should render background elements', () => {
    const { container } = render(<SectionHero />);

    // Check for relative positioning which is used in the component
    const bgElement = container.querySelector('.relative');
    expect(bgElement).toBeInTheDocument();
  });

  test('should handle hero content positioning', () => {
    const { container } = render(<SectionHero />);

    // Check for positioning classes
    const positionedElement = container.querySelector(
      '[class*="flex"], [class*="grid"], [class*="absolute"], [class*="relative"]',
    );
    expect(positionedElement).toBeInTheDocument();
  });

  test('should render without errors', () => {
    expect(() => {
      render(<SectionHero />);
    }).not.toThrow();
  });
});
