/**
 * Rendering utilities for component testing
 */

// Export React renderer
export * from "./react.ts";

// Export Mantine renderer with renamed exports to avoid conflicts
import {
  render as mantineRender,
  screen,
  within,
  fireEvent,
  waitFor,
} from "./mantine.ts";
export { mantineRender, screen, within, fireEvent, waitFor };
