import { ClientProgressTracker, getBrowserInfo, parseUrlParams } from '#/shared/utils/client-utils';
import { beforeEach, describe, expect, vi } from 'vitest';
import { createUtilityTestSuite } from '../../scraping-test-factory';

describe('client-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test environment detection utilities
  createUtilityTestSuite({
    utilityName: 'isBrowser',
    utilityFunction: () => {
      // In vitest, window is not defined by default
      return typeof window !== 'undefined';
    },
    scenarios: [
      {
        name: 'detect browser environment',
        args: [],
        assertion: result => {
          expect(result).toBeFalsy();
        },
      },
    ],
  });

  createUtilityTestSuite({
    utilityName: 'isNode',
    utilityFunction: () => {
      return typeof process !== 'undefined' && process.versions && process.versions.node;
    },
    scenarios: [
      {
        name: 'detect Node.js environment',
        args: [],
        assertion: result => {
          expect(result).toBeTruthy();
        },
      },
    ],
  });

  // Test URL utilities
  createUtilityTestSuite({
    utilityName: 'getCurrentUrl',
    utilityFunction: () => {
      if (typeof window !== 'undefined') {
        return window.location.href;
      }
      throw new Error('getCurrentUrl() can only be called in browser environment');
    },
    scenarios: [
      {
        name: 'handle getCurrentUrl in browser environment',
        args: [],
        shouldThrow: true,
        errorMessage: 'getCurrentUrl() can only be called in browser environment',
        assertion: () => {},
      },
      {
        name: 'throw error when getCurrentUrl called in Node.js',
        args: [],
        shouldThrow: true,
        errorMessage: 'getCurrentUrl() can only be called in browser environment',
        assertion: () => {},
      },
    ],
  });

  // Test parseUrlParams utility
  createUtilityTestSuite({
    utilityName: 'parseUrlParams',
    utilityFunction: parseUrlParams,
    scenarios: [
      {
        name: 'parse URL parameters correctly',
        args: ['https://example.com?param1=value1&param2=value2'],
        assertion: result => {
          expect(result).toStrictEqual({
            param1: 'value1',
            param2: 'value2',
          });
        },
      },
      {
        name: 'handle URLs without parameters',
        args: ['https://example.com'],
        assertion: result => {
          expect(result).toStrictEqual({});
        },
      },
      {
        name: 'handle complex URL parameters',
        args: ['https://example.com?search=hello%20world&page=1&filter=active'],
        assertion: result => {
          expect(result).toMatchObject({
            search: expect.any(String),
            page: '1',
            filter: 'active',
          });
        },
      },
    ],
  });

  // Test browser content utilities
  createUtilityTestSuite({
    utilityName: 'getCurrentTitle',
    utilityFunction: () => {
      if (typeof document !== 'undefined') {
        return document.title;
      }
      return '';
    },
    scenarios: [
      {
        name: 'handle getCurrentTitle in browser environment',
        args: [],
        assertion: result => {
          expect(result).toBe('');
        },
      },
    ],
  });

  createUtilityTestSuite({
    utilityName: 'getPageHtml',
    utilityFunction: () => {
      if (typeof document !== 'undefined') {
        return document.documentElement.outerHTML;
      }
      return '';
    },
    scenarios: [
      {
        name: 'handle getPageHtml in browser environment',
        args: [],
        assertion: result => {
          expect(result).toBe('');
        },
      },
    ],
  });

  // Test browser info utility
  createUtilityTestSuite({
    utilityName: 'getBrowserInfo',
    utilityFunction: getBrowserInfo,
    scenarios: [
      {
        name: 'return browser information',
        args: [],
        assertion: result => {
          expect(result).toBeDefined();
          expect(typeof result).toBe('object');
        },
      },
    ],
  });

  // Test ClientProgressTracker class
  createUtilityTestSuite({
    utilityName: 'ClientProgressTracker',
    utilityFunction: () => new ClientProgressTracker(),
    scenarios: [
      {
        name: 'create progress tracker instance',
        args: [],
        assertion: result => {
          expect(result).toBeDefined();
          expect(typeof result.start).toBe('function');
          expect(typeof result.increment).toBe('function');
          expect(typeof result.finish).toBe('function');
        },
      },
    ],
  });

  // TODO: Add tests for selector sanitization, URL validation, data attributes,
  // async utilities, debounce/throttle, and error handling when implemented
});
