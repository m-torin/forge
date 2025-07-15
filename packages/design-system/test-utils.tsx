import { createTheme, DEFAULT_THEME, MantineProvider } from '@mantine/core';
import { render as rtlRender } from '@testing-library/react';
import React from 'react';

// Create a minimal theme for testing
const testTheme = createTheme({
  colors: {
    dark: DEFAULT_THEME.colors.gray,
  },
  fontFamily: 'sans-serif',
  fontFamilyMonospace: 'monospace',
  primaryColor: 'dark',
});

interface WrapperProps extends Record<string, any> {
  children: React.ReactNode;
}

export function render(ui: React.ReactElement, options = {}) {
  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

function Wrapper({ children }: WrapperProps) {
  return (
    <MantineProvider forceColorScheme="light" theme={testTheme}>
      {children}
    </MantineProvider>
  );
}

// Re-export everything from testing-library
export * from '@testing-library/react';
