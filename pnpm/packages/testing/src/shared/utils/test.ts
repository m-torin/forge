/**
 * Test Utilities
 *
 * Framework-agnostic test utilities that can be used by both Vitest and Cypress.
 */

/**
 * Type definition for a test case
 */
export type TestCase<Input, Expected> = {
  input: Input;
  expected: Expected;
  description: string;
};

/**
 * Creates a set of test cases
 * @param cases - The test cases
 * @returns The test cases
 * @example
 * ```ts
 * const testCases = createTestCases([
 *   { input: 1, expected: 2, description: 'adds 1' },
 *   { input: 2, expected: 3, description: 'adds 1' },
 * ]);
 * ```
 */
export function createTestCases<I, E>(
  cases: TestCase<I, E>[],
): TestCase<I, E>[] {
  return cases;
}

/**
 * Waits for a condition to be true
 * @param condition - The condition to wait for
 * @param timeout - The timeout in milliseconds
 * @param interval - The interval in milliseconds
 * @returns A promise that resolves when the condition is true
 */
export function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100,
): Promise<void> {
  const startTime = Date.now();

  return new Promise<void>((resolve, reject) => {
    const check = async () => {
      try {
        if (await condition()) {
          resolve();
          return;
        }

        if (Date.now() - startTime > timeout) {
          reject(new Error(`Timeout waiting for condition after ${timeout}ms`));
          return;
        }

        setTimeout(check, interval);
      } catch (error) {
        reject(error);
      }
    };

    check();
  });
}

/**
 * Formats a value for display in error messages
 * @param value - The value to format
 * @returns The formatted value
 */
export function formatValue(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  if (Array.isArray(value)) return `[${value.map(formatValue).join(', ')}]`;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * Creates a descriptive error message for test failures
 * @param expected - The expected value
 * @param actual - The actual value
 * @param message - An optional message
 * @returns The error message
 */
export function createErrorMessage(
  expected: unknown,
  actual: unknown,
  message?: string,
): string {
  return `${message ? message + ': ' : ''}Expected ${formatValue(expected)} but got ${formatValue(actual)}`;
}
