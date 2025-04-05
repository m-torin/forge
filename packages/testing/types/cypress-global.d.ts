/// <reference types="cypress" />

// Extend the Cypress namespace
declare namespace Cypress {
  // Add missing static properties to the Cypress object
  interface Commands {
    add(name: string, fn: (...args: any[]) => any): void;
    add(name: string, options: any, fn: (...args: any[]) => any): void;
  }

  interface Static {
    Commands: Commands;
    on(event: string, callback: (...args: any[]) => void): void;
    config(key: string): any;
    Promise: PromiseConstructor;
  }
  interface Chainable {
    mount: (component: React.ReactNode, options?: any) => Chainable;
    getByTestId: (testId: string) => Chainable;
    login: (email: string, password: string) => Chainable;
    logout: () => Chainable;
    bypassLogin: (userId?: string) => Chainable;
    waitForNetworkIdle: (timeout?: number) => Chainable;
    responsiveViewport: (viewport: {
      width: number;
      height: number;
    }) => Chainable;
  }

  interface Window {
    console: Console;
  }
}

// Declare Cypress as a global object with the Static interface
declare const Cypress: Cypress.Static;

declare global {
  namespace Mocha {
    interface Runnable {
      type: string;
      title: string;
      parent: any;
    }
  }

  interface Window {
    console: Console;
  }

  // Add cy as a global
  const cy: Cypress.Chainable;

  // Add test lifecycle hooks
  function before(fn: (this: Mocha.Context) => void): void;
  function beforeEach(fn: (this: Mocha.Context) => void): void;
  function afterEach(fn: (this: Mocha.Context) => void): void;
  function after(fn: (this: Mocha.Context) => void): void;
}
