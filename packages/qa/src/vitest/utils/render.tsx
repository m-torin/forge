import { MantineProvider } from '@mantine/core';
import type { RenderOptions, RenderResult } from '@testing-library/react';
import { render as rtlRender } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import * as React from 'react';

// Types for providers
interface TestProviderProps {
  children: ReactNode;
  colorScheme?: 'light' | 'dark' | 'auto';
  theme?: any;
  locale?: string;
}

// Base providers wrapper
export function TestProviders({ children, colorScheme = 'light', theme = {} }: TestProviderProps) {
  const testTheme = {
    ...theme,
    forceColorScheme: colorScheme as 'light' | 'dark',
  };

  return <MantineProvider theme={testTheme}>{children}</MantineProvider>;
}

// Custom render options
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Mantine-specific options
  colorScheme?: 'light' | 'dark' | 'auto';
  theme?: any;
  locale?: string;

  // Router/navigation options
  route?: string;

  // Custom providers
  providers?: React.ComponentType<{ children: ReactNode }>;
  wrapper?: React.ComponentType<{ children: ReactNode }>;

  // User event options
  userEventOptions?: Parameters<typeof userEvent.setup>[0];
}

// Extended render result with user event instance
interface CustomRenderResult extends RenderResult {
  user: ReturnType<typeof userEvent.setup>;
}

/**
 * Custom render function that wraps components with common providers
 * and sets up user event automatically
 */
export function render(ui: ReactElement, options: CustomRenderOptions = {}): CustomRenderResult {
  const {
    colorScheme,
    theme,
    locale,
    route = '/',
    providers: CustomProviders,
    wrapper: CustomWrapper,
    userEventOptions,
    ...renderOptions
  } = options;

  // Set up the URL before rendering
  if (route && typeof window !== 'undefined') {
    window.history.pushState({}, 'Test page', route);
  }

  // Create a user event instance
  const user = userEvent.setup(userEventOptions);

  // Create wrapper with all providers
  const Wrapper = ({ children }: { children: ReactNode }) => {
    // If custom wrapper provided, use it exclusively
    if (CustomWrapper) {
      return <CustomWrapper>{children}</CustomWrapper>;
    }

    // If custom providers provided, wrap with Mantine providers
    if (CustomProviders) {
      return (
        <TestProviders colorScheme={colorScheme} theme={theme} locale={locale}>
          <CustomProviders>{children}</CustomProviders>
        </TestProviders>
      );
    }

    // Default: just Mantine providers
    return (
      <TestProviders colorScheme={colorScheme} theme={theme} locale={locale}>
        {children}
      </TestProviders>
    );
  };

  // Render with the wrapper
  const result = rtlRender(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    ...result,
    user,
  };
}

// Helper to render with dark mode
export function renderDark(
  ui: ReactElement,
  options?: Omit<CustomRenderOptions, 'colorScheme'>,
): CustomRenderResult {
  return render(ui, { ...options, colorScheme: 'dark' });
}

// Helper to render with specific locale
export function renderWithLocale(
  ui: ReactElement,
  locale: string,
  options?: Omit<CustomRenderOptions, 'locale'>,
): CustomRenderResult {
  return render(ui, { ...options, locale });
}

// Helper to render without any providers (for testing provider behavior)
export function renderBare(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult {
  return rtlRender(ui, options);
}

// Re-export everything from testing library for convenience
export * from '@testing-library/react';
export { userEvent };

// Export the TestProviders component for custom usage
export { TestProviders as AllTheProviders };

/**
 * @deprecated Use `render` from '@repo/qa/vitest/utils/render' instead
 * This export maintains backward compatibility
 */
export { render as customRender };
