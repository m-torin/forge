/**
 * Centralized Provider Mocks Integration
 *
 * Automatically sets up common observability and service provider mocks
 * by calling the existing centralized mock setup functions.
 * This avoids duplication while making provider mocks automatically available.
 */

// Import existing centralized mock setup functions
import { vi } from "vitest";
import { setupLogtailMocks } from "../mocks/providers/logtail";
import { setupLogTapeMocks } from "../mocks/providers/logtape";
import { setupSentryMocks } from "../mocks/providers/sentry";
import { setupVercelAnalyticsMocks } from "../mocks/providers/vercel-analytics";

// Set up Sentry mocks (covers @sentry/node, @sentry/browser, @sentry/nextjs)
setupSentryMocks({
  package: "@sentry/node", // Default for server environments
  includeIntegrations: true,
  includePerformance: true,
  includeReplays: true,
  includeProfiles: true,
});

// Set up Logtail/BetterStack mocks (covers @logtail/js, @logtail/node, @logtail/next)
setupLogtailMocks({
  package: "@logtail/js", // Default package
  includeContextMethods: true,
});

// Set up LogTape mocks (covers @logtape/logtape and related packages)
setupLogTapeMocks({
  includeSinks: true,
  includeAsyncHooks: true,
});

// Set up Vercel Analytics mocks (covers @vercel/analytics packages)
setupVercelAnalyticsMocks();

// Additional common mocks that aren't covered by the provider factories
vi.mock("server-only", () => ({}));

// Console log suppression for cleaner test output (preserve existing behavior)
const originalConsole = console;
global.console = {
  ...originalConsole,
  error: vi.fn(),
  warn: vi.fn(),
  // Keep log and info for debugging if needed
  log: originalConsole.log,
  info: originalConsole.info,
};
