/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to log in a user
     * @example cy.login('user@example.com', 'password')
     */
    login(email: string, password: string): Chainable<Element>;

    /**
     * Custom command to log out a user
     * @example cy.logout()
     */
    logout(): Chainable<Element>;

    /**
     * Custom command to bypass login for tests
     * @example cy.bypassLogin('user-id')
     */
    bypassLogin(userId?: string): Chainable<Element>;

    /**
     * Custom command to select DOM element by data-testid attribute
     * @example cy.getByTestId('submit-button')
     */
    getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Custom command to check accessibility
     * @example cy.checkA11y()
     */
    checkA11y(context?: string, options?: any): Chainable<Element>;

    /**
     * Custom command to wait for network requests to complete
     * @example cy.waitForNetworkIdle()
     */
    waitForNetworkIdle(timeout?: number): Chainable<Element>;

    /**
     * Custom command to set viewport size
     * @example cy.setViewport('mobile')
     */
    setViewport(
      size:
        | "mobile"
        | "tablet"
        | "desktop"
        | "widescreen"
        | { width: number; height: number },
    ): Chainable<Element>;

    /**
     * Custom command to mount a React component with common providers
     * @example cy.mountWithProviders(<MyComponent />)
     */
    mountWithProviders(
      component: React.ReactNode,
      options?: {
        theme?: "light" | "dark";
        locale?: string;
        [key: string]: any;
      },
    ): Chainable<Element>;
  }
}
