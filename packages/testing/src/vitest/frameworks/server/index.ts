/**
 * Server-specific testing utilities
 *
 * This module provides all the utilities needed for testing server-side code.
 */
import { vi } from "vitest";

// Export Server-specific configuration
export { createServerConfig } from "../../configs/server.ts";

// Export Server-specific mocks
export {
  // Re-export auth-node mocks
  mockUsers,
  mockUseAuth,
  mockClerk,
  mockAuthMiddleware,
  mockLiveblocksAuth,
  mockAuthService,
  setupAuthMocks,
} from "../../mocks/auth-node.ts";

// Export Server-specific templates
export * as keysTemplate from "../../templates/core/keys.test.ts";
export * as utilityTemplate from "../../templates/core/utility.test.ts";

// Re-export shared utilities for convenience
export * from "../../shared/index.ts";

// Additional server-specific utilities
export const mockRequest = (overrides = {}) => ({
  headers: { "content-type": "application/json" },
  query: {},
  cookies: {},
  body: {},
  ...overrides,
});

export const mockResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.setHeader = vi.fn().mockReturnValue(res);
  res.cookie = vi.fn().mockReturnValue(res);
  res.clearCookie = vi.fn().mockReturnValue(res);
  res.end = vi.fn().mockReturnValue(res);
  return res;
};

export const mockNext = vi.fn();
