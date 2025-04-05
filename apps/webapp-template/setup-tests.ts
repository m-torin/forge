// Import shared testing setup
import "@repo/testing/vitest/setup";
import { vi } from "vitest";
// Do not import "@repo/testing/vitest/mantine" as we'll create our own mocks

// Create a comprehensive mock for Mantine components
vi.mock("@mantine/core", () => {
  return {
    MantineProvider: ({
      children,
      ...props
    }: {
      children: any;
      [key: string]: any;
    }) => {
      return global.React.createElement(
        "div",
        { "data-testid": "mantine-provider", ...props },
        children,
      );
    },
    Button: ({ children, ...props }: { children: any; [key: string]: any }) => {
      return global.React.createElement(
        "button",
        { "data-testid": "mantine-button", ...props },
        children,
      );
    },
    AppShell: ({
      children,
      ...props
    }: {
      children: any;
      [key: string]: any;
    }) => {
      return global.React.createElement(
        "div",
        { "data-testid": "mantine-appshell", ...props },
        children,
      );
    },
    Group: ({ children, ...props }: { children: any; [key: string]: any }) => {
      return global.React.createElement(
        "div",
        { "data-testid": "mantine-group", ...props },
        children,
      );
    },
    Text: ({ children, ...props }: { children: any; [key: string]: any }) => {
      return global.React.createElement(
        "span",
        { "data-testid": "mantine-text", ...props },
        children,
      );
    },
    Title: ({ children, ...props }: { children: any; [key: string]: any }) => {
      return global.React.createElement(
        "h1",
        { "data-testid": "mantine-title", ...props },
        children,
      );
    },
    Container: ({
      children,
      ...props
    }: {
      children: any;
      [key: string]: any;
    }) => {
      return global.React.createElement(
        "div",
        { "data-testid": "mantine-container", ...props },
        children,
      );
    },
    Image: ({ ...props }: { [key: string]: any }) => {
      return global.React.createElement("img", {
        "data-testid": "mantine-image",
        ...props,
        alt: props.alt || "",
      });
    },
    useMantineColorScheme: () => ({
      clearColorScheme: vi.fn(),
      colorScheme: "light",
      setColorScheme: vi.fn(),
    }),
  };
});

// Mock Mantine hooks
vi.mock("@mantine/hooks", () => ({
  useColorScheme: vi.fn().mockReturnValue("light"),
  useMediaQuery: vi.fn().mockReturnValue(false),
  useHotkeys: vi.fn(),
  useViewportSize: vi.fn().mockReturnValue({ width: 1024, height: 768 }),
}));

// Mock window.matchMedia for Mantine components
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false, // Default to not matching
    media: query,
    addEventListener: vi.fn(),
    addListener: vi.fn(), // Deprecated but still used
    dispatchEvent: vi.fn(),
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(), // Deprecated but still used
  }),
});

// Add any other project-specific setup here

// Automatically clean up after each test to prevent issues with multiple renders

afterEach(() => {
  cleanup();
});
