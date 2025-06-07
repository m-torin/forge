import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import Header from '../../../mantine-ciseco/components/Header/Header';

describe('Header', () => {
  const mockOnMenuToggle = vi.fn();
  const mockOnSearch = vi.fn();

  beforeEach(() => {
    mockOnMenuToggle.mockClear();
    mockOnSearch.mockClear();
  });

  it('renders header with logo', () => {
    render(<Header />);
    expect(screen.getByTestId('header-logo')).toBeInTheDocument();
  });

  it('renders navigation menu', () => {
    const menuItems = [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'About', href: '/about' },
    ];

    render(<Header menuItems={menuItems} />);

    menuItems.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it('toggles mobile menu', () => {
    render(<Header onMenuToggle={mockOnMenuToggle} />);
    const menuButton = screen.getByLabelText('Toggle menu');

    fireEvent.click(menuButton);
    expect(mockOnMenuToggle).toHaveBeenCalledWith(true);
  });

  it('renders search functionality', () => {
    render(<Header showSearch onSearch={mockOnSearch} />);

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    fireEvent.submit(searchInput.closest('form'));

    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  it('renders user menu when authenticated', () => {
    const user = { name: 'John Doe', avatar: '/avatar.jpg' };
    render(<Header user={user} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'John Doe' })).toBeInTheDocument();
  });

  it('renders sign in button when not authenticated', () => {
    render(<Header />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('renders shopping cart button', () => {
    render(<Header showCart cartCount={3} />);

    const cartButton = screen.getByLabelText('Shopping cart');
    expect(cartButton).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('handles sticky header on scroll', () => {
    render(<Header sticky />);
    const header = screen.getByRole('banner');

    // Simulate scroll
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
    fireEvent.scroll(window);

    expect(header).toHaveClass('header-sticky');
  });

  it('renders with dark mode toggle', () => {
    render(<Header showThemeToggle />);
    const themeToggle = screen.getByLabelText('Toggle theme');

    fireEvent.click(themeToggle);
    // Theme should toggle
  });

  it('renders language selector', () => {
    const languages = [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' },
    ];

    render(<Header languages={languages} currentLanguage="en" />);

    const languageSelector = screen.getByLabelText('Select language');
    fireEvent.click(languageSelector);

    languages.forEach((lang) => {
      expect(screen.getByText(lang.name)).toBeInTheDocument();
    });
  });

  it('renders notifications bell', () => {
    render(<Header showNotifications notificationCount={5} />);

    const notificationBell = screen.getByLabelText('Notifications');
    expect(notificationBell).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('handles responsive behavior', () => {
    render(<Header />);
    const header = screen.getByRole('banner');

    // Mobile view
    Object.defineProperty(window, 'innerWidth', { value: 640, writable: true });
    fireEvent.resize(window);

    expect(header).toHaveClass('mobile-header');

    // Desktop view
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    fireEvent.resize(window);

    expect(header).toHaveClass('desktop-header');
  });

  it('closes mobile menu on outside click', () => {
    render(<Header onMenuToggle={mockOnMenuToggle} />);

    // Open menu
    const menuButton = screen.getByLabelText('Toggle menu');
    fireEvent.click(menuButton);

    // Click outside
    fireEvent.click(document.body);
    expect(mockOnMenuToggle).toHaveBeenCalledWith(false);
  });

  it('has proper ARIA attributes', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    const nav = screen.getByRole('navigation');

    expect(header).toBeInTheDocument();
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });

  it('renders with custom logo', () => {
    const CustomLogo = () => <img src="/custom-logo.png" alt="Custom Logo" />;
    render(<Header logo={<CustomLogo />} />);

    expect(screen.getByAltText('Custom Logo')).toBeInTheDocument();
  });

  it('supports mega menu', async () => {
    const megaMenuItems = [
      {
        label: 'Products',
        children: [
          { label: 'Category 1', href: '/category-1' },
          { label: 'Category 2', href: '/category-2' },
        ],
      },
    ];

    render(<Header menuItems={megaMenuItems} megaMenu />);

    const productsItem = screen.getByText('Products');
    fireEvent.mouseEnter(productsItem);

    await waitFor(() => {
      expect(screen.getByText('Category 1')).toBeInTheDocument();
      expect(screen.getByText('Category 2')).toBeInTheDocument();
    });
  });

  it('renders with breadcrumbs', () => {
    const breadcrumbs = [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Shoes', href: '/products/shoes' },
    ];

    render(<Header breadcrumbs={breadcrumbs} />);

    const breadcrumbNav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(breadcrumbNav).toBeInTheDocument();

    breadcrumbs.forEach((crumb) => {
      expect(screen.getByText(crumb.label)).toBeInTheDocument();
    });
  });

  it('handles search autocomplete', async () => {
    const suggestions = ['Product 1', 'Product 2', 'Product 3'];

    render(<Header showSearch searchSuggestions={suggestions} onSearch={mockOnSearch} />);

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'prod' } });

    await waitFor(() => {
      suggestions.forEach((suggestion) => {
        expect(screen.getByText(suggestion)).toBeInTheDocument();
      });
    });
  });

  it('renders with announcement bar', () => {
    render(<Header announcementText="Free shipping on orders over $50!" />);
    expect(screen.getByText('Free shipping on orders over $50!')).toBeInTheDocument();
  });
});
