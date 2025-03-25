/**
 * Example Cypress test using Testing Library commands
 *
 * This file demonstrates how to use Testing Library commands in Cypress tests.
 * It's meant as a reference and is not part of the actual test suite.
 */

describe('Testing Library Example', () => {
  beforeEach(() => {
    // Visit the application
    cy.visit('/');
  });

  it('should find elements by text', () => {
    // Find a button by its text
    cy.findByText('Sign In').should('exist');

    // Find all elements with the text "Learn more"
    cy.findAllByText('Learn more').should('have.length.at.least', 1);
  });

  it('should find elements by role', () => {
    // Find the main navigation
    cy.findByRole('navigation').should('be.visible');

    // Find all buttons
    cy.findAllByRole('button').should('have.length.at.least', 1);

    // Find a specific button by its role and name
    cy.findByRole('button', { name: /sign in/i }).should('exist');
  });

  it('should find form elements by label', () => {
    // Navigate to the sign-in page
    cy.findByText('Sign In').click();

    // Find the email input by its label
    cy.findByLabelText('Email').type('user@example.com');

    // Find the password input by its label
    cy.findByLabelText('Password').type('password123');

    // Submit the form
    cy.findByRole('button', { name: /sign in/i }).click();

    // Verify success message
    cy.findByText('Welcome back!').should('be.visible');
  });

  it('should find elements by other attributes', () => {
    // Find an element by placeholder text
    cy.findByPlaceholderText('Search...').type('test');

    // Find an element by display value
    cy.findByDisplayValue('test').should('exist');

    // Find an image by alt text
    cy.findByAltText('Company Logo').should('be.visible');

    // Find an element by title
    cy.findByTitle('User Profile').should('exist');
  });

  it('should combine with regular Cypress commands', () => {
    // Find a form and then find elements within it
    cy.get('form').within(() => {
      cy.findByLabelText('Email').type('user@example.com');
      cy.findByLabelText('Password').type('password123');
      cy.findByText('Sign In').click();
    });

    // Find a dialog and then find elements within it
    cy.findByRole('dialog').within(() => {
      cy.findByText('Welcome back!').should('be.visible');
      cy.findByRole('button', { name: /close/i }).click();
    });
  });

  it('should combine with custom commands', () => {
    // Use Testing Library commands with custom commands
    cy.findByText('Sign In').click();

    // Wait for network requests to complete
    cy.waitForNetworkIdle();

    // Test responsive behavior
    cy.setViewport('mobile');
    cy.findByRole('navigation').should('have.class', 'mobile-nav');

    cy.setViewport('desktop');
    cy.findByRole('navigation').should('have.class', 'desktop-nav');
  });
});
