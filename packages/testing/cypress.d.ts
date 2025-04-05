// Global Cypress type definitions
import "cypress";
import "@testing-library/cypress";

// Extend the Cypress namespace to add our custom commands and TypeScript definitions
declare global {
  // Define the global Cypress namespace
  namespace Cypress {
    // Define the Config, Plugin Events, etc that are missing
    export interface PluginEvents extends Cypress.Actions {}
    export interface PluginConfigOptions
      extends CypressCommandLine.CypressRunOptions {}
    export type CypressConfig = Partial<Cypress.ResolvedConfigOptions>;

    // Add env function that's missing
    export function env(name: string, value?: any): any;
    export function env(): { [key: string]: any };

    export function defineConfig(
      config: Partial<Cypress.ResolvedConfigOptions>,
    ): Partial<Cypress.ResolvedConfigOptions>;

    // Add any additional custom commands here
    interface Chainable {
      // Mounting commands for React components
      mount: typeof import("cypress/react18").mount;
      mountWithProviders: (
        component: React.ReactNode,
        options?: { theme?: string; locale?: string; [key: string]: any },
      ) => Chainable;

      // Testing utilities
      getByTestId: (testId: string) => Chainable;
      waitForNetworkIdle: (timeout?: number) => Chainable;
      setViewport: (
        size:
          | "mobile"
          | "tablet"
          | "desktop"
          | "widescreen"
          | { width: number; height: number },
      ) => Chainable;
      log: (message: string) => Chainable;

      // Authentication helpers
      login: (email: string, password: string) => Chainable;
      logout: () => Chainable;
      bypassLogin: (userId?: string) => Chainable;

      // Environment variable tasks
      task(
        event: "resetEnv",
        arg?: void,
        options?: Partial<Cypress.Loggable & Cypress.Timeoutable>,
      ): Chainable<void>;
      task(
        event: "setEnv",
        arg: Record<string, string>,
        options?: Partial<Cypress.Loggable & Cypress.Timeoutable>,
      ): Chainable<void>;
      task(
        event: "deleteEnv",
        arg: string,
        options?: Partial<Cypress.Loggable & Cypress.Timeoutable>,
      ): Chainable<void>;
    }
  }

  // Define global variables like cy
  const cy: Cypress.Chainable;

  // Extend Mocha globals
  namespace Mocha {
    interface Runnable {
      title: string;
      fn: Function;
      async: boolean;
      sync: boolean;
      timedOut: boolean;
    }
  }

  // Define global functions from testing frameworks
  function describe(name: string, fn: () => void): void;
  function context(name: string, fn: () => void): void;
  function it(name: string, fn: () => void): void;
  function specify(name: string, fn: () => void): void;
  function before(fn: () => void): void;
  function beforeEach(fn: () => void): void;
  function after(fn: () => void): void;
  function afterEach(fn: () => void): void;

  // Add expect
  const expect: Chai.ExpectStatic;
}

// Define the missing modules
declare module "cypress/react18" {
  export function mount(
    component: React.ReactNode,
    options?: any,
  ): Cypress.Chainable;
}

// Define missing Cypress modules
declare module "cypress" {
  export const defineConfig: typeof Cypress.defineConfig;
  export type PluginEvents = Cypress.PluginEvents;
  export type PluginConfigOptions = Cypress.PluginConfigOptions;
  export type CypressConfig = Cypress.CypressConfig;
}

// Fix coverage configuration type issues
declare module "vitest/config" {
  interface CoverageV8Options {
    all?: boolean;
    reporter?: string[];
    thresholds?: {
      statements: number;
      branches: number;
      functions: number;
      lines: number;
    };
  }

  interface CoverageIstanbulOptions {
    all?: boolean;
    reporter?: string[];
    thresholds?: {
      statements: number;
      branches: number;
      functions: number;
      lines: number;
    };
  }

  interface CustomProviderOptions {
    all?: boolean;
    reporter?: string[];
    thresholds?: {
      statements: number;
      branches: number;
      functions: number;
      lines: number;
    };
  }
}
