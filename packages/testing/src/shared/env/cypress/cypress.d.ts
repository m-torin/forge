declare namespace Cypress {
  interface Cypress {
    env(key: string): any;
    env(key: string, value: any): void;
    env(): Record<string, any>;
  }

  const env: Cypress["env"];
}

declare const Cypress: Cypress.Cypress;
declare const cy: {
  log(message: string): void;
  [key: string]: any;
};
