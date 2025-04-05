/**
 * Mock Utilities
 *
 * Framework-agnostic mock utilities that can be used by both Vitest and Cypress.
 */

/**
 * Type definition for a mock function
 */
export type MockFunction<Args extends any[] = any[], Return = any> = ((
  ...args: Args
) => Return) & {
  calls: Args[];
  results: Return[];
  mockClear: () => void;
  mockReset: () => void;
  mockImplementation: (
    implementation: (...args: Args) => Return,
  ) => MockFunction<Args, Return>;
  mockReturnValue: (value: Return) => MockFunction<Args, Return>;
  mockResolvedValue: (value: Awaited<Return>) => MockFunction<Args, Return>;
  mockRejectedValue: (error: any) => MockFunction<Args, Return>;
};

/**
 * Type definition for mock options
 */
export interface MockOptions {
  name?: string;
  implementation?: (...args: any[]) => any;
}

/**
 * Type definition for fetch mock options
 */
export interface FetchMockOptions {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  body?: any;
  delay?: number;
  throwError?: boolean;
}

/**
 * Type definition for a mock response
 */
export interface MockResponse<T = any> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: T;
  json: () => Promise<T>;
  text: () => Promise<string>;
  blob: () => Promise<Blob>;
}

/**
 * Creates a mock response object
 * @param options - The mock response options
 * @returns A mock response object
 */
export function createMockResponse<T = any>(
  options: FetchMockOptions = {},
): MockResponse<T> {
  const {
    status = 200,
    statusText = "OK",
    headers = { "Content-Type": "application/json" },
    body = {},
  } = options;

  return {
    status,
    statusText,
    headers,
    body: body as T,
    json: () => Promise.resolve(body as T),
    text: () =>
      Promise.resolve(typeof body === "string" ? body : JSON.stringify(body)),
    blob: () =>
      Promise.resolve(
        new Blob([typeof body === "string" ? body : JSON.stringify(body)]),
      ),
  };
}

/**
 * Type definition for storage mock
 */
export interface StorageMock {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  key: (index: number) => string | null;
  length: number;
  [key: string]: any;
}

/**
 * Creates a mock storage object (localStorage, sessionStorage)
 * @returns A mock storage object
 */
export function createStorageMock(): StorageMock {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => Object.keys(store)[index] || null,
    get length() {
      return Object.keys(store).length;
    },
  };
}
