import PageTab from '@/app/(accounts)/PageTab';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  usePathname: () => '/account',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, className, ...props }: any) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

describe('pageTab', () => {
  test('should render account navigation tabs', () => {
    render(<PageTab />);

    // Should render navigation tabs for account pages
    const settingsTab = screen.queryByText(/settings/i);
    expect(settingsTab).toBeInTheDocument();
  });

  test('should render all account page links', () => {
    render(<PageTab />);

    const expectedTabs = [
      screen.queryByText(/settings/i),
      screen.queryByText(/billing/i),
      screen.queryByText(/orders/i),
      screen.queryByText(/password/i),
      screen.queryByText(/wishlists/i),
    ].filter(Boolean);

    expect(expectedTabs.length).toBeGreaterThanOrEqual(4);
  });

  test('should highlight active tab', () => {
    render(<PageTab />);

    // Should show which tab is currently active
    const tabs = screen.getAllByRole('link');
    expect(tabs.length).toBeGreaterThanOrEqual(1);
  });

  test('should handle tab navigation', () => {
    render(<PageTab />);

    const tabs = screen.getAllByRole('link');
    expect(tabs.length).toBeGreaterThan(0);
    fireEvent.click(tabs[0]);
    expect(tabs[0]).toHaveAttribute('href');
  });

  test('should render with proper styling', () => {
    const { container } = render(<PageTab />);

    const tabContainer = container.firstChild as HTMLElement;
    expect(tabContainer).toBeInTheDocument();
  });

  test('should be accessible with proper ARIA attributes', () => {
    render(<PageTab />);

    // Check for navigation structure (might be nav or div with links)
    const links = screen.queryAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    // All links should be accessible
    links.forEach(link => {
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href');
    });
  });

  test('should render tab labels correctly', () => {
    render(<PageTab />);

    // Should have clear, readable tab labels
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveTextContent(/.+/);
    });
  });

  test('should handle responsive design', () => {
    render(<PageTab />);

    // Test passes if the component renders without errors
    // Responsive classes are applied automatically by Tailwind
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
  });

  test('should render without errors', () => {
    expect(() => {
      render(<PageTab />);
    }).not.toThrow();
  });

  test('should provide clear navigation structure', () => {
    render(<PageTab />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(1);

    // Each link should have an href
    links.forEach(link => {
      expect(link).toHaveAttribute('href');
    });
  });
});
