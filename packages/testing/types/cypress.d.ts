declare namespace Cypress {
  interface Chainable {
    mount: any;
    login: any;
    logout: any;
    bypassLogin: any;
    getByTestId: any;
    waitForNetworkIdle: any;
    responsiveViewport: any;
  }

  interface Commands {
    add: any;
  }

  interface Window {
    console: Console;
  }

  const Commands: Commands;
  const Promise: PromiseConstructor;

  function on(event: string, callback: any): void;
  function config(key: string): any;
  function env(key: string, value?: any): any;
}

declare const cy: Cypress.Chainable;
declare function before(fn: () => void): void;
declare function beforeEach(fn: () => void): void;
declare function afterEach(fn: () => void): void;
declare function afterAll(fn: () => void): void;

declare namespace Mocha {
  interface Runnable {
    [key: string]: any;
  }
}
