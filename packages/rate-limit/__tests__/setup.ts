// Import shared testing setup
// Import core testing functionality
import { vi } from "vitest";

// Add package-specific setup here

// Mock the keys module to provide test environment variables
vi.mock("../keys", () => ({
  keys: vi.fn().mockImplementation(() => {
    // Return values from environment variables or default test values
    return {
      UPSTASH_REDIS_REST_TOKEN:
        process.env.UPSTASH_REDIS_REST_TOKEN || "test-upstash-redis-token",
      UPSTASH_REDIS_REST_URL:
        process.env.UPSTASH_REDIS_REST_URL ||
        "https://test-upstash-redis-url.com",
    };
  }),
}));

// Mock Upstash Redis
vi.mock("@upstash/redis", () => {
  return {
    Redis: vi.fn().mockImplementation(() => ({
      expire: vi.fn().mockResolvedValue("OK"),
      get: vi.fn().mockResolvedValue(0),
      incr: vi.fn().mockResolvedValue(1),
    })),
  };
});
