/**
 * React-specific testing utilities
 *
 * This module provides all the utilities needed for testing React components.
 */

// Export React-specific configuration
export { createReactConfig } from '../../configs/react.ts';

// Export React-specific renderer
export {
  render,
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
} from '../../renderers/react.ts';

// Export React-specific mocks
export { MockAuthProvider } from '../../mocks/auth-react.tsx';

// Export React-specific templates
export * as componentTemplate from '../../templates/react/component.test.tsx';
export * as hookTemplate from '../../templates/react/hook.test.tsx';

// Re-export shared utilities for convenience
export * from '../../shared/index.ts';
