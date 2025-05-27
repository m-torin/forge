import { vi } from 'vitest';

// Mock server-only module to avoid errors in tests
vi.mock('server-only', () => {
  return {
    // Empty mock
  };
});

// Mock environment variables
process.env.DEEPSEEK_API_KEY = 'test_api_key';

// Mock the languine.json file for consistent test data
vi.mock('./languine.json', () => ({
  default: {
    locale: {
      source: 'en',
      targets: ['es', 'fr', 'de', 'pt', 'zh'],
    },
  },
}));
