import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { render as rtlRender } from '@testing-library/react';

import type { RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';

// Types for providers
interface TestProviderProps {
  children: ReactNode;
  colorScheme?: 'light' | 'dark' | 'auto';
  locale?: string;
  theme?: any;
}

// Base providers wrapper
export function TestProviders({
  children,
  colorScheme = 'light',
  locale = 'en',
  theme = {},
}: TestProviderProps) {
  return (
    <MantineProvider defaultColorScheme={colorScheme} theme={theme}>
      <Notifications position="top-right" />
      {children}
    </MantineProvider>
  );
}

// Custom render options
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  colorScheme?: 'light' | 'dark' | 'auto';
  locale?: string;
  theme?: any;
  wrapper?: React.ComponentType<any>;
}

// Custom render function
export function render(
  ui: ReactElement,
  options?: CustomRenderOptions,
): ReturnType<typeof rtlRender> {
  const { colorScheme, locale, theme, wrapper, ...renderOptions } = options || {};

  // If custom wrapper provided, use it
  if (wrapper) {
    return rtlRender(ui, { wrapper, ...renderOptions });
  }

  // Otherwise use default test providers
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders colorScheme={colorScheme} locale={locale} theme={theme}>
      {children}
    </TestProviders>
  );

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Helper to render with dark mode
export function renderDark(
  ui: ReactElement,
  options?: Omit<CustomRenderOptions, 'colorScheme'>,
): ReturnType<typeof rtlRender> {
  return render(ui, { ...options, colorScheme: 'dark' });
}

// Helper to render with specific locale
export function renderWithLocale(
  ui: ReactElement,
  locale: string,
  options?: Omit<CustomRenderOptions, 'locale'>,
): ReturnType<typeof rtlRender> {
  return render(ui, { ...options, locale });
}
