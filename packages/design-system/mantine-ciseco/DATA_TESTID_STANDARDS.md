# Data-TestId Standards for Mantine-Ciseco Design System

## Overview

This document establishes the standards and best practices for implementing `data-testid` attributes across the Mantine-Ciseco design system. These standards ensure consistent, maintainable, and reliable testing selectors for all components.

### Why Data-TestId?

- **Stability**: Unlike CSS selectors or text content, data-testid attributes are explicitly designed for testing and won't break when styling or content changes
- **Clarity**: Makes test intentions clear and separates testing concerns from implementation details
- **Performance**: More efficient than complex CSS selectors or XPath queries
- **Maintainability**: Easy to find and update test selectors when refactoring components

## Naming Conventions

### General Pattern

```
data-testid="[component-name]-[element-type]-[modifier]"
```

### Naming Rules

1. **Use kebab-case**: All data-testid values should use lowercase letters with hyphens
2. **Be descriptive**: Names should clearly indicate the element's purpose
3. **Include component context**: Prefix with the component name for clarity
4. **Add state modifiers**: Include state information when relevant (e.g., `-active`, `-disabled`)

### Examples

```tsx
// Good examples
data-testid="product-card-root"
data-testid="add-to-cart-button"
data-testid="navigation-menu-mobile"
data-testid="switch-input-active"

// Bad examples
data-testid="btn"              // Too generic
data-testid="ProductCard"      // Wrong case
data-testid="test1"           // Not descriptive
```

## Component Interface Standards

### Required Props Pattern

For maximum flexibility, components should accept an optional `testId` prop that allows consumers to override the default data-testid:

```tsx
interface ComponentProps {
  testId?: string;
  // ... other props
}

// Implementation
function Component({ testId = 'default-component-id', ...props }: ComponentProps) {
  return <div data-testid={testId} {...props} />;
}
```

### Multiple TestIds Pattern

Components with multiple interactive elements should expose testId props for each element:

```tsx
interface ComplexComponentProps {
  testId?: string;           // Root element
  buttonTestId?: string;     // Button element
  inputTestId?: string;      // Input element
}
```

## Implementation Examples

### 1. AddToCardButton - Multiple Elements

```tsx
interface AddToCardButtonProps {
  testId?: string;
  buttonTestId?: string;
  badgeTestId?: string;
  iconTestId?: string;
}

export function AddToCardButton({
  testId = 'add-to-cart',
  buttonTestId = 'add-to-cart-button',
  badgeTestId = 'add-to-cart-badge',
  iconTestId = 'add-to-cart-icon',
  ...props
}: AddToCardButtonProps) {
  return (
    <div data-testid={testId}>
      <Button data-testid={buttonTestId}>
        <ShoppingBagIcon data-testid={iconTestId} />
        {count > 0 && <Badge data-testid={badgeTestId}>{count}</Badge>}
      </Button>
    </div>
  );
}
```

### 2. Button - State-Based TestIds

```tsx
export function Button({ loading, disabled, testId = 'button', ...props }) {
  const finalTestId = loading ? `${testId}-loading` : 
                     disabled ? `${testId}-disabled` : 
                     testId;
  
  return (
    <MantineButton 
      data-testid={finalTestId}
      loading={loading}
      disabled={disabled}
      {...props}
    />
  );
}
```

### 3. Navigation - Complex Structure

```tsx
export function Navigation({ 
  testId = 'navigation',
  mobileMenuTestId = 'navigation-menu-mobile',
  desktopMenuTestId = 'navigation-menu-desktop',
  ...props 
}) {
  return (
    <nav data-testid={testId}>
      {/* Desktop navigation */}
      <div data-testid={desktopMenuTestId} className="hidden lg:flex">
        {navItems.map((item) => (
          <Link 
            key={item.id} 
            data-testid={`nav-link-${item.id}`}
            href={item.href}
          >
            {item.label}
          </Link>
        ))}
      </div>
      
      {/* Mobile navigation */}
      <div data-testid={mobileMenuTestId} className="lg:hidden">
        {/* Mobile menu implementation */}
      </div>
    </nav>
  );
}
```

### 4. Form Components

```tsx
// Input component
export function Input({ testId = 'input', error, ...props }) {
  return (
    <div data-testid={`${testId}-wrapper`}>
      <input 
        data-testid={testId}
        aria-invalid={!!error}
        {...props}
      />
      {error && (
        <span data-testid={`${testId}-error`}>{error}</span>
      )}
    </div>
  );
}

// Select component
export function Select({ testId = 'select', options, ...props }) {
  return (
    <MantineSelect
      data-testid={testId}
      data={options}
      {...props}
    />
  );
}
```

### 5. Interactive Components

```tsx
// Switch component
export function MySwitch({ testId = 'switch', checked, onChange, ...props }) {
  return (
    <Switch
      data-testid={testId}
      checked={checked}
      onChange={onChange}
      classNames={{
        input: `data-testid="${testId}-input"`,
        label: `data-testid="${testId}-label"`,
      }}
      {...props}
    />
  );
}

// Pagination component
export function Pagination({ testId = 'pagination', ...props }) {
  return (
    <MantinePagination
      data-testid={testId}
      getItemProps={(page) => ({
        'data-testid': `${testId}-page-${page}`,
      })}
      getControlProps={(control) => ({
        'data-testid': `${testId}-${control}`,
      })}
      {...props}
    />
  );
}
```

## Testing Guidelines

### Writing Tests with Data-TestId

```tsx
// Good practice - using data-testid
test('should add item to cart', () => {
  render(<AddToCardButton />);
  
  const button = screen.getByTestId('add-to-cart-button');
  fireEvent.click(button);
  
  const badge = screen.getByTestId('add-to-cart-badge');
  expect(badge).toHaveTextContent('1');
});

// Bad practice - using implementation details
test('should add item to cart', () => {
  render(<AddToCardButton />);
  
  const button = screen.getByRole('button', { name: /add to cart/i });
  fireEvent.click(button);
  
  const badge = document.querySelector('.badge-count');
  expect(badge).toHaveTextContent('1');
});
```

### Migration Patterns

When migrating from other selectors to data-testid:

```tsx
// Before - using CSS selectors
const element = container.querySelector('.product-card .title');

// After - using data-testid
const element = screen.getByTestId('product-card-title');

// Before - using text content
const button = screen.getByText('Add to Cart');

// After - using data-testid
const button = screen.getByTestId('add-to-cart-button');
```

### Performance Considerations

1. **Use specific testids**: More specific testids reduce DOM traversal time
2. **Avoid dynamic testids in loops**: Pre-calculate testids when possible
3. **Keep testid values short**: Reduces HTML size in production if not stripped

```tsx
// Good - pre-calculated testids
const items = data.map((item, index) => ({
  ...item,
  testId: `list-item-${index}`,
}));

// Less optimal - calculating in render
{items.map((item, index) => (
  <div data-testid={`list-item-${index}`} key={item.id}>
    {item.content}
  </div>
))}
```

### Accessibility Considerations

Data-testid attributes should complement, not replace, proper accessibility attributes:

```tsx
// Good - both accessibility and testability
<button
  data-testid="submit-button"
  aria-label="Submit form"
  aria-busy={loading}
>
  Submit
</button>

// Bad - only testid, missing accessibility
<button data-testid="submit-button">
  Submit
</button>
```

## Best Practices

### 1. Component Hierarchy

Maintain clear hierarchy in testid naming:

```tsx
<div data-testid="product-list">
  {products.map((product) => (
    <div key={product.id} data-testid={`product-item-${product.id}`}>
      <h3 data-testid={`product-title-${product.id}`}>{product.title}</h3>
      <button data-testid={`product-buy-${product.id}`}>Buy</button>
    </div>
  ))}
</div>
```

### 2. State Representation

Include state information in testids when relevant:

```tsx
<div 
  data-testid={`modal-${isOpen ? 'open' : 'closed'}`}
  className={isOpen ? 'modal-open' : 'modal-closed'}
>
  {/* Modal content */}
</div>
```

### 3. Conditional Elements

Always provide testids for conditionally rendered elements:

```tsx
{showError && (
  <Alert data-testid="error-alert">
    {errorMessage}
  </Alert>
)}
```

### 4. List Items

Use stable identifiers for list items:

```tsx
// Good - using stable ID
{items.map((item) => (
  <li key={item.id} data-testid={`item-${item.id}`}>
    {item.name}
  </li>
))}

// Bad - using index (can change)
{items.map((item, index) => (
  <li key={index} data-testid={`item-${index}`}>
    {item.name}
  </li>
))}
```

## Common Pitfalls to Avoid

### 1. Over-Testing Implementation Details

```tsx
// Bad - testing internal state
const component = renderComponent();
expect(component.state.isOpen).toBe(true);

// Good - testing behavior
const modal = screen.getByTestId('modal-open');
expect(modal).toBeInTheDocument();
```

### 2. Brittle Selectors

```tsx
// Bad - depends on DOM structure
const title = container.querySelector('div > div > h3');

// Good - direct selection
const title = screen.getByTestId('product-title');
```

### 3. Missing Error States

```tsx
// Always include testids for error states
{error && (
  <div data-testid="form-error">
    {error.message}
  </div>
)}
```

### 4. Inconsistent Naming

```tsx
// Bad - inconsistent naming
data-testid="productCard"     // camelCase
data-testid="add_to_cart"     // snake_case
data-testid="BuyButton"       // PascalCase

// Good - consistent kebab-case
data-testid="product-card"
data-testid="add-to-cart"
data-testid="buy-button"
```

## Quick Reference

### Component TestId Inventory

| Component | Root TestId | Child TestIds | Notes |
|-----------|------------|---------------|-------|
| AddToCardButton | `add-to-cart` | `add-to-cart-button`, `add-to-cart-badge`, `add-to-cart-icon` | Badge only shown when count > 0 |
| Button | `button` | - | Appends `-loading` or `-disabled` based on state |
| Navigation | `navigation` | `navigation-menu-mobile`, `navigation-menu-desktop`, `nav-link-{id}` | Responsive menus |
| Header | `header` | `header-logo`, `header-menu-{position}` | Position: left, center, right |
| Input | `input` | `input-wrapper`, `input-error` | Error element conditional |
| Select | `select` | - | Mantine Select handles internal testids |
| Textarea | `textarea` | `textarea-wrapper`, `textarea-error` | Similar to Input |
| MySwitch | `switch` | `switch-input`, `switch-label` | Via classNames prop |
| Pagination | `pagination` | `pagination-page-{n}`, `pagination-{control}` | Controls: first, prev, next, last |
| ProductCard | `product-card` | `product-card-image`, `product-card-title`, `product-card-price` | - |
| ListingImageGallery | `listing-gallery` | `listing-gallery-main`, `listing-gallery-thumb-{n}` | - |
| Footer | `footer` | `footer-section-{name}`, `footer-link-{id}` | - |
| CollectionCard | `collection-card-{id}` | `collection-card-image-{id}`, `collection-card-content-{id}` | ID from collection data |

### Testing Utilities

```tsx
// Helper function for dynamic testids
export function getTestId(base: string, modifier?: string): string {
  return modifier ? `${base}-${modifier}` : base;
}

// Usage
data-testid={getTestId('button', loading ? 'loading' : undefined)}
```

### Playwright/Cypress Selectors

```typescript
// Playwright
await page.getByTestId('add-to-cart-button').click();
await expect(page.getByTestId('cart-count')).toHaveText('1');

// Cypress
cy.get('[data-testid="add-to-cart-button"]').click();
cy.get('[data-testid="cart-count"]').should('have.text', '1');
```

## Production Considerations

### Removing TestIds in Production

If you want to remove data-testid attributes in production builds:

```tsx
// Next.js babel configuration
module.exports = {
  presets: ['next/babel'],
  plugins: [
    process.env.NODE_ENV === 'production' && [
      'react-remove-properties',
      { properties: ['data-testid'] }
    ]
  ].filter(Boolean)
};
```

### Alternative: Keep TestIds

Many teams choose to keep data-testid attributes in production for:
- E2E testing in production
- Debugging production issues
- Minimal performance impact

## Conclusion

Following these data-testid standards ensures our component library remains testable, maintainable, and reliable. By providing consistent patterns and clear guidelines, we enable developers to write robust tests while maintaining clean, accessible components.

Remember: data-testid attributes are for testing, not for styling or JavaScript logic. Keep them separate from your application's functionality and use them solely as stable selectors for your test suite.