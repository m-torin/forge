# Using Testing Library with Cypress

This document provides guidance on using `@testing-library/cypress` in your
Cypress tests within the Next-Forge monorepo.

## Overview

The Testing Library integration for Cypress provides a set of commands that
allow you to query DOM elements in a way that's similar to how users interact
with your application. This approach encourages writing more resilient tests
that are less likely to break when implementation details change.

## Available Commands

The following Testing Library commands are available in your Cypress tests:

### Queries by Text Content

- `cy.findByText()` - Find an element by its text content
- `cy.findAllByText()` - Find all elements with the specified text content

### Queries by ARIA Role

- `cy.findByRole()` - Find an element by its ARIA role
- `cy.findAllByRole()` - Find all elements with the specified ARIA role

### Queries by Label

- `cy.findByLabelText()` - Find an element by its associated label
- `cy.findAllByLabelText()` - Find all elements with the specified label

### Other Queries

- `cy.findByPlaceholderText()` / `cy.findAllByPlaceholderText()`
- `cy.findByDisplayValue()` / `cy.findAllByDisplayValue()`
- `cy.findByAltText()` / `cy.findAllByAltText()`
- `cy.findByTitle()` / `cy.findAllByTitle()`
- `cy.findByTestId()` / `cy.findAllByTestId()`

## Usage Examples

### Basic Usage

```typescript
// Find a button by its text
cy.findByText("Submit").click();

// Find an input by its label
cy.findByLabelText("Email").type("user@example.com");

// Find a navigation element by its role
cy.findByRole("navigation").should("be.visible");
```

### Using with Regular Cypress Commands

Testing Library commands can be chained with regular Cypress commands:

```typescript
// Find a form and then find a button within it
cy.get("form").findByText("Submit").click();

// Find a dialog and then find a button within it
cy.findByRole("dialog").findByText("Close").click();
```

### Using with Assertions

```typescript
// Assert that an element exists
cy.findByText("Welcome").should("exist");

// Assert that an element has a specific attribute
cy.findByLabelText("Password").should("have.attr", "type", "password");

// Assert that an element has a specific class
cy.findByRole("button").should("have.class", "primary");
```

## Best Practices

1. **Prefer Role-Based Queries**: When possible, use `findByRole` as it
   encourages accessible markup and is less likely to break with text changes.

2. **Use Text Content for User-Facing Elements**: For buttons, links, and other
   interactive elements, query by their text content as that's how users
   identify them.

3. **Use Labels for Form Elements**: For inputs, selects, and other form
   elements, query by their associated label text.

4. **Avoid Test IDs When Possible**: While `findByTestId` is available, it
   should be used as a last resort when other queries aren't suitable.

5. **Combine with Custom Commands**: You can combine Testing Library commands
   with our custom commands like `waitForNetworkIdle` for more powerful tests.

## Further Reading

- [Testing Library Cypress Documentation](https://testing-library.com/docs/cypress-testing-library/intro/)
- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles)
- [Which Query Should I Use?](https://testing-library.com/docs/queries/about#priority)
