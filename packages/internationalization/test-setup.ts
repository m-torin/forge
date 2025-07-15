// Environment setup for internationalization tests
import { vi } from 'vitest';

// Mock server-only before importing any centralized mocks
vi.mock('server-only', () => ({}));

// Mock environment variables
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('NEXT_PUBLIC_NODE_ENV', 'test');

// Since internationalization doesn't have specific env vars, just set base environment
// Additional mocks can be added here if the package requires specific environment variables
