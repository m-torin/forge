/**
 * Cypress Type Declarations
 *
 * This file provides type definitions for Cypress and related types
 * that are used within the testing package.
 */

declare namespace Cypress {
  interface Chainable {
    /**
     * Mount a React component in the Cypress viewport
     * @param component - React component to mount
     * @param options - Mount options
     */
    mount(component: React.ReactNode, options?: any): Chainable<Element>;

    /**
     * Mount a React component with common providers
     * @param component - React component to mount
     * @param options - Options including theme, locale, and other mount options
     */
    mountWithProviders(
      component: React.ReactNode,
      options?: {
        theme?: string;
        locale?: string;
        [key: string]: any;
      },
    ): Chainable<Element>;

    /**
     * Select an element by data-testid attribute
     * @param testId - The data-testid value
     */
    getByTestId(testId: string): Chainable<Element>;

    /**
     * Login with credentials
     * @param email - User email
     * @param password - User password
     */
    login(email: string, password: string): Chainable<Element>;

    /**
     * Logout the current user
     */
    logout(): Chainable<Element>;

    /**
     * Bypass normal login flow for testing
     * @param userId - Optional user ID to use for the session
     */
    bypassLogin(userId?: string): Chainable<Element>;

    /**
     * Wait for network to be idle (no pending requests)
     * @param timeout - Time to wait in milliseconds
     */
    waitForNetworkIdle(timeout?: number): Chainable<Element>;

    /**
     * Sets the viewport to a preset size
     * @param size - Preset size name or custom dimensions
     */
    setViewport(
      size:
        | "mobile"
        | "tablet"
        | "desktop"
        | "widescreen"
        | { width: number; height: number },
    ): Chainable<Element>;
  }

  interface Cypress {
    /**
     * Current environment variables
     */
    env: {
      (key: string, value?: any): any;
      (object: object): void;
    };

    /**
     * Get Cypress configuration
     */
    config: (key: string) => any;

    /**
     * Register custom commands
     */
    Commands: {
      add: <T extends keyof Chainable>(
        name: T,
        fn: (...args: any[]) => any,
      ) => void;
    };

    /**
     * Register event listeners
     */
    on: (eventName: string, callback: (...args: any[]) => any) => void;

    /**
     * Create a promise that can be used with Cypress commands
     */
    Promise: PromiseConstructor;
  }
}

declare namespace Mocha {
  interface Runnable {
    title: string;
    parent: Suite;
    fn: Function;
    async: boolean;
    sync: boolean;
    timedOut: boolean;
    timeout(n: number | string): this;
    duration?: number;
  }

  interface Suite {
    title: string;
    suites: Suite[];
    tests: Test[];
    root: boolean;
    parent: Suite;
    timeout(): number;
    timeout(n: number | string): this;
    bail(): boolean;
    bail(b: boolean): this;
  }

  interface Test extends Runnable {
    state: "failed" | "passed" | undefined;
    type: "test";
    speed?: "slow" | "medium" | "fast";
    err?: Error;
  }
}

declare module "cypress/react18" {
  export function mount(
    component: React.ReactNode,
    options?: any,
  ): Cypress.Chainable<Element>;
}

declare const cy: Cypress.Chainable;

declare function before(fn: () => void): void;
declare function after(fn: () => void): void;
declare function beforeEach(fn: () => void): void;
declare function afterEach(fn: () => void): void;
