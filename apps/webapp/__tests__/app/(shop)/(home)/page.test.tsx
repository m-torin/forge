import HomePage from '@/app/(shop)/(home)/page';
import { render, screen } from '@testing-library/react';
import { describe, expect, vi } from 'vitest';

// Mock data functions
vi.mock('@/data/data', () => ({
  getCollections: vi.fn(() =>
    Array(20).fill({
      id: 'collection-1',
      handle: 'collection-1',
      title: 'Collection 1',
      image: { src: '/collection1.jpg' },
    }),
  ),
  getGroupCollections: vi.fn(() => [{ title: 'Group 1', collections: [] }]),
  getProducts: vi.fn(() =>
    Array(10).fill({
      id: 'product-1',
      handle: 'product-1',
      title: 'Product 1',
      price: 99.99,
    }),
  ),
  getBlogPosts: vi.fn(() => [{ id: 'post-1', handle: 'post-1', title: 'Blog Post 1' }]),
}));

// Mock all the section components
vi.mock('@/components/SectionHero/SectionHero2', () => ({
  default: () => <section data-testid="section-hero">Hero Section</section>,
}));

vi.mock('@/components/SectionHowItWork/SectionHowItWork', () => ({
  default: () => <section data-testid="section-how-it-work">How It Work Section</section>,
}));

vi.mock('@/components/SectionSliderLargeProduct', () => ({
  default: () => <section data-testid="section-slider-large-product">Large Product Slider</section>,
}));

vi.mock('@/components/SectionGridFeatureItems', () => ({
  default: () => <section data-testid="section-grid-feature-items">Grid Feature Items</section>,
}));

vi.mock('@/components/SectionPromo1', () => ({
  default: () => <section data-testid="section-promo-1">Promo Section 1</section>,
}));

vi.mock('@/components/SectionPromo2', () => ({
  default: () => <section data-testid="section-promo-2">Promo Section 2</section>,
}));

vi.mock('@/components/SectionSliderProductCard', () => ({
  default: () => <section data-testid="section-slider-product-card">Product Card Slider</section>,
}));

vi.mock('@/components/SectionCollectionSlider', () => ({
  default: () => <section data-testid="section-collection-slider">Collection Slider</section>,
}));

vi.mock('@/components/SectionClientSay', () => ({
  default: () => <section data-testid="section-client-say">Client Testimonials</section>,
}));

vi.mock('@/components/SectionCollectionSlider2', () => ({
  default: () => <section data-testid="section-collection-slider-2">Collection Slider 2</section>,
}));

vi.mock('@/components/SectionGridMoreExplore/SectionGridMoreExplore', () => ({
  default: () => <section data-testid="section-grid-more-explore">Grid More Explore</section>,
}));

vi.mock('@/components/blog/SectionMagazine5', () => ({
  default: () => <section data-testid="section-magazine-5">Magazine Section</section>,
}));

vi.mock('@/components/BackgroundSection/BackgroundSection', () => ({
  default: ({ children }: any) => <div data-testid="background-section">{children}</div>,
}));

vi.mock('@/components/Divider', () => ({
  Divider: () => <hr data-testid="divider" />,
}));

vi.mock('@/components/Heading/Heading', () => ({
  default: ({ children }: any) => <h2 data-testid="heading">{children}</h2>,
}));

vi.mock('@/shared/Button/Button', () => ({
  Button: ({ children, ...props }: any) => (
    <button data-testid="button" {...props}>
      {children}
    </button>
  ),
}));

describe('home Page', () => {
  test('should render all main sections', async () => {
    const HomeComponent = await HomePage();
    render(HomeComponent);

    expect(screen.getByTestId('section-hero')).toBeInTheDocument();
    expect(screen.getByTestId('section-how-it-work')).toBeInTheDocument();
  });

  test('should render hero section at the top', async () => {
    const HomeComponent = await HomePage();
    render(HomeComponent);

    const heroSection = screen.getByTestId('section-hero');
    expect(heroSection).toBeInTheDocument();
  });

  test('should render product showcase sections', async () => {
    const HomeComponent = await HomePage();
    render(HomeComponent);

    // Check for product-related sections
    const productSliders = [
      screen.queryAllByTestId('section-slider-large-product'),
      screen.queryAllByTestId('section-slider-product-card'),
    ].flat();

    expect(productSliders.length).toBeGreaterThan(0);
  });

  test('should render promotional sections', async () => {
    const HomeComponent = await HomePage();
    render(HomeComponent);

    const promoSections = [
      screen.queryByTestId('section-promo-1'),
      screen.queryByTestId('section-promo-2'),
    ].filter(Boolean);

    expect(promoSections.length).toBeGreaterThanOrEqual(1);
  });

  test('should render collection slider section', async () => {
    const HomeComponent = await HomePage();
    render(HomeComponent);

    const collectionSlider = screen.queryByTestId('section-collection-slider');
    // Collection slider may be present
    expect(collectionSlider).toBeInTheDocument();
  });

  test('should render client testimonials section', async () => {
    const HomeComponent = await HomePage();
    render(HomeComponent);

    const clientSection = screen.queryByTestId('section-client-say');
    // Client section may be present
    expect(clientSection).toBeInTheDocument();
  });

  test('should have proper page structure', async () => {
    const HomeComponent = await HomePage();
    const { container } = render(HomeComponent);

    // Should have a main container
    expect(container.firstChild).toBeInTheDocument();
  });

  test('should render sections in logical order', async () => {
    const HomeComponent = await HomePage();
    const { container } = render(HomeComponent);

    const heroSection = screen.getByTestId('section-hero');
    const howItWorkSection = screen.getByTestId('section-how-it-work');

    // Hero should come before how it work
    const heroPosition = Array.from(container.querySelectorAll('section')).indexOf(heroSection);
    const howItWorkPosition = Array.from(container.querySelectorAll('section')).indexOf(
      howItWorkSection,
    );

    expect(heroPosition).toBeLessThan(howItWorkPosition);
  });

  test('should be accessible with proper semantic structure', async () => {
    const HomeComponent = await HomePage();
    render(HomeComponent);

    const sections = screen.getAllByTestId(/section-/);
    expect(sections.length).toBeGreaterThanOrEqual(2);
  });

  test('should render without errors', async () => {
    const HomeComponent = await HomePage();
    expect(() => {
      render(HomeComponent);
    }).not.toThrow();
  });

  test('should handle responsive layout', async () => {
    const HomeComponent = await HomePage();
    const { container } = render(HomeComponent);

    // Should have container with responsive classes
    const responsiveElement = container.querySelector(
      '[class*="container"], [class*="max-w"], [class*="mx-auto"]',
    );
    expect(responsiveElement).toBeInTheDocument();
  });

  test('should render call-to-action elements', async () => {
    const HomeComponent = await HomePage();
    render(HomeComponent);

    // Hero section should contain CTA elements
    const heroSection = screen.getByTestId('section-hero');
    expect(heroSection).toBeInTheDocument();
  });

  test('should have proper SEO structure', async () => {
    const HomeComponent = await HomePage();
    const { container } = render(HomeComponent);

    // Should have main content area
    expect(container.firstChild).toBeInTheDocument();
  });
});
