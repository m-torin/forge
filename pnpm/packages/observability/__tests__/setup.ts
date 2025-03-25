// Import shared testing setup
import { vi } from 'vitest';

// Mock environment variables
process.env.NODE_ENV = 'test';

// Mock @sentry/nextjs
vi.mock('@sentry/nextjs', () => ({
  init: vi.fn().mockReturnValue({}),
  captureException: vi.fn(),
  replayIntegration: vi.fn().mockReturnValue({
    name: 'replay',
    setup: vi.fn(),
  }),
}));

// Mock @logtail/next
vi.mock('@logtail/next', () => ({
  log: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock React components for LogProvider
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    createContext: vi.fn().mockImplementation(() => ({
      Provider: ({ children }) => children,
      Consumer: ({ children }) => children({}),
    })),
    useContext: vi.fn().mockReturnValue(console),
  };
});

// Add package-specific setup here
