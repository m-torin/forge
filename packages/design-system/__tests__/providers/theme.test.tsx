import { render, screen } from '../../test-utils';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../../providers/theme';

// Mock next-themes
vi.mock('next-themes', () => ({
  ThemeProvider: ({ children, ...props }: any) => {
    // Create data attributes for testing while avoiding invalid DOM props
    const dataAttributes: any = {};

    // Convert props to data attributes for testing
    Object.keys(props).forEach((key) => {
      const dataKey = `data-${key.toLowerCase()}`;
      if (typeof props[key] === 'boolean') {
        dataAttributes[dataKey] = props[key].toString();
      } else if (Array.isArray(props[key])) {
        dataAttributes[dataKey] = props[key].join(',');
      } else {
        dataAttributes[dataKey] = props[key];
      }
    });

    return (
      <div data-testid="theme-provider" {...dataAttributes}>
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
    expect(themeProvider).toHaveAttribute('data-attribute', 'class');
    expect(themeProvider).toHaveAttribute('data-defaulttheme', 'system');
    expect(themeProvider).toHaveAttribute('data-enablesystem', 'true');
    expect(themeProvider).toHaveAttribute('data-storagekey', 'test-theme');
  });

  it('uses default props when not provided', () => {
    render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>,
    );

    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toHaveAttribute('data-attribute', 'class');
    expect(themeProvider).toHaveAttribute('data-defaulttheme', 'system');
    expect(themeProvider).toHaveAttribute('data-enablesystem', 'true');
  });

  it('disables transitions on theme change', () => {
    render(
      <ThemeProvider disableTransitionOnChange>
        <div>Test Content</div>
      </ThemeProvider>,
    );

    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toHaveAttribute('data-disabletransitiononchange', 'true');
  });

  it('can have custom theme names', () => {
    render(
      <ThemeProvider themes={['light', 'dark', 'custom']}>
        <div>Test Content</div>
      </ThemeProvider>,
    );

    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toHaveAttribute('data-themes', 'light,dark,custom');
  });

  it('accepts custom storage key', () => {
    render(
      <ThemeProvider storageKey="my-app-theme">
        <div>Test Content</div>
      </ThemeProvider>,
    );

    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toHaveAttribute('data-storagekey', 'my-app-theme');
  });
});
