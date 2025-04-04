import React, { ReactElement } from 'react';
import {
  render as rtlRender,
  renderHook as rtlRenderHook,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Re-export userEvent and renderHook for convenience
export { userEvent, rtlRenderHook as renderHook };

// Base options interface that all render functions extend
interface BaseRenderOptions {
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
  [key: string]: any;
}

/**
 * Basic render function for React components (no providers)
 * @param ui - The component to render
 * @param options - Options for rendering
 * @returns The rendered component and testing utilities
 */
export function render(ui: ReactElement, options: BaseRenderOptions = {}) {
  const { wrapper: Wrapper, ...renderOptions } = options;
  const user = userEvent.setup();

  if (Wrapper) {
    return {
      user,
      ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
    };
  }

  return {
    user,
    ...rtlRender(ui, renderOptions),
  };
}

/**
 * Factory to create custom render functions with providers
 * @param Providers - Array of provider components to wrap the rendered component
 * @returns A render function that wraps the component with the provided providers
 */
export function createRender(
  Providers: Array<React.ComponentType<{ children: React.ReactNode }>> = [],
) {
  return (ui: ReactElement, options: BaseRenderOptions = {}) => {
    const AllProviders = ({ children }: { children: React.ReactNode }) => {
      // Create initial element with children
      let element = React.createElement(React.Fragment, null, children);

      // Apply each Provider in reverse order
      for (let i = Providers.length - 1; i >= 0; i--) {
        const Provider = Providers[i];
        element = React.createElement(Provider, null, element);
      }

      return element;
    };

    return render(ui, { wrapper: AllProviders, ...options });
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';
