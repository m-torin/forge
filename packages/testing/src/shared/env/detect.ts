/**
 * Framework Detection Utilities
 *
 * This module provides a utility to detect the current testing framework.
 */

/**
 * Detect the current testing framework
 * @returns The detected framework or 'unknown'
 */
export function detectFramework(): "vitest" | "cypress" | "unknown" {
  // Use type assertions to handle globalThis properties
  const isVitest = typeof (globalThis as any).vi !== "undefined";
  const isCypress = typeof (globalThis as any).Cypress !== "undefined";

  if (isVitest) return "vitest";
  if (isCypress) return "cypress";
  return "unknown";
}
