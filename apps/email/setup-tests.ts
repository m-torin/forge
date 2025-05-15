// Import shared testing setup
import "@repo/testing/vitest/setup";
import React from "react";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom"; // Import jest-dom matchers

// Make React available globally for JSX in tests
global.React = React;

// Add project-specific setup here

// Automatically clean up after each test
afterEach(() => {
  cleanup();
});
