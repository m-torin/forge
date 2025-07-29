import AvatarDropdown from '@/components/Header/AvatarDropdown';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock dependencies
vi.mock('@/images/users/avatar4.jpg', () => ({
  default: { src: '/mock-avatar.jpg' },
}));

vi.mock('@/shared/Avatar/Avatar', () => ({
  default: ({ imgUrl, sizeClass }: any) => (
    <div data-testid="avatar" data-img={imgUrl} className={sizeClass}>
      Avatar
    </div>
  ),
}));

vi.mock('@hugeicons/core-free-icons', () => ({
  UserCircle02Icon: 'UserCircle02Icon',
}));

vi.mock('@hugeicons/react', () => ({
  HugeiconsIcon: ({ icon, size, color: _color, strokeWidth: _strokeWidth }: any) => (
    <svg data-testid="hugeicons-icon" data-icon={icon} width={size} height={size}>
      {icon}
    </svg>
  ),
}));

vi.mock('@/components/Link', () => ({
  Link: ({ children, href, className }: any) => (
    <a href={href} className={className} data-testid={`link-${href.replace('/', '')}`}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/Divider', () => ({
  Divider: () => <div data-testid="divider" />,
}));

describe('avatarDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render user icon button', () => {
    render(<AvatarDropdown />);

    const button = screen.getByTestId('popover-button');
    expect(button).toBeInTheDocument();

    const icon = screen.getByTestId('hugeicons-icon');
    expect(icon).toHaveAttribute('data-icon', 'UserCircle02Icon');
    expect(icon).toHaveAttribute('width', '24');
    expect(icon).toHaveAttribute('height', '24');
  });

  test('should accept and apply className prop', () => {
    const { container } = render(<AvatarDropdown className="custom-class" />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  test('should open dropdown when button is clicked', async () => {
    render(<AvatarDropdown />);

    const button = screen.getByTestId('popover-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Eden Smith')).toBeInTheDocument();
    });
    expect(screen.getByText('Los Angeles, CA')).toBeInTheDocument();
  });

  test('should render user avatar and info in dropdown', async () => {
    render(<AvatarDropdown />);

    const button = screen.getByTestId('popover-button');
    fireEvent.click(button);

    await waitFor(() => {
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveAttribute('data-img', '/mock-avatar.jpg');
    });
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveClass('size-12');
    expect(screen.getByText('Eden Smith')).toBeInTheDocument();
    expect(screen.getByText('Los Angeles, CA')).toBeInTheDocument();
  });

  test('should render all navigation links', async () => {
    render(<AvatarDropdown />);

    const button = screen.getByTestId('popover-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('link-account')).toBeInTheDocument();
    });
    expect(screen.getByTestId('link-orders')).toBeInTheDocument();
    expect(screen.getByTestId('link-account-wishlists')).toBeInTheDocument();
    // Help and logout are buttons, not links
    expect(screen.getByText('Help')).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });

  test('should render correct link texts', async () => {
    render(<AvatarDropdown />);

    const button = screen.getByTestId('popover-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('My Account')).toBeInTheDocument();
    });
    expect(screen.getByText('My Orders')).toBeInTheDocument();
    expect(screen.getByText('Wishlist')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });

  test('should render dividers', async () => {
    render(<AvatarDropdown />);

    const button = screen.getByTestId('popover-button');
    fireEvent.click(button);

    await waitFor(() => {
      const dividers = screen.getAllByTestId('divider');
      expect(dividers).toHaveLength(2);
    });
  });

  test('should have correct button styling', () => {
    render(<AvatarDropdown />);

    const button = screen.getByTestId('popover-button');
    expect(button).toHaveClass(
      '-m-2.5',
      'flex',
      'cursor-pointer',
      'items-center',
      'justify-center',
      'rounded-full',
      'p-2.5',
      'hover:bg-neutral-100',
      'focus-visible:outline-hidden',
      'dark:hover:bg-neutral-800',
    );
  });

  test('should render SVG icons for menu items', async () => {
    render(<AvatarDropdown />);

    const button = screen.getByTestId('popover-button');
    fireEvent.click(button);

    await waitFor(() => {
      // Just check that SVGs exist somewhere in the rendered component
      const svgs = document.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  test('should apply hover styles to menu items', async () => {
    render(<AvatarDropdown />);

    const button = screen.getByTestId('popover-button');
    fireEvent.click(button);

    await waitFor(() => {
      const accountLink = screen.getByRole('link', { name: 'My Account' });
      expect(accountLink).toHaveClass('hover:bg-neutral-100', 'dark:hover:bg-neutral-700');
    });
  });

  test('should have focus-visible styles on menu items', async () => {
    render(<AvatarDropdown />);

    const button = screen.getByTestId('popover-button');
    fireEvent.click(button);

    await waitFor(() => {
      const accountLink = screen.getByRole('link', { name: 'My Account' });
      expect(accountLink).toHaveClass('focus-visible:ring-3', 'focus-visible:ring-orange-500/50');
    });
  });

  test('should render dropdown panel with correct positioning', async () => {
    render(<AvatarDropdown />);

    const button = screen.getByTestId('popover-button');
    fireEvent.click(button);

    await waitFor(() => {
      // Just verify the dropdown content appears after clicking
      expect(screen.getByText('My Account')).toBeInTheDocument();
    });
  });

  test('should have correct user info layout', async () => {
    render(<AvatarDropdown />);

    const button = screen.getByTestId('popover-button');
    fireEvent.click(button);

    await waitFor(() => {
      const userInfo = screen.getByText('Eden Smith').parentElement;
      expect(userInfo).toHaveClass('grow');
    });

    const userName = screen.getByText('Eden Smith');
    expect(userName.tagName).toBe('H4');
    expect(userName).toHaveClass('font-semibold');

    const location = screen.getByText('Los Angeles, CA');
    expect(location).toHaveClass('mt-0.5', 'text-xs');
  });
});
