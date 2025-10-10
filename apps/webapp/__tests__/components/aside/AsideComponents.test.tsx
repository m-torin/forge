import { render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { describe, expect, vi } from 'vitest';

// Import mocked components for testing
import CategoryFilters from '@/components/aside-category-filters';
import ProductQuickview from '@/components/aside-product-quickview';
import SidebarCart from '@/components/aside-sidebar-cart';
import SidebarNavigation from '@/components/aside-sidebar-navigation';
import { Aside, AsideProvider, useAside } from '@/components/aside/aside';

// Mock Next.js components
vi.mock('next/image', () => ({
  default: ({ src, alt, className, ...props }: any) => (
    <img src={src} alt={alt} className={className} data-testid="aside-image" {...props} />
  ),
}));

// Mock data dependencies
vi.mock('@/data/data', () => ({
  getCart: vi.fn().mockResolvedValue({
    lines: [
      { id: '1', name: 'Product 1', price: 100 },
      { id: '2', name: 'Product 2', price: 200 },
    ],
  }),
}));

vi.mock('@/data/navigation', () => ({
  getNavigation: vi.fn().mockResolvedValue([
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
  ]),
}));

// Mock child components
vi.mock('@/components/ProductQuickView', () => ({
  default: () => <div data-testid="product-quick-view">Product Quick View</div>,
}));

vi.mock('@/components/Header/Navigation/SidebarNavigation', () => ({
  default: ({ data }: any) => (
    <div data-testid="sidebar-navigation-content">
      {data.map((item: any) => (
        <div key={item.name}>{item.name}</div>
      ))}
    </div>
  ),
}));

vi.mock('@/shared/Button/ButtonPrimary', () => ({
  default: ({ children, ...props }: any) => (
    <button {...props} data-testid="button-primary">
      {children}
    </button>
  ),
}));

vi.mock('@/shared/Button/ButtonSecondary', () => ({
  default: ({ children, ...props }: any) => (
    <button {...props} data-testid="button-secondary">
      {children}
    </button>
  ),
}));

vi.mock('@/components/Link', () => ({
  Link: ({ children, ...props }: any) => (
    <a {...props} data-testid="link">
      {children}
    </a>
  ),
}));

vi.mock('@/components/Prices', () => ({
  default: ({ price }: any) => <span data-testid="price">{price}</span>,
}));

// Helper component to open aside for testing
function TestAsideOpener({ type, children }: { type: string; children: React.ReactNode }) {
  const { open } = useAside();

  useEffect(() => {
    open(type as any);
  }, [open, type]);

  return children;
}

describe('aside Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('aside Container', () => {
    test('should render aside container with correct props', () => {
      render(
        <AsideProvider>
          <TestAsideOpener type="cart">
            <Aside openFrom="right" type="cart">
              Content
            </Aside>
          </TestAsideOpener>
        </AsideProvider>,
      );

      // The aside is controlled by context, so we need to check for the dialog structure
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    test('should render aside with heading', () => {
      render(
        <AsideProvider>
          <TestAsideOpener type="cart">
            <Aside openFrom="right" type="cart" heading="Test Heading">
              Content
            </Aside>
          </TestAsideOpener>
        </AsideProvider>,
      );

      // Check if heading is rendered
      const heading = screen.getByText('Test Heading');
      expect(heading).toBeInTheDocument();
    });
  });

  describe('sidebar Cart', () => {
    test('should render sidebar cart component', async () => {
      const { container: _container } = render(
        <AsideProvider>
          <SidebarCart />
        </AsideProvider>,
      );

      // Wait for async component to render
      await screen.findByText('Shopping Cart');
      expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
    });
  });

  describe('sidebar Navigation', () => {
    test('should render sidebar navigation component', async () => {
      const { container: _container } = render(
        <AsideProvider>
          <SidebarNavigation />
        </AsideProvider>,
      );

      // Wait for async component to render
      await screen.findByTestId('sidebar-navigation-content');
      expect(screen.getByTestId('sidebar-navigation-content')).toBeInTheDocument();
    });
  });

  describe('category Filters', () => {
    test('should render category filters component', () => {
      render(
        <AsideProvider>
          <CategoryFilters />
        </AsideProvider>,
      );

      // Check if filters heading is rendered
      const heading = screen.getByText('Filters');
      expect(heading).toBeInTheDocument();
    });
  });

  describe('product Quick View', () => {
    test('should render product quick view component', async () => {
      const { container: _container } = render(
        <AsideProvider>
          <ProductQuickview />
        </AsideProvider>,
      );

      // Wait for async component to render
      await screen.findByTestId('product-quick-view');
      expect(screen.getByTestId('product-quick-view')).toBeInTheDocument();
    });
  });
});
