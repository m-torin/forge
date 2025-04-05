// Declare vitest globals without using reference
declare global {
  // Define vitest functions and variables
  const vi: {
    fn: <TArgs extends any[] = any[], TReturn = any>() => jest.Mock<
      TReturn,
      TArgs
    >;
    mock: (path: string, factory?: () => any) => jest.Mock;
    spyOn: (obj: any, method: string) => jest.Mock;
    stubEnv: (key: string, value: string) => any;
    unstubEnv: (key: string) => any;
    restoreAllMocks: () => void;
    resetAllMocks: () => void;
    clearAllMocks: () => void;
    resetModules: () => void;
  };
  const describe: (name: string, fn: () => void) => void;
  const it: (
    name: string,
    fn: () => void | Promise<void>,
    timeout?: number,
  ) => void;
  const test: typeof it;
  const expect: any;
  const beforeAll: (fn: () => void | Promise<void>, timeout?: number) => void;
  const afterAll: (fn: () => void | Promise<void>, timeout?: number) => void;
  const beforeEach: (fn: () => void | Promise<void>, timeout?: number) => void;
  const afterEach: (fn: () => void | Promise<void>, timeout?: number) => void;
}

// Define mock functions
declare module "vitest" {
  export const vi: {
    fn: <TArgs extends any[] = any[], TReturn = any>() => jest.Mock<
      TReturn,
      TArgs
    >;
    mock: (path: string, factory?: () => any) => jest.Mock;
    spyOn: (obj: any, method: string) => jest.Mock;
    stubEnv: (key: string, value: string) => any;
    unstubEnv: (key: string) => any;
    restoreAllMocks: () => void;
    resetAllMocks: () => void;
    clearAllMocks: () => void;
    resetModules: () => void;
  };

  export const describe: (name: string, fn: () => void) => void;
  export const it: (
    name: string,
    fn: () => void | Promise<void>,
    timeout?: number,
  ) => void;
  export const test: typeof it;
  export const expect: any;
  export const beforeAll: (
    fn: () => void | Promise<void>,
    timeout?: number,
  ) => void;
  export const afterAll: (
    fn: () => void | Promise<void>,
    timeout?: number,
  ) => void;
  export const beforeEach: (
    fn: () => void | Promise<void>,
    timeout?: number,
  ) => void;
  export const afterEach: (
    fn: () => void | Promise<void>,
    timeout?: number,
  ) => void;
}

// Add Jest types for compatibility
declare namespace jest {
  interface Mock<T = any, Y extends any[] = any[]> {
    (...args: Y): T;
    mockImplementation: (fn: (...args: Y) => T) => this;
    mockReturnValue: (val: T) => this;
    mockReturnValueOnce: (val: T) => this;
    mockResolvedValue: <U extends Promise<any>>(val: Awaited<U>) => this;
    mockResolvedValueOnce: <U extends Promise<any>>(val: Awaited<U>) => this;
    mockRejectedValue: (val: any) => this;
    mockRejectedValueOnce: (val: any) => this;
    getMockName: () => string;
    mockName: (name: string) => this;
    mockClear: () => this;
    mockReset: () => this;
    mockRestore: () => this;
    mockReturnThis: () => this;
    mockImplementationOnce: (fn: (...args: Y) => T) => this;
    mockImplementation: (fn: (...args: Y) => T) => this;
    mockReturnThis: () => this;
    mockResolvedValueOnce: <U extends Promise<any>>(val: Awaited<U>) => this;
    mockResolvedValue: <U extends Promise<any>>(val: Awaited<U>) => this;
    mockRejectedValueOnce: (val: any) => this;
    mockRejectedValue: (val: any) => this;
    mockReturnValueOnce: (val: T) => this;
    mockReturnValue: (val: T) => this;
    mockClear: () => this;
    mockReset: () => this;
    mockRestore: () => this;
  }
}

// Define vitest config
declare module "vitest/config" {
  export interface UserConfig {
    test?: any;
    plugins?: any[];
    resolve?: any;
    [key: string]: any;
  }

  export const defineConfig: (config: UserConfig) => UserConfig;
  export const mergeConfig: (
    baseConfig: UserConfig,
    extendConfig: UserConfig,
  ) => UserConfig;

  export interface CoverageOptions {
    provider?: string;
    all?: boolean;
    reporter?: string[];
    exclude?: string[];
    thresholds?: {
      statements: number;
      branches: number;
      functions: number;
      lines: number;
    };
    [key: string]: any;
  }

  export interface CoverageV8Options extends CoverageOptions {}
  export interface CoverageIstanbulOptions extends CoverageOptions {}
  export interface CustomProviderOptions extends CoverageOptions {}
}

// Provide types for missing modules
declare module "@repo/testing/vitest/mantine" {
  import { RenderOptions } from "@testing-library/react";
  import { RenderResult } from "@testing-library/react";

  export function render(
    ui: React.ReactElement,
    options?: Omit<RenderOptions, "queries">,
  ): RenderResult;
}
