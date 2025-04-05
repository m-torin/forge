declare namespace Cypress {
  interface Chainable {
    log(message: string): Chainable;
    mount: any;
  }

  interface Commands {
    add: any;
  }

  const env: (key: string, value?: any) => any;
  const on: (event: string, callback: (...args: any[]) => any) => void;
  const Commands: Commands;
}

declare const cy: Cypress.Chainable;
