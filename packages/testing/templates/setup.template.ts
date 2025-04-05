// Package-specific test setup file
// Used to set up tests with proper utilities and mocks

import * as React from "react";
import { afterAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import * as testingLibrary from "@testing-library/react";

// Local implementation of console mocks
const setupConsoleMocks = () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
};

const restoreConsoleMocks = () => {
  vi.mocked(console.error).mockRestore();
  vi.mocked(console.warn).mockRestore();
};

// Export a createRender function that can be used in tests
export const createRender = () => {
  return (ui: React.ReactElement) => testingLibrary.render(ui);
};

// Export screen for convenience
export const screen = testingLibrary.screen;

// Use the shared testing utilities
setupConsoleMocks(); // Mocks console.error and console.warn

// Clean up console mocks after all tests
afterAll(() => {
  restoreConsoleMocks();
});

// Add component-specific mocks below this line
// For example:
// vi.mock('../../components/some-component', () => ({
//   SomeComponent: () => <div>Mocked Component</div>,
// }));
