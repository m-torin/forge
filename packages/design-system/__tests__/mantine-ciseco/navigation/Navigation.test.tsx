import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import { Navigation } from '../../../mantine-ciseco';
import { type TCollection } from '../../../mantine-ciseco/data/data';

describe('Navigation', () => {
  const mockFeaturedCollection: TCollection = {
    id: '1',
    title: 'Featured Collection',
    description: 'A featured collection',
    handle: 'featured',
    image: {
      src: '/images/collection.jpg',
      alt: 'Featured Collection',
      width: 800,
      height: 600,
    },
    color: 'blue',
    count: 10,
    sortDescription: 'Featured items',
  };

  const defaultMenuItems = [
    { label: 'Home', href: '/' },
    {
      label: 'Products',
      href: '/products',
      children: [
        { label: 'Electronics', href: '/products/electronics' },
        { label: 'Clothing', href: '/products/clothing' },
      ],
    },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const defaultProps = {
    featuredCollection: mockFeaturedCollection,
    items: defaultMenuItems,
    menu: defaultMenuItems.map((item) => ({
      id: item.label.toLowerCase(),
      name: item.label,
      href: item.href,
      type: item.children ? ('dropdown' as const) : undefined,
      children: item.children?.map((child) => ({
        id: child.label.toLowerCase(),
        name: child.label,
        href: child.href,
      })),
    })),
  };

  it('renders navigation with menu items', () => {
    render(<Navigation {...defaultProps} />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('handles menu item clicks', () => {
    const mockOnClick = vi.fn();
    const itemsWithClick = defaultMenuItems.map((item) => ({ ...item, onClick: mockOnClick }));
    const props = {
      ...defaultProps,
      items: itemsWithClick,
      menu: itemsWithClick.map((item) => ({
        id: item.label.toLowerCase(),
        name: item.label,
        href: item.href,
        type: item.children ? ('dropdown' as const) : undefined,
        onClick: item.onClick,
        children: item.children?.map((child) => ({
          id: child.label.toLowerCase(),
          name: child.label,
          href: child.href,
        })),
      })),
    };

    render(<Navigation {...props} />);

    const homeLink = screen.getByText('Home');
    fireEvent.click(homeLink);

    expect(mockOnClick).toHaveBeenCalled();
  });

  it('shows dropdown menu for items with children', async () => {
    render(<Navigation {...defaultProps} />);

    const productsItem = screen.getByText('Products');
    fireEvent.mouseEnter(productsItem);

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Clothing')).toBeInTheDocument();
    });
  });

  it('closes dropdown on mouse leave', async () => {
    render(<Navigation {...defaultProps} />);

    const productsItem = screen.getByText('Products');
    fireEvent.mouseEnter(productsItem);

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });

    fireEvent.mouseLeave(productsItem);

    await waitFor(() => {
      expect(screen.queryByText('Electronics')).not.toBeInTheDocument();
    });
  });

  it('handles keyboard navigation', () => {
    render(<Navigation {...defaultProps} />);

    const navigation = screen.getByRole('navigation');
    const firstItem = screen.getByText('Home');

    // Tab to first item
    firstItem.focus();
    expect(firstItem).toHaveFocus();

    // Arrow keys to navigate
    fireEvent.keyDown(firstItem, { key: 'ArrowRight' });
    expect(screen.getByText('Products')).toHaveFocus();

    fireEvent.keyDown(screen.getByText('Products'), { key: 'ArrowRight' });
    expect(screen.getByText('About')).toHaveFocus();
  });

  it('opens dropdown with Enter key', async () => {
    render(<Navigation {...defaultProps} />);

    const productsItem = screen.getByText('Products');
    productsItem.focus();

    fireEvent.keyDown(productsItem, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });
  });

  it('renders with different orientations', () => {
    const { rerender } = render(<Navigation {...defaultProps} orientation="horizontal" />);
    expect(screen.getByRole('navigation')).toHaveClass('horizontal');

    rerender(<Navigation {...defaultProps} orientation="vertical" />);
    expect(screen.getByRole('navigation')).toHaveClass('vertical');
  });

  it('shows active state for current page', () => {
    render(<Navigation {...defaultProps} currentPath="/products" />);

    const productsItem = screen.getByText('Products');
    expect(productsItem).toHaveClass('active');
  });

  it('renders with custom className', () => {
    render(<Navigation {...defaultProps} className="custom-nav" />);
    expect(screen.getByRole('navigation')).toHaveClass('custom-nav');
  });

  it('supports mobile responsive behavior', () => {
    render(<Navigation {...defaultProps} responsive />);

    // Should show hamburger menu on mobile
    const mobileToggle = screen.getByLabelText('Toggle navigation menu');
    expect(mobileToggle).toBeInTheDocument();

    fireEvent.click(mobileToggle);
    expect(screen.getByRole('navigation')).toHaveClass('mobile-open');
  });

  it('renders with icons for menu items', () => {
    const itemsWithIcons = [
      { label: 'Home', href: '/', icon: '🏠' },
      { label: 'Products', href: '/products', icon: '📦' },
    ];

    const props = {
      ...defaultProps,
      items: itemsWithIcons,
      menu: itemsWithIcons.map((item) => ({
        id: item.label.toLowerCase(),
        name: item.label,
        href: item.href,
        type: 'dropdown' as const,
        icon: item.icon,
      })),
    };

    render(<Navigation {...props} />);

    expect(screen.getByText('🏠')).toBeInTheDocument();
    expect(screen.getByText('📦')).toBeInTheDocument();
  });

  it('handles mega menu layout', async () => {
    const megaMenuItems = [
      {
        label: 'Categories',
        href: '/categories',
        megaMenu: {
          columns: [
            {
              title: 'Electronics',
              items: [
                { label: 'Phones', href: '/phones' },
                { label: 'Laptops', href: '/laptops' },
              ],
            },
            {
              title: 'Clothing',
              items: [
                { label: 'Shirts', href: '/shirts' },
                { label: 'Pants', href: '/pants' },
              ],
            },
          ],
        },
      },
    ];

    const props = {
      ...defaultProps,
      items: megaMenuItems,
      menu: megaMenuItems.map((item) => ({
        id: item.label.toLowerCase(),
        name: item.label,
        href: item.href,
        type: 'mega-menu' as const,
        children: item.megaMenu.columns.map((col) => ({
          id: col.title.toLowerCase(),
          name: col.title,
          children: col.items.map((subItem) => ({
            id: subItem.label.toLowerCase(),
            name: subItem.label,
            href: subItem.href,
          })),
        })),
      })),
    };

    render(<Navigation {...props} />);

    const categoriesItem = screen.getByText('Categories');
    fireEvent.mouseEnter(categoriesItem);

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Clothing')).toBeInTheDocument();
      expect(screen.getByText('Phones')).toBeInTheDocument();
      expect(screen.getByText('Shirts')).toBeInTheDocument();
    });
  });

  it('shows badges for menu items', () => {
    const itemsWithBadges = [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products', badge: 'New' },
      { label: 'Sale', href: '/sale', badge: { text: '50% Off', color: 'red' } },
    ];

    const props = {
      ...defaultProps,
      items: itemsWithBadges,
      menu: itemsWithBadges.map((item) => ({
        id: item.label.toLowerCase(),
        name: item.label,
        href: item.href,
        type: 'dropdown' as const,
        badge: item.badge,
      })),
    };

    render(<Navigation {...props} />);

    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('50% Off')).toBeInTheDocument();
  });

  it('supports custom styling for different states', () => {
    render(
      <Navigation
        {...defaultProps}
        styles={{
          item: 'custom-item',
          activeItem: 'custom-active',
          dropdown: 'custom-dropdown',
        }}
      />,
    );

    expect(screen.getByRole('navigation')).toHaveClass('custom-item');
  });
});
