/**
 * Globals setup - must be imported before jest-dom
 * Makes vitest globals available for @testing-library/jest-dom and tests
 */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

// Make vitest globals available for @testing-library/jest-dom and tests
// @ts-expect-error - Adding to global scope for jest-dom and test compatibility
globalThis.expect = expect;
// @ts-expect-error - Adding to global scope
globalThis.test = test;
// @ts-expect-error - Adding to global scope
globalThis.it = it;
// @ts-expect-error - Adding to global scope
globalThis.describe = describe;
// @ts-expect-error - Adding to global scope
globalThis.beforeEach = beforeEach;
// @ts-expect-error - Adding to global scope
globalThis.afterEach = afterEach;
// @ts-expect-error - Adding to global scope
globalThis.beforeAll = beforeAll;
// @ts-expect-error - Adding to global scope
globalThis.afterAll = afterAll;
// @ts-expect-error - Adding to global scope
globalThis.vi = vi;
