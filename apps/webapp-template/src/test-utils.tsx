import { render as rtlRender } from "@testing-library/react";
import React from "react";

/**
 * Custom render function that wraps components with Mantine providers
 */
interface RenderOptions {
  [key: string]: unknown;
}

/**
 * Renders a component with Mantine providers
 * @param ui The component to render
 * @param options Options for rendering
 * @returns The rendered component and testing utilities
 */
function render(
  ui: React.ReactElement,
  options: RenderOptions = {},
): ReturnType<typeof rtlRender> {
  const { ...renderOptions } = options;

  // Create a wrapper that uses the MantineProvider mock from setup-tests.ts
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    // import directly from @mantine/core, which is already mocked in setup-tests.ts
    const { MantineProvider } = require("@mantine/core");
    return <MantineProvider>{children}</MantineProvider>;
  };

  return {
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Re-export everything from testing-library
export * from "@testing-library/react";

// Override render method
export { render };
