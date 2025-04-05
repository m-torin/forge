/// <reference types="vitest" />

import type { FC } from "react";
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

declare module "@repo/testing/vitest" {
  export const render: any;
  export const screen: any;
  export const fireEvent: any;
  export const waitFor: any;
  export const act: any;
  export const cleanup: any;
  export const within: any;
}

declare module "@repo/testing" {
  export const vitest: any;
}

// Add mock types for React components
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "mock-component": any;
    }
  }
}

// Add mock types for Knock components
interface NotificationFeedPopoverProps {
  [key: string]: any;
  buttonRef?: React.RefObject<HTMLElement>;
  isVisible?: boolean;
  onClose?: (event: Event) => void;
}

type NotificationIconButtonProps = Record<string, any>;

declare module "@knocklabs/react" {
  export const KnockProvider: FC<{
    children: React.ReactNode;
    apiKey: string;
    userId: string;
  }> & { mock: { calls: any[][] } };
  export const KnockFeedProvider: FC<{
    children: React.ReactNode;
    feedId: string;
  }> & { mock: { calls: any[][] } };
  export const NotificationIconButton: FC<NotificationIconButtonProps> & {
    mock: { calls: any[][] };
  };
  export const NotificationFeedPopover: FC<NotificationFeedPopoverProps> & {
    mock: { calls: any[][] };
  };
}

declare module "@knocklabs/client" {
  export class Knock {
    constructor(apiKey: string);
    feeds: any;
    [key: string]: any;
  }
}

declare module "@knocklabs/node" {
  export class Knock {
    constructor(apiKey: string);
    users: any;
    workflows: any;
    objects: any;
    messages: any;
    feeds: any;
    [key: string]: any;
  }
}
