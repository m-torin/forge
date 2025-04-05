import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Define a type-only ReactNode to avoid importing React
type ReactNode = any;

/**
 * Setup function to initialize mantine mocks
 */
export function setupMantine() {
  // Common mocks for Mantine components
  vi.mock("@mantine/core", () => ({
    MantineProvider: ({
      children,
      ...props
    }: {
      children: ReactNode;
      [key: string]: any;
    }) => {
      // Use the global React that will be injected by the test environment
      return global.React.createElement(
        "div",
        { "data-testid": "mantine-provider", ...props },
        children,
      );
    },
  }));

  vi.mock("@mantine/hooks", () => ({
    useColorScheme: vi.fn().mockReturnValue("light"),
    useMediaQuery: vi.fn().mockReturnValue(false),
    useHotkeys: vi.fn(),
    useViewportSize: vi.fn().mockReturnValue({ width: 1024, height: 768 }),
  }));

  // Mock Mantine notifications
  vi.mock("@mantine/notifications", () => ({
    notifications: {
      show: vi.fn(),
      error: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    },
  }));
}

export default setupMantine;
