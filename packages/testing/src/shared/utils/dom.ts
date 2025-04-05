/**
 * DOM Utilities
 *
 * Framework-agnostic DOM utilities that can be used by both Vitest and Cypress.
 */

/**
 * Formats a string as a test ID
 * @param name - The name to format
 * @returns A formatted test ID
 * @example
 * ```ts
 * formatTestId('Submit Button') // 'test-submit-button'
 * ```
 */
export function formatTestId(name: string): string {
  return `test-${name.toLowerCase().replace(/\s+/g, "-")}`;
}

/**
 * Creates a data-testid selector
 * @param testId - The test ID
 * @returns A CSS selector for the test ID
 * @example
 * ```ts
 * dataTestIdSelector('submit-button') // '[data-testid="submit-button"]'
 * ```
 */
export function dataTestIdSelector(testId: string): string {
  return `[data-testid="${testId}"]`;
}

/**
 * Creates an aria-label selector
 * @param label - The aria label
 * @returns A CSS selector for the aria label
 * @example
 * ```ts
 * ariaLabelSelector('Submit') // '[aria-label="Submit"]'
 * ```
 */
export function ariaLabelSelector(label: string): string {
  return `[aria-label="${label}"]`;
}

/**
 * Checks if an element is visible
 * @param element - The element to check
 * @returns Whether the element is visible
 */
export function isElementVisible(element: HTMLElement): boolean {
  if (!element) return false;

  const style = window.getComputedStyle(element);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0" &&
    element.offsetWidth > 0 &&
    element.offsetHeight > 0
  );
}

/**
 * Gets text content from an element with whitespace normalized
 * @param element - The element to get text from
 * @returns The normalized text content
 */
export function getNormalizedText(element: HTMLElement): string {
  return (element.textContent || "").trim().replace(/\s+/g, " ");
}

/**
 * Type definitions for common DOM elements
 */
export type DOMElement = HTMLElement | SVGElement | Element;
export type DOMSelector = string | DOMElement;
