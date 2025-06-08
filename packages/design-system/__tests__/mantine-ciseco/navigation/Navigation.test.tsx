import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import { Navigation } from '../../../mantine-ciseco/components/Header/Navigation/Navigation';
import { type TCollection } from '../../../mantine-ciseco/data/data';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, className, ...props }: any) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

// Mock the locale hook
vi.mock('../../../mantine-ciseco/hooks/useLocale', () => ({
  useLocalizeHref: () => (href: string) => href,
}));

// Mock CollectionCard3 component
vi.mock('../../../mantine-ciseco/components/CollectionCard3', () => ({
  default: ({ collection }: { collection: TCollection }) => (
    <div data-testid="collection-card">{collection.title}</div>
  ),
}));

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
    {
      id: 'home',
      name: 'Home',
      href: '/',
      type: undefined as any,
    },
    {
      id: 'products',
      name: 'Products',
      href: '/products',
      type: 'dropdown' as const,
      children: [
        { id: 'electronics', name: 'Electronics', href: '/products/electronics' },
        { id: 'clothing', name: 'Clothing', href: '/products/clothing' },
      ],
    },
    {
      id: 'about',
      name: 'About',
      href: '/about',
      type: undefined as any,
    },
    {
      id: 'contact',
      name: 'Contact',
      href: '/contact',
      type: undefined as any,
    },
  ];

  const megaMenuItems = [
    {
      id: 'categories',
      name: 'Categories',
      href: '/categories',
      type: 'mega-menu' as const,
      children: [
        {
          id: 'electronics-section',
          name: 'Electronics',
          href: '/electronics',
          children: [
            { id: 'phones', name: 'Phones', href: '/phones' },
            { id: 'laptops', name: 'Laptops', href: '/laptops' },
          ],
        },
        {
          id: 'clothing-section',
          name: 'Clothing',
          href: '/clothing',
          children: [
            { id: 'shirts', name: 'Shirts', href: '/shirts' },
            { id: 'pants', name: 'Pants', href: '/pants' },
          ],
        },
      ],
    },
  ];

  it('renders navigation with menu items', () => {
    render(<Navigation featuredCollection={mockFeaturedCollection} menu={defaultMenuItems} />);

    expect(screen.getByTestId('main-navigation')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders simple menu items as links', () => {
    render(<Navigation featuredCollection={mockFeaturedCollection} menu={defaultMenuItems} />);

    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders dropdown menu items with children', () => {
    render(<Navigation featuredCollection={mockFeaturedCollection} menu={defaultMenuItems} />);

    const productsItem = screen.getByText('Products');
    expect(productsItem).toBeInTheDocument();

    // Check for chevron down icon in dropdown items
    const productsLink = productsItem.closest('a');
    expect(productsLink?.querySelector('svg')).toBeInTheDocument();
  });

  it('renders mega menu items', () => {
    render(<Navigation featuredCollection={mockFeaturedCollection} menu={megaMenuItems} />);

    const categoriesItem = screen.getByText('Categories');
    expect(categoriesItem).toBeInTheDocument();
  });

  it('applies flex layout classes', () => {
    render(<Navigation featuredCollection={mockFeaturedCollection} menu={defaultMenuItems} />);

    const navigationList = screen.getByTestId('main-navigation');
    expect(navigationList).toHaveClass('flex');
  });

  it('applies custom className', () => {
    render(
      <Navigation
        featuredCollection={mockFeaturedCollection}
        menu={defaultMenuItems}
        className="custom-nav"
      />,
    );

    const navigationList = screen.getByTestId('main-navigation');
    expect(navigationList).toHaveClass('custom-nav');
  });

  it('renders menu items in correct order', () => {
    render(<Navigation featuredCollection={mockFeaturedCollection} menu={defaultMenuItems} />);

    // Get only the top-level navigation items by querying direct children of the main navigation
    const navigation = screen.getByTestId('main-navigation');
    const topLevelMenuItems = Array.from(navigation.children);
    
    expect(topLevelMenuItems).toHaveLength(4);

    expect(topLevelMenuItems[0]).toHaveTextContent('Home');
    expect(topLevelMenuItems[1]).toHaveTextContent('Products'); // This also contains dropdown children text
    expect(topLevelMenuItems[2]).toHaveTextContent('About');
    expect(topLevelMenuItems[3]).toHaveTextContent('Contact');
  });

  it('handles menu items without href', () => {
    const menuWithoutHref = [
      {
        id: 'no-href',
        name: 'No Href',
        href: undefined,
        type: undefined as any,
      },
    ];

    render(<Navigation featuredCollection={mockFeaturedCollection} menu={menuWithoutHref} />);

    const linkElement = screen.getByText('No Href').closest('a');
    expect(linkElement).toHaveAttribute('href', '#');
  });

  it('applies proper styling classes to menu items', () => {
    render(<Navigation featuredCollection={mockFeaturedCollection} menu={defaultMenuItems} />);

    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveClass(
      'flex',
      'items-center',
      'self-center',
      'rounded-full',
      'px-4',
      'py-2.5',
    );
  });

  it('renders chevron icon for dropdown items', () => {
    render(<Navigation featuredCollection={mockFeaturedCollection} menu={defaultMenuItems} />);

    const productsLink = screen.getByText('Products').closest('a');
    const chevronIcon = productsLink?.querySelector('svg');

    expect(chevronIcon).toBeInTheDocument();
    expect(chevronIcon).toHaveClass('h-4', 'w-4');
  });

  it('handles menu item classes properly', () => {
    render(<Navigation featuredCollection={mockFeaturedCollection} menu={defaultMenuItems} />);

    const menuItems = screen.getAllByRole('listitem');

    // Simple menu items should have menu-item class
    expect(menuItems[0]).toHaveClass('relative', 'menu-item');

    // Dropdown menu items should have menu-dropdown class
    expect(menuItems[1]).toHaveClass('menu-dropdown', 'relative', 'menu-item');
  });

  it('renders mega menu with collection card', () => {
    render(<Navigation featuredCollection={mockFeaturedCollection} menu={megaMenuItems} />);

    const categoriesItem = screen.getByText('Categories');
    expect(categoriesItem).toBeInTheDocument();

    // Check that the menu item has the correct mega menu class
    const megaMenuItem = categoriesItem.closest('li');
    expect(megaMenuItem).toHaveClass('menu-megamenu', 'menu-item');
  });

  it('applies consistent text styling across menu types', () => {
    const mixedMenu = [
      { id: 'simple', name: 'Simple', href: '/', type: undefined as any },
      {
        id: 'dropdown',
        name: 'Dropdown',
        href: '/dropdown',
        type: 'dropdown' as const,
        children: [],
      },
      { id: 'mega', name: 'Mega', href: '/mega', type: 'mega-menu' as const, children: [] },
    ];

    render(<Navigation featuredCollection={mockFeaturedCollection} menu={mixedMenu} />);

    // All menu items should have consistent text styling
    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link).toHaveClass('text-sm', 'font-medium', 'text-neutral-700');
    });
  });

  it('handles empty menu gracefully', () => {
    render(<Navigation featuredCollection={mockFeaturedCollection} menu={[]} />);

    const navigationList = screen.getByTestId('main-navigation');
    expect(navigationList).toBeInTheDocument();
    expect(navigationList.children).toHaveLength(0);
  });

  it('maintains proper structure for accessibility', () => {
    render(<Navigation featuredCollection={mockFeaturedCollection} menu={defaultMenuItems} />);

    // Should be a proper unordered list
    const navigationList = screen.getByTestId('main-navigation');
    expect(navigationList.tagName).toBe('UL');

    // Each menu item should be a list item
    const menuItems = screen.getAllByRole('listitem');
    menuItems.forEach((item) => {
      expect(item.tagName).toBe('LI');
    });
  });
});
