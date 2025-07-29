import Footer from '@/components/Footer';
import { render, screen } from '@testing-library/react';
import { describe, expect, vi } from 'vitest';

// Mock components
vi.mock('@/shared/SocialsList1/SocialsList1', () => ({
  default: ({ className }: any) => (
    <div className={className} data-testid="social-links">
      Social Links
    </div>
  ),
}));

vi.mock('@/components/Logo', () => ({
  default: ({ className, ...props }: any) => (
    <div className={className} data-testid="footer-logo" {...props}>
      Logo
    </div>
  ),
}));

describe('footer', () => {
  test('should render footer component', () => {
    const { container } = render(<Footer />);

    // Footer uses a div with nc-Footer class and border-t
    const footer = container.querySelector('.nc-Footer') || container.querySelector('.border-t');
    expect(footer).toBeInTheDocument();
  });

  test('should render logo', () => {
    render(<Footer />);

    const logo = screen.getByTestId('footer-logo');
    expect(logo).toBeInTheDocument();
  });

  test('should render social links', () => {
    render(<Footer />);

    const socialLinks = screen.getByTestId('social-links');
    expect(socialLinks).toBeInTheDocument();
  });

  test('should render footer navigation sections', () => {
    render(<Footer />);

    // Check for actual sections from widgetMenus
    expect(screen.getByText('Getting started')).toBeInTheDocument();
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Community')).toBeInTheDocument();
  });

  test('should render navigation links', () => {
    render(<Footer />);

    // Check for some navigation links
    expect(screen.getByText('Release Notes')).toBeInTheDocument();
    expect(screen.getByText('Best practices')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('Discussion Forums')).toBeInTheDocument();
  });

  test('should render all menu items', () => {
    render(<Footer />);

    // Getting started menu
    expect(screen.getByText('Upgrade Guide')).toBeInTheDocument();
    expect(screen.getByText('Browser Support')).toBeInTheDocument();
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();

    // Explore menu
    expect(screen.getByText('Prototyping')).toBeInTheDocument();
    expect(screen.getByText('Design systems')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();

    // Resources menu
    expect(screen.getByText('Developers')).toBeInTheDocument();
    expect(screen.getByText('Learn design')).toBeInTheDocument();

    // Community menu
    expect(screen.getByText('Code of Conduct')).toBeInTheDocument();
    expect(screen.getByText('Contributing')).toBeInTheDocument();
    expect(screen.getByText('API Reference')).toBeInTheDocument();
  });

  test('should have proper grid structure', () => {
    const { container } = render(<Footer />);

    // Check for grid container
    const gridContainer = container.querySelector('.grid.grid-cols-2');
    expect(gridContainer).toBeInTheDocument();

    // Check for responsive grid classes
    expect(gridContainer).toHaveClass('md:grid-cols-4', 'lg:grid-cols-5');
  });

  test('should have proper spacing', () => {
    const { container } = render(<Footer />);

    // Check for padding classes - try different selectors
    const footer =
      container.querySelector('[class*="py-20"]') || container.querySelector('[class*="pt-28"]');
    expect(footer).toBeInTheDocument();
  });

  test('should render container with proper classes', () => {
    const { container } = render(<Footer />);

    const containerDiv = container.querySelector('.container');
    expect(containerDiv).toBeInTheDocument();
    expect(containerDiv).toHaveClass('grid', 'grid-cols-2', 'gap-x-5', 'gap-y-10');
  });

  test('should render logo and social links in correct layout', () => {
    const { container } = render(<Footer />);

    // Check for grid containers
    const gridContainers = container.querySelectorAll('[class*="grid-cols"]');
    expect(gridContainers.length).toBeGreaterThan(0);

    // Logo should exist
    const logo = screen.getByTestId('footer-logo');
    expect(logo).toBeInTheDocument();

    // Social links should exist
    const socialLinks = screen.getByTestId('social-links');
    expect(socialLinks).toBeInTheDocument();
  });
});
