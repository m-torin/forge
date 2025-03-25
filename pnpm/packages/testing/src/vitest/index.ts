/**
 * Testing Utilities - Direct Export Approach
 *
 * This module provides testing utilities as direct exports:
 * import { render, screen, fireEvent, renderHook } from '@repo/testing/vitest';
 * import { render as mantineRender } from '@repo/testing/vitest/mantine';
 * import { createServerConfig } from '@repo/testing/vitest/server';
 *
 * BREAKING CHANGE: Namespace exports have been removed in favor of direct exports.
 */

// Direct exports from React - these are the primary exports
export {
  // React renderer
  render,
  renderHook,
  screen,
  within,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
  act,
  cleanup,
  createEvent,
  prettyDOM,
  getNodeText,
  getQueriesForElement,
  buildQueries,
  queries,
  queryHelpers,
  userEvent,
} from './renderers/react.ts';

// Export configurations
export { createReactConfig } from './configs/react.ts';
export { createBaseConfig } from './configs/base.ts';

// Export React mocks
export { MockAuthProvider } from './mocks/auth-react.tsx';

// Re-export Vitest functions for convenience
export {
  vi,
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from 'vitest';

// Export templates directly
export { default as componentTestTemplate } from './templates/react/component.test.tsx';
export { default as hookTestTemplate } from './templates/react/hook.test.tsx';
