import {
  render as testingLibraryRender,
  RenderOptions,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Define types for React elements
type ReactElement = any;
type ReactNode = any;

// Define types for Mantine components since we can't import them directly
interface MantineProviderProps {
  theme?: Record<string, any>;
  colorScheme?: 'light' | 'dark';
  withGlobalStyles?: boolean;
  withNormalizeCSS?: boolean;
  children?: ReactNode;
}

// Mock the MantineProvider component
const MantineProvider = (props: MantineProviderProps) => {
  // We can use the global React instance that's injected in the test setup
  return global.React.createElement(
    'div',
    { 'data-testid': 'mantine-provider' },
    props.children,
  );
};

// Base options interface
interface BaseMantineRenderOptions extends RenderOptions {
  colorScheme?: 'light' | 'dark';
  withGlobalStyles?: boolean;
  withNormalizeCSS?: boolean;
  theme?: Record<string, any>;
}

type RenderResult = ReturnType<typeof testingLibraryRender> & {
  user: ReturnType<typeof userEvent.setup>;
};

/**
 * Render function for Mantine components
 * @param ui - The component to render
 * @param options - Options for rendering, including Mantine provider options
 * @returns The rendered component and testing utilities
 */
export function render(
  ui: ReactElement,
  options: BaseMantineRenderOptions = {},
): RenderResult {
  const {
    colorScheme = 'light',
    withGlobalStyles = true,
    withNormalizeCSS = true,
    theme = {},
    ...renderOptions
  } = options;

  // Setup user event
  const user = userEvent.setup();

  // Wrap in Mantine provider
  const Wrapper = ({ children }: { children: ReactNode }) => {
    const content = global.React.createElement(
      MantineProvider,
      {
        theme: { ...theme, colorScheme },
        withGlobalStyles,
        withNormalizeCSS,
      },
      children,
    );

    return content;
  };

  return {
    user,
    ...testingLibraryRender(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';
