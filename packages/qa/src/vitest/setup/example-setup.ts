// Example test setup file showing how to use centralized mocks
// Copy this to your app's vitest.setup.ts and customize as needed

import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';

// Import centralized mocks and setup functions
import { resetAllMocks } from '../mocks';
import { cleanupSRHRedisEnvironment, setupSRHRedisEnvironment } from '../mocks/upstash-redis';

// Global test setup
beforeAll(() => {
  // Set up Redis mock environment if needed
  setupSRHRedisEnvironment();

  // Add any app-specific setup here
});

// Reset mocks before each test
beforeEach(() => {
  resetAllMocks();
});

// Clean up after each test if needed
afterEach(() => {
  // Add any test-specific cleanup here
});

// Global test cleanup
afterAll(() => {
  // Clean up Redis mock environment
  cleanupSRHRedisEnvironment();

  // Add any app-specific cleanup here
});

// Example of adding global test helpers
global.testHelpers = {
  // Add your custom test helpers here
  createTestUser: () => ({
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
  }),
};

// Example of setting up custom environment variables
process.env.TEST_SPECIFIC_VAR = 'test-value';
