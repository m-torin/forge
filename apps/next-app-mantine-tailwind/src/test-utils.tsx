import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { theme } from './app/theme';

/**
 * Custom render function that wraps components with Mantine providers
 */
interface RenderOptions {
  withColorSchemeScript?: boolean;
  [key: string]: any;
}

/**
 * Renders a component with Mantine providers
 * @param ui The component to render
 * @param options Options for rendering
 * @returns The rendered component and testing utilities
 */
function render(ui: React.ReactElement, options: RenderOptions = {}): any {
  const { withColorSchemeScript = false, ...renderOptions } = options;

  // Wrap with MantineProvider
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <>
        {withColorSchemeScript && <ColorSchemeScript />}
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </>
    );
  };

  return {
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { render };
