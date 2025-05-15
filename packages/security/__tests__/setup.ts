// Import shared testing setup
import "@repo/testing/vitest/setup";
import { vi } from "vitest";

// Add package-specific setup here

// Mock environment variables for tests
vi.mock("@t3-oss/env-nextjs", () => ({
  createEnv: vi.fn().mockImplementation(({ runtimeEnv }) => runtimeEnv),
}));

// Setup test environment variables
process.env.ARCJET_KEY = "ajkey_test_arcjet_key";
