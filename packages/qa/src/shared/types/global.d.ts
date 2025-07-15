// Declare modules that don't have TypeScript definitions
declare module '@testing-library/jest-dom';

// Global test utilities
declare global {
  var testUtils: any;
  var testHelpers: any;
}

export {};
