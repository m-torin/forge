import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@repo/testing/vitest';

import { ModeToggle } from '../../components/mode-toggle';

// Import mocked modules
vi.mock('next-themes', () => ({
  useTheme: vi.fn().mockReturnValue({
    resolvedTheme: 'light',
    setTheme: vi.fn(),
    systemTheme: 'light',
    theme: 'light',
    themes: ['light', 'dark', 'system'],
  }),
}));

// Mock the UI components
vi.mock('../../components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button data-testid="button" {...props}>
      {children}
    </button>
  ),
}));

vi.mock('../../components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuContent: ({ children }: any) => (
    <div data-testid="dropdown-menu-content">{children}</div>
  ),
  DropdownMenuItem: ({ children, onClick }: any) => (
    <button data-testid="dropdown-menu-item" onClick={onClick}>
      {children}
    </button>
  ),
  DropdownMenuTrigger: ({ children }: any) => (
    <div data-testid="dropdown-menu-trigger">{children}</div>
  ),
}));

// Mock the icons
vi.mock('@radix-ui/react-icons', () => ({
  MoonIcon: () => <div data-testid="moon-icon" />,
  SunIcon: () => <div data-testid="sun-icon" />,
}));

describe('ModeToggle', () => {
  it('renders the toggle button with icons', () => {
    render(<ModeToggle />);

    expect(screen.getByTestId('button')).toBeInTheDocument();
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    expect(screen.getByText('Toggle theme')).toBeInTheDocument();
  });

  it('renders the dropdown menu with theme options', () => {
    render(<ModeToggle />);

    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-menu-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-menu-content')).toBeInTheDocument();

    // Check for all theme options
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('calls setTheme when a theme option is clicked', () => {
    const setThemeMock = vi.fn();
    vi.mocked(require('next-themes').useTheme).mockReturnValue({
      resolvedTheme: 'light',
      setTheme: setThemeMock,
      systemTheme: 'light',
      theme: 'light',
      themes: ['light', 'dark', 'system'],
    });

    render(<ModeToggle />);

    // Click on each theme option
    const themeOptions = screen.getAllByTestId('dropdown-menu-item');

    // Light theme
    fireEvent.click(themeOptions[0]);
    expect(setThemeMock).toHaveBeenCalledWith('light');

    // Dark theme
    fireEvent.click(themeOptions[1]);
    expect(setThemeMock).toHaveBeenCalledWith('dark');

    // System theme
    fireEvent.click(themeOptions[2]);
    expect(setThemeMock).toHaveBeenCalledWith('system');
  });
});
