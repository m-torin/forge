import { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { ReactElement, ReactNode } from 'react';
import { vi } from 'vitest';

// Mock data generators
export const mockProduct = (overrides: any = {}) => ({
  id: '1',
  name: 'Test Product',
  title: 'Test Product', // ProductCardLarge uses title
  description: 'Test product description',
  price: 99.99,
  handle: 'test-product',
  image: '/test-image.jpg',
  images: [
    { width: 400, height: 400, alt: 'Test Product', src: '/test-image.jpg' },
    { width: 400, height: 400, alt: 'Test Product View 2', src: '/test-image-2.jpg' },
  ],
  category: 'Test Category',
  status: 'available',
  rating: 4.5,
  reviews: 120,
  reviewNumber: 120, // ProductCardLarge uses reviewNumber
  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['red', 'blue', 'green'],
  variants: [
    { id: '1', name: 'Red - S', price: 99.99, available: true },
    { id: '2', name: 'Blue - M', price: 99.99, available: true },
  ],
  selectedOptions: [], // ProductCardLarge uses selectedOptions
  ...overrides,
});

export const mockCollection = (overrides: any = {}) => ({
  id: 'gid://1',
  title: 'Test Collection',
  description: 'Test collection description',
  sortDescription: 'Test description',
  image: { width: 400, height: 400, alt: 'Test Collection', src: '/test-collection.jpg' },
  handle: 'test-collection',
  count: 25,
  color: 'bg-indigo-50',
  ...overrides,
});

export const mockPost = (overrides: any = {}) => ({
  id: '1',
  title: 'Test Blog Post',
  excerpt: 'Test blog post excerpt',
  content: 'Test blog post content',
  author: 'Test Author',
  date: '2024-01-01',
  image: '/test-blog.jpg',
  categories: ['Fashion', 'Style'],
  readTime: '5 min read',
  ...overrides,
});

export const mockUser = (overrides: any = {}) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  avatar: '/test-avatar.jpg',
  ...overrides,
});

// Custom render function with all providers
interface AllTheProvidersProps extends Record<string, any> {
  children: ReactNode;
}

export const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <MantineProvider>
      <ModalsProvider>
        <Notifications />
        {children}
      </ModalsProvider>
    </MantineProvider>
  );
};

export const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing library
export * from '@testing-library/react';
export { customRender as render };

// Mock functions for common interactions
export const mockHandlers = {
  onClick: vi.fn(),
  onChange: vi.fn(),
  onSubmit: vi.fn(),
  onClose: vi.fn(),
  onOpen: vi.fn(),
  onSelect: vi.fn(),
  onAdd: vi.fn(),
  onRemove: vi.fn(),
  onLike: vi.fn(),
  onShare: vi.fn(),
};

// Accessibility testing utilities
export const checkAccessibility = (component: HTMLElement) => {
  // Check for proper ARIA labels
  const buttons = component.querySelectorAll('button');
  buttons.forEach((button: any) => {
    expect(
      button.getAttribute('aria-label') || button.textContent || button.querySelector('title'),
    ).toBeTruthy();
  });

  // Check for alt text on images
  const images = component.querySelectorAll('img');
  images.forEach((img: any) => {
    expect(img.getAttribute('alt')).toBeTruthy();
  });

  // Check for proper heading hierarchy
  const headings = component.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let lastLevel = 0;
  headings.forEach((heading: any) => {
    const level = parseInt(heading.tagName[1]);
    expect(level - lastLevel).toBeLessThanOrEqual(1);
    lastLevel = level;
  });
};

// Animation and transition testing helpers
export const waitForAnimation = () => new Promise((resolve) => setTimeout(resolve, 350));

export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver as any;
};

// Local storage mock
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
  };
};

// Mock next/router
export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  prefetch: vi.fn(),
  reload: vi.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  route: '/',
  basePath: '',
  locale: 'en',
  locales: ['en', 'es', 'fr'],
  defaultLocale: 'en',
};

// Mock next/image loader
export const mockImageLoader = ({ src }: { src: string }) => src;

// Mock window.scrollTo for scroll indicator tests
export const mockScrollTo = () => {
  Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
    writable: true,
  });
};

// Test ID helpers
export const testIds = {
  // Components
  accordion: 'accordion-info',
  addToCart: 'add-to-cart-button',
  productCard: 'product-card',
  collection: 'collection-card',
  header: 'header',
  navigation: 'navigation',
  filters: 'filters',
  // Actions
  likeButton: 'like-button',
  shareButton: 'share-button',
  // Forms
  searchInput: 'search-input',
  sortDropdown: 'sort-dropdown',
};
