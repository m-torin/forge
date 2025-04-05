// Import shared testing setup
import { vi } from "vitest";

// Mock environment variables
process.env.NODE_ENV = "test";

// Mock @sentry/nextjs
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  init: vi.fn().mockReturnValue({}),
  replayIntegration: vi.fn().mockReturnValue({
    name: "replay",
    setup: vi.fn(),
  }),
}));

// Mock @logtail/next
vi.mock("@logtail/next", () => ({
  log: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock React components for LogProvider
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    createContext: vi.fn().mockImplementation(() => ({
      Provider: ({ children }: { children: React.ReactNode }) => children,
      Consumer: ({ children }: { children: (value: any) => React.ReactNode }) =>
        children({}),
    })),
    useContext: vi.fn().mockReturnValue(console),
  };
});

// Add package-specific setup here
