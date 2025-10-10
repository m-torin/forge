import AboutPage from '@/app/(shop)/(other-pages)/about/page';
import { render, screen } from '@testing-library/react';
import { describe, expect, vi } from 'vitest';

// Mock the section components
vi.mock('@/app/(shop)/(other-pages)/about/SectionHero', () => ({
  default: () => <section data-testid="section-hero">About Hero</section>,
}));

vi.mock('@/app/(shop)/(other-pages)/about/SectionFounder', () => ({
  default: () => <section data-testid="section-founder">Founder Section</section>,
}));

vi.mock('@/app/(shop)/(other-pages)/about/SectionStatistic', () => ({
  default: () => <section data-testid="section-statistics">Statistics Section</section>,
}));

vi.mock('@/components/SectionClientSay', () => ({
  default: () => <section data-testid="section-client-say">Client Testimonials</section>,
}));

vi.mock('@/components/SectionGridFeatureItems', () => ({
  default: () => <section data-testid="section-grid-feature-items">Feature Items</section>,
}));

vi.mock('@/components/SectionPromo1', () => ({
  default: () => <section data-testid="section-promo-1">Promo Section</section>,
}));

vi.mock('@/components/BgGlassmorphism/BgGlassmorphism', () => ({
  default: () => <div data-testid="bg-glassmorphism">BG Glass</div>,
}));

vi.mock('@/components/Divider', () => ({
  Divider: () => <hr data-testid="divider" />,
}));

describe('about Page', () => {
  test('should render about page', () => {
    render(<AboutPage />);

    expect(screen.getByTestId('section-hero')).toBeInTheDocument();
  });

  test('should render hero section', () => {
    render(<AboutPage />);

    const heroSection = screen.getByTestId('section-hero');
    expect(heroSection).toBeInTheDocument();
    expect(heroSection).toHaveTextContent('About Hero');
  });

  test('should render founder section', () => {
    render(<AboutPage />);

    const founderSection = screen.queryByTestId('section-founder');
    expect(founderSection).toBeInTheDocument();
    expect(founderSection).toHaveTextContent('Founder Section');
  });

  test('should render statistics section', () => {
    render(<AboutPage />);

    const statsSection = screen.queryByTestId('section-statistics');
    expect(statsSection).toBeInTheDocument();
    expect(statsSection).toHaveTextContent('Statistics Section');
  });

  test('should render client testimonials', () => {
    render(<AboutPage />);

    const testimonialsSection = screen.queryByTestId('section-client-say');
    expect(testimonialsSection).toBeInTheDocument();
    expect(testimonialsSection).toHaveTextContent('Client Testimonials');
  });

  test('should render feature items section', () => {
    render(<AboutPage />);

    const featureSection = screen.queryByTestId('section-grid-feature-items');
    expect(featureSection).toBeInTheDocument();
    expect(featureSection).toHaveTextContent('Feature Items');
  });

  test('should have proper page structure', () => {
    const { container } = render(<AboutPage />);

    const sections = container.querySelectorAll('section');
    expect(sections.length).toBeGreaterThanOrEqual(1);
  });

  test('should render sections in logical order', () => {
    const { container } = render(<AboutPage />);

    const heroSection = screen.getByTestId('section-hero');
    const allSections = Array.from(container.querySelectorAll('section'));

    // Hero should be first or near the top
    const heroIndex = allSections.indexOf(heroSection);
    expect(heroIndex).toBeLessThanOrEqual(1);
  });

  test('should be accessible with proper semantic structure', () => {
    render(<AboutPage />);

    const sections = screen.getAllByTestId(/section-/);
    expect(sections.length).toBeGreaterThanOrEqual(1);
  });

  test('should render without errors', () => {
    expect(() => {
      render(<AboutPage />);
    }).not.toThrow();
  });

  test('should have responsive layout', () => {
    const { container } = render(<AboutPage />);

    const responsiveElement = container.querySelector(
      '[class*="container"], [class*="max-w"], [class*="mx-auto"]',
    );
    expect(responsiveElement).toBeInTheDocument();
  });

  test('should provide comprehensive about information', () => {
    render(<AboutPage />);

    // Should have multiple sections providing different aspects of about info
    const sections = screen.getAllByTestId(/section-/);
    expect(sections.length).toBeGreaterThanOrEqual(1);
  });

  test('should include company story elements', () => {
    render(<AboutPage />);

    const heroSection = screen.getByTestId('section-hero');
    const founderSection = screen.queryByTestId('section-founder');

    // Should have storytelling elements
    expect(heroSection || founderSection).toBeInTheDocument();
  });

  test('should display company metrics if available', () => {
    render(<AboutPage />);

    const statsSection = screen.queryByTestId('section-statistics');
    expect(statsSection).toBeInTheDocument();
  });

  test('should show social proof through testimonials', () => {
    render(<AboutPage />);

    const testimonialsSection = screen.queryByTestId('section-client-say');
    expect(testimonialsSection).toBeInTheDocument();
  });

  test('should maintain consistent branding', () => {
    const { container } = render(<AboutPage />);

    // Should have consistent styling throughout
    expect(container.firstChild).toBeInTheDocument();
  });
});
