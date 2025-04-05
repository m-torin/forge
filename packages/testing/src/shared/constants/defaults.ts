/**
 * Default Testing Constants
 *
 * This file contains standard defaults for testing configuration.
 */

/**
 * Default timeout values in milliseconds
 */
export const defaultTimeouts = {
  /** Timeout for normal command execution */
  command: 4000,
  /** Timeout for page loads */
  pageLoad: 10000,
  /** Timeout for assertions */
  assertion: 5000,
  /** Timeout for API requests */
  request: 5000,
  /** Timeout for animations to complete */
  animation: 1000,
  /** Timeout for component mounting */
  mount: 2000,
};

/**
 * Default viewport sizes
 */
export const defaultViewports = {
  /** Mobile viewport (portrait) */
  mobile: { width: 375, height: 667 },
  /** Tablet viewport (portrait) */
  tablet: { width: 768, height: 1024 },
  /** Desktop viewport */
  desktop: { width: 1280, height: 800 },
  /** Widescreen viewport */
  widescreen: { width: 1920, height: 1080 },
};

/**
 * Default wait options
 */
export const defaultWaitOptions = {
  /** Default timeout for wait operations */
  timeout: 5000,
  /** Default interval between checks during wait operations */
  interval: 50,
  /** Default log option during wait operations */
  log: true,
};

/**
 * Default log options
 */
export const defaultLogOptions = {
  /** Whether to display logs in console */
  console: true,
  /** Whether to display logs in the test runner */
  testRunner: true,
  /** Default log level */
  level: "info",
  /** Whether to include timestamps */
  timestamps: true,
};
