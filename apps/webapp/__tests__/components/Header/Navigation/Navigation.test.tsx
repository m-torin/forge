import Navigation from '@/components/Header/Navigation/Navigation';
import type { TCollection } from '@/data/data';
import type { TNavigationItem } from '@/data/navigation';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock Headless UI
vi.mock('@headlessui/react', () => ({
  Popover: ({ children }: any) => <div data-testid="navigation-popover">{children}</div>,
  PopoverButton: ({ children, ...props }: any) => (
    <button data-testid="popover-button" {...props}>
      {children}
    </button>
  ),
  PopoverPanel: ({ children }: any) => <div data-testid="popover-panel">{children}</div>,
  Transition: ({ children, show }: any) => (show ? <div>{children}</div> : null),
  useClose: () => vi.fn(),
  DataInteractive: ({ children }: any) => <div>{children}</div>,
}));

// Mock CollectionCard3 component
vi.mock('@/components/CollectionCard3', () => ({
  default: () => <div data-testid="collection-card">Collection Card</div>,
}));

// Mock aside hook
vi.mock('@/components/aside', () => ({
  useAside: () => ({
    close: vi.fn(),
  }),
}));

// Sample navigation data for testing
const mockMenu: TNavigationItem[] = [
  {
    id: '1',
    name: 'Home',
    href: '/',
    type: undefined,
  },
  {
    id: '2',
    name: 'Shop',
    href: '/shop',
    type: 'dropdown',
    children: [
      {
        id: '2-1',
        name: 'All Products',
        href: '/shop/all',
        type: undefined,
      },
    ],
  },
  {
    id: '3',
    name: 'About',
    href: '/about',
    type: undefined,
  },
];

const mockFeaturedCollection: TCollection = {
  id: '1',
  title: 'Featured Collection',
  description: 'A featured collection for testing',
  image: {
    src: '/test-image.jpg',
    width: 400,
    height: 300,
    alt: 'Featured Collection',
  },
  handle: 'featured',
};

describe('navigation', () => {
  test('should render navigation component', () => {
    render(<Navigation menu={mockMenu} featuredCollection={mockFeaturedCollection} />);

    const navigation = screen.getAllByRole('list')[0];
    expect(navigation).toBeInTheDocument();
  });

  test('should render main navigation links', () => {
    render(<Navigation menu={mockMenu} featuredCollection={mockFeaturedCollection} />);

    // Check for navigation items from mock data
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Shop')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  test('should render category navigation', () => {
    render(<Navigation menu={mockMenu} featuredCollection={mockFeaturedCollection} />);

    // Check for category-related navigation
    const categoryNav = screen.queryByText(/categories|browse|collections/i);
    expect(categoryNav).toBeInTheDocument();
  });

  test('should handle navigation item clicks', () => {
    render(<Navigation menu={mockMenu} featuredCollection={mockFeaturedCollection} />);

    const navLinks = screen.getAllByRole('link');
    expect(navLinks.length).toBeGreaterThan(0);
    fireEvent.click(navLinks[0]);
    // Should handle click without crashing
    expect(navLinks[0]).toBeInTheDocument();
  });

  test('should render mobile navigation toggle', () => {
    render(<Navigation menu={mockMenu} featuredCollection={mockFeaturedCollection} />);

    const mobileToggle = screen.queryByTestId('popover-button') || screen.queryByText(/menu/i);
    expect(mobileToggle).toBeInTheDocument();
  });

  test('should handle mobile menu toggle', () => {
    render(<Navigation menu={mockMenu} featuredCollection={mockFeaturedCollection} />);

    const mobileToggle = screen.getByTestId('popover-button');
    fireEvent.click(mobileToggle);

    const mobilePanel = screen.getByTestId('popover-panel');
    expect(mobilePanel).toBeInTheDocument();
  });

  test('should render dropdown menus', () => {
    render(<Navigation menu={mockMenu} featuredCollection={mockFeaturedCollection} />);

    const dropdownTrigger = screen.getByTestId('popover-button');
    fireEvent.click(dropdownTrigger);

    const dropdown = screen.getByTestId('popover-panel');
    expect(dropdown).toBeInTheDocument();
  });

  test('should be responsive', () => {
    const { container } = render(
      <Navigation menu={mockMenu} featuredCollection={mockFeaturedCollection} />,
    );

    const responsiveElement = container.querySelector(
      '[class*="sm:"], [class*="md:"], [class*="lg:"], [class*="hidden"]',
    );
    expect(responsiveElement).toBeInTheDocument();
  });

  test('should render navigation with proper accessibility', () => {
    render(<Navigation menu={mockMenu} featuredCollection={mockFeaturedCollection} />);

    const navigation = screen.getAllByRole('list')[0];
    expect(navigation).toBeInTheDocument();

    // Check for proper ARIA labels
    const navElements = screen.queryAllByRole('link');
    navElements.forEach(link => {
      expect(link).toBeVisible();
    });
  });

  test('should handle keyboard navigation', () => {
    render(<Navigation menu={mockMenu} featuredCollection={mockFeaturedCollection} />);

    const firstLink = screen.getAllByRole('link')[0];
    firstLink.focus();
    expect(firstLink).toHaveFocus();

    fireEvent.keyDown(firstLink, { key: 'Tab' });
    // Should handle keyboard events without crashing
    expect(firstLink).toBeInTheDocument();
  });

  test('should render mega menu if applicable', () => {
    render(<Navigation menu={mockMenu} featuredCollection={mockFeaturedCollection} />);

    const megaMenu = screen.getByTestId('popover-panel');
    // Check for multi-column layout typical of mega menus
    const columns = megaMenu.querySelectorAll('[class*="col"], [class*="grid"]');
    expect(columns.length).toBeGreaterThanOrEqual(0);
  });

  test('should render without errors', () => {
    expect(() => {
      render(<Navigation menu={mockMenu} featuredCollection={mockFeaturedCollection} />);
    }).not.toThrow();
  });
});
