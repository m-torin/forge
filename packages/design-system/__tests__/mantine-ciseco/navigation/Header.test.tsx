import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import Header from '../../../mantine-ciseco/components/Header/Header';

// Mock next/image
vi.mock('next/image', (_: any) => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Mock the sub-components that might not be available
vi.mock('../../../mantine-ciseco/components/Header/SearchBtnPopover', (_: any) => ({
  default: ({ 'data-testid': testId }: any) => (
    <button data-testid={testId} aria-label="Search">
      Search
    </button>
  ),
}));

vi.mock('../../../mantine-ciseco/components/Header/AvatarDropdown', (_: any) => ({
  default: ({ 'data-testid': testId }: any) => (
    <div data-testid={testId} role="button" aria-label="User menu">
      User Menu
    </div>
  ),
}));

vi.mock('../../../mantine-ciseco/components/Header/CartBtn', (_: any) => ({
  default: ({ 'data-testid': testId, onClick }: any) => (
    <button data-testid={testId} onClick={onClick} aria-label="Shopping cart">
      Cart
    </button>
  ),
}));

vi.mock('../../../mantine-ciseco/components/Header/HamburgerBtnMenu', (_: any) => ({
  default: ({ onClick }: any) => (
    <button onClick={onClick} aria-label="Toggle menu">
      Menu
    </button>
  ),
}));

vi.mock('../../../mantine-ciseco/components/shared/Logo/Logo', (_: any) => ({
  default: ({ 'data-testid': testId }: any) => <div data-testid={testId}>Logo</div>,
}));

vi.mock('../../../mantine-ciseco/components/Header/CategoriesDropdown', (_: any) => ({
  default: () => <div>Categories</div>,
}));

vi.mock('../../../mantine-ciseco/components/Header/MegaMenuPopover', (_: any) => ({
  default: () => <div>Mega Menu</div>,
}));

vi.mock('../../../mantine-ciseco/components/Header/CurrLangDropdown', (_: any) => ({
  default: () => <div>Language</div>,
}));

describe('Header', (_: any) => {
  const mockOnMenuClick = vi.fn();
  const mockOnCartClick = vi.fn();

  beforeEach(() => {
    mockOnMenuClick.mockClear();
    mockOnCartClick.mockClear();
  });

  it('renders header with logo', (_: any) => {
    render(<Header />);
    expect(screen.getByTestId('header-logo')).toBeInTheDocument();
  });

  it('renders header element with proper role', (_: any) => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders with testId prop', (_: any) => {
    render(<Header testId="custom-header" />);
    expect(screen.getByTestId('custom-header')).toBeInTheDocument();
  });

  it('toggles mobile menu', (_: any) => {
    render(<Header onMenuClick={mockOnMenuClick} />);
    const menuButton = screen.getByLabelText('Toggle menu');

    fireEvent.click(menuButton);
    expect(mockOnMenuClick).toHaveBeenCalled();
  });

  it('renders search button', (_: any) => {
    render(<Header />);
    expect(screen.getByTestId('header-search')).toBeInTheDocument();
  });

  it('renders user menu', (_: any) => {
    render(<Header />);
    expect(screen.getByTestId('header-user-menu')).toBeInTheDocument();
  });

  it('renders shopping cart button', (_: any) => {
    render(<Header onCartClick={mockOnCartClick} />);
    const cartButton = screen.getByTestId('header-cart');
    expect(cartButton).toBeInTheDocument();

    fireEvent.click(cartButton);
    expect(mockOnCartClick).toHaveBeenCalled();
  });

  it('renders navigation with proper aria-label', (_: any) => {
    render(<Header />);
    const nav = screen.getByTestId('header-navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });

  it('applies border bottom by default', (_: any) => {
    render(<Header />);
    const headerContainer = screen.getByRole('banner').querySelector('.container > div');
    expect(headerContainer).toHaveClass('border-b');
  });

  it('can hide border bottom', (_: any) => {
    render(<Header hasBorderBottom={false} />);
    const headerContainer = screen.getByRole('banner').querySelector('.container > div');
    expect(headerContainer).not.toHaveClass('border-b');
  });

  it('renders with current locale', (_: any) => {
    render(<Header currentLocale="fr" />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('contains all main header components', (_: any) => {
    render(<Header />);

    // Check for logo
    expect(screen.getByTestId('header-logo')).toBeInTheDocument();

    // Check for search
    expect(screen.getByTestId('header-search')).toBeInTheDocument();

    // Check for user menu
    expect(screen.getByTestId('header-user-menu')).toBeInTheDocument();

    // Check for cart
    expect(screen.getByTestId('header-cart')).toBeInTheDocument();
  });

  it('has proper structure with container and flex layout', (_: any) => {
    render(<Header />);
    const header = screen.getByRole('banner');
    const container = header.querySelector('.container');
    const flexContainer = container?.querySelector('.flex.h-20.justify-between');

    expect(container).toBeInTheDocument();
    expect(flexContainer).toBeInTheDocument();
  });

  it('shows hamburger menu on mobile viewport', (_: any) => {
    render(<Header />);
    const menuButton = screen.getByLabelText('Toggle menu');

    // The button should be in the DOM (visibility controlled by CSS classes)
    expect(menuButton).toBeInTheDocument();
  });

  it('has proper ARIA attributes', (_: any) => {
    render(<Header />);
    const header = screen.getByRole('banner');
    const nav = screen.getByTestId('header-navigation');

    expect(header).toBeInTheDocument();
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });

  it('maintains header height with h-20 class', (_: any) => {
    render(<Header />);
    const headerContent = screen.getByRole('banner').querySelector('.h-20');
    expect(headerContent).toHaveClass('h-20');
  });

  it('applies relative z-10 positioning', (_: any) => {
    render(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('relative', 'z-10');
  });

  it('renders all navigation items properly', (_: any) => {
    render(<Header />);

    // Check that all expected navigation elements are present
    expect(screen.getByTestId('header-logo')).toBeInTheDocument();
    expect(screen.getByTestId('header-navigation')).toBeInTheDocument();
    expect(screen.getByTestId('header-search')).toBeInTheDocument();
    expect(screen.getByTestId('header-user-menu')).toBeInTheDocument();
    expect(screen.getByTestId('header-cart')).toBeInTheDocument();
  });
});
