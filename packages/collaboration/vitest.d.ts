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
  export const describe: (name: string, fn: () => void) => void;
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
    fn: <TArgs extends any[] = any[], TReturn = any>() => Mock<TReturn, TArgs>;
    mock: (path: string, factory?: () => any) => Mock<any, any[]>;
    mocked<T extends (...args: any[]) => any>(
      item: T,
    ): MockedFunction<T> & { mock: { results: { value: any }[] } };
    mocked<T>(item: T): {
      [K in keyof T]: T[K] extends (...args: any[]) => any
        ? MockedFunction<T[K]> & { mock: { results: { value: any }[] } }
        : T[K];
    } & { mock: { results: { value: any }[] } };
    resetModules: () => void;
  }
}
