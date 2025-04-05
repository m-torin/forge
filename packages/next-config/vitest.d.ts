/// <reference types="vitest" />

import type { Mock } from "vitest";

interface MockedFunction<T extends (...args: any) => any>
  extends Mock<ReturnType<T>, Parameters<T>> {
  mockImplementation: (
    implementation?: (...args: Parameters<T>) => ReturnType<T>,
  ) => this;
  mockRejectedValue: <U extends ReturnType<T>>(value: any) => this;
  mockResolvedValue: <U extends ReturnType<T>>(value: Awaited<U>) => this;
  mockReturnValue: (value: ReturnType<T>) => this;
}

declare module "vitest" {
  export const describe: {
    (name: string, fn: () => void): void;
    skip: (name: string, fn: () => void) => void;
    only: (name: string, fn: () => void) => void;
  };
  export const it: (name: string, fn: () => void | Promise<void>) => void;
  export const test: typeof it;
  export const expect: any;
  export const beforeEach: (fn: () => void | Promise<void>) => void;
  export const afterEach: (fn: () => void | Promise<void>) => void;
  export const beforeAll: (fn: () => void | Promise<void>) => void;
  export const afterAll: (fn: () => void | Promise<void>) => void;
  export const vi: Vi;

  interface Vi {
    clearAllMocks: () => void;
    fn: <TArgs extends any[] = any[], TReturn = any>(
      implementation?: (...args: TArgs) => TReturn,
    ) => Mock<TReturn, TArgs>;
    isolateModules: (fn: () => void) => void;
    mock: (path: string, factory?: () => any) => Mock<any, any[]>;
    mocked<T extends (...args: any[]) => any>(
      item: T,
    ): MockedFunction<T> & {
      mock: { results: { value: any }[] };
      mockReturnValueOnce: (value: ReturnType<T>) => MockedFunction<T>;
    };
    mocked<T>(item: T): {
      [K in keyof T]: T[K] extends (...args: any[]) => any
        ? MockedFunction<T[K]> & {
            mock: { results: { value: any }[] };
            mockReturnValueOnce: (
              value: ReturnType<T[K]>,
            ) => MockedFunction<T[K]>;
          }
        : T[K];
    } & { mock: { results: { value: any }[] } };
    resetAllMocks: () => void;
    resetModules: () => void;
    restoreAllMocks: () => void;
    stubEnv: (key: string, value: string) => void;
  }
}

declare module "@repo/testing" {
  export const vitest: any;
}

// Add Next.js specific types
declare module "next/dist/server/config" {
  interface NextConfigComplete extends Required<NextConfig> {
    [key: string]: any;
    allowedDevOrigins: any;
    eslint: any;
    exportPathMap: any;
    headers: any;
    i18n: any;
    redirects: any;
    rewrites: any;
    typescript: any;
  }

  interface WebpackConfigContext {
    [key: string]: any;
    buildId: string;
    config: NextConfigComplete;
    defaultLoaders: any;
    dev: boolean;
    dir: string;
    isServer: boolean;
    totalPages: number;
    webpack: any;
  }

  interface Rewrite {
    [key: string]: any;
    destination: string;
    source: string;
  }

  interface NextConfig {
    [key: string]: any;
    rewrites?: () => Promise<
      | Rewrite[]
      | {
          beforeFiles?: Rewrite[];
          afterFiles?: Rewrite[];
          fallback?: Rewrite[];
        }
    >;
    webpack?: (config: any, options: WebpackConfigContext) => any;
  }
}
