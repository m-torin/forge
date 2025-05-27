import { render, screen } from '../../test-utils';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../../providers/theme';

// Mock next-themes
vi.mock('next-themes', () => ({
  ThemeProvider: ({ children, ...props }: any) => {
    const filteredProps: any = {};
    // Convert boolean props to strings for DOM attributes
    Object.keys(props).forEach((key) => {
      if (typeof props[key] === 'boolean') {
        filteredProps[key] = props[key].toString();
      } else if (Array.isArray(props[key])) {
        filteredProps[key] = props[key].join(',');
      } else {
        filteredProps[key] = props[key];
      }
    });

    return (
      <div data-testid="theme-provider" {...filteredProps}>
        {children}
      </div>
    );
  },
}));

describe('ThemeProvider', () => {
  it('renders children correctly', () => {
    render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>,
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('passes props to next-themes ThemeProvider', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="test-theme">
        <div>Test Content</div>
      </ThemeProvider>,
    );

    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toHaveAttribute('attribute', 'class');
    expect(themeProvider).toHaveAttribute('defaultTheme', 'system');
    expect(themeProvider).toHaveAttribute('enableSystem', 'true');
    expect(themeProvider).toHaveAttribute('storageKey', 'test-theme');
  });

  it('uses default props when not provided', () => {
    render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>,
    );

    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toHaveAttribute('attribute', 'class');
    expect(themeProvider).toHaveAttribute('defaultTheme', 'system');
    expect(themeProvider).toHaveAttribute('enableSystem', 'true');
  });

  it('disables transitions on theme change', () => {
    render(
      <ThemeProvider disableTransitionOnChange>
        <div>Test Content</div>
      </ThemeProvider>,
    );

    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toHaveAttribute('disableTransitionOnChange', 'true');
  });

  it('can have custom theme names', () => {
    render(
      <ThemeProvider themes={['light', 'dark', 'custom']}>
        <div>Test Content</div>
      </ThemeProvider>,
    );

    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toHaveAttribute('themes', 'light,dark,custom');
  });

  it('accepts custom storage key', () => {
    render(
      <ThemeProvider storageKey="my-app-theme">
        <div>Test Content</div>
      </ThemeProvider>,
    );

    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toHaveAttribute('storageKey', 'my-app-theme');
  });
});
