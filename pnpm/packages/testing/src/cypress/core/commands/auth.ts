/// <reference path="./global.d.ts" />

/**
 * Authentication commands for Cypress tests
 *
 * These commands provide utilities for handling authentication in Cypress tests.
 */

/**
 * Login command for Cypress tests
 * Creates a session to persist login state between tests
 */
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/sign-in');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/sign-in');
  });
});

/**
 * Logout command for Cypress tests
 */
Cypress.Commands.add('logout', () => {
  cy.visit('/');
  // This implementation will need to be customized based on your UI
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/sign-in');
});

/**
 * User data structure for authentication
 */
interface ClerkUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

/**
 * Skip login for tests that need an authenticated user
 * Uses Clerk's test mode to bypass authentication
 */
Cypress.Commands.add('bypassLogin', (userId: string = 'test-user-id') => {
  // Set cookies or local storage to simulate authenticated state
  // This implementation will need to be customized based on your auth provider
  const userData: ClerkUser = {
    id: userId,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
  };

  localStorage.setItem('clerk-user', JSON.stringify(userData));

  // Refresh to apply the authentication
  cy.visit('/');
});
