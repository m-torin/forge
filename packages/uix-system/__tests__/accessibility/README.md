# Accessibility Testing Suite

Comprehensive accessibility testing infrastructure for the Unified UI System
using @testing-library/jest-dom, jest-axe, and custom accessibility matchers.

## 🎯 Testing Coverage

### Core Accessibility Tests (`jest-dom-setup.test.ts`)

- **Custom Jest Matchers**: 10 specialized matchers for accessibility validation
- **ARIA Compliance**: Attribute validation, role checking, proper usage
- **Form Accessibility**: Label associations, error announcements, required
  field indicators
- **Focus Management**: Tab order, focus indicators, keyboard navigation
- **Color Accessibility**: Basic contrast checking, color-only information
  detection
- **Semantic Structure**: Heading hierarchy, landmark validation, table
  accessibility
- **Live Regions**: Proper announcement setup for dynamic content
- **Testing Utilities**: Helper functions for accessibility testing patterns

### Integration Tests (`integration-tests.test.tsx`)

- **Multi-component scenarios**: Complex form interactions, modal dialogs
- **Keyboard Navigation**: Tab panels, combobox widgets, focus management
- **Screen Reader Optimization**: Semantic markup, landmark structure
- **Dynamic Content**: Live regions, status updates, progressive enhancement
- **Real-world Patterns**: Authentication forms, dashboard layouts, data tables

### Color Contrast Testing (`color-contrast.test.tsx`)

- **WCAG 2.1 Compliance**: AA/AAA standards validation
- **Contrast Calculation**: Mathematical color contrast analysis
- **Theme Support**: Light/dark mode contrast validation
- **Component States**: Button variants, alert colors, interactive states
- **High Contrast Mode**: System color integration
- **Focus Indicators**: 3:1 contrast requirement validation

## 🚀 Quick Start

### Prerequisites

```bash
# Install accessibility testing dependencies
pnpm install @testing-library/jest-dom @testing-library/react jest-axe axe-core
```

### Run Tests

```bash
# Run all accessibility tests
pnpm test:a11y

# Run with coverage
pnpm test:a11y --coverage

# Run specific test file
pnpm test:a11y jest-dom-setup.test.ts

# Run with watch mode
pnpm test:a11y --watch
```

## 📋 Custom Jest Matchers

### ARIA and Semantic Matchers

```typescript
// Test proper ARIA attributes
expect(element).toHaveProperARIA();

// Test accessible name presence/value
expect(element).toHaveAccessibleName("Expected Name");

// Test heading structure (h1 -> h2 -> h3)
expect(container).toHaveProperHeadingStructure();

// Test landmark structure (main, nav, header, etc.)
expect(page).toHaveProperLandmarks();
```

### Form and Input Matchers

```typescript
// Test form labeling and associations
expect(form).toHaveProperFormLabeling();

// Test table accessibility
expect(table).toHaveAccessibleTables();

// Test live region setup
expect(container).toHaveProperLiveRegions();
```

### Interaction and Focus Matchers

```typescript
// Test focus management
expect(container).toHaveProperFocusManagement();

// Test keyboard navigation support
expect(element).toSupportKeyboardNavigation();

// Test color accessibility
expect(element).toHaveAccessibleColors();
```

## 🧪 Testing Utilities

### Accessibility Utils

```typescript
import { accessibilityUtils } from "../jest-dom-setup.test";

// Check if element is properly focused
const isFocused = accessibilityUtils.isFocused(element);

// Get all focusable elements
const focusableElements = accessibilityUtils.getFocusableElements(container);

// Simulate keyboard navigation
await accessibilityUtils.simulateKeyboardNavigation(container, "Tab");

// Check ARIA expanded state
const hasProperExpandedState =
  accessibilityUtils.hasProperExpandedState(element);

// Validate color contrast
const contrastResult = accessibilityUtils.validateColorContrast(element);

// Check error announcement setup
const hasProperErrors = accessibilityUtils.checkErrorAnnouncement(form);
```

### Test Patterns

```typescript
import { accessibilityTestPatterns } from "../jest-dom-setup.test";

// Test basic accessibility compliance
await accessibilityTestPatterns.testBasicAccessibility(container);

// Test form-specific accessibility
await accessibilityTestPatterns.testFormAccessibility(form);

// Test keyboard navigation patterns
await accessibilityTestPatterns.testKeyboardNavigation(container);

// Test screen reader compatibility
accessibilityTestPatterns.testScreenReaderCompatibility(container);
```

## 🎨 Color Contrast Testing

### WCAG Standards

```typescript
import { colorContrastUtils } from "../color-contrast.test";

// Calculate contrast ratio
const ratio = colorContrastUtils.getContrastRatio("#000000", "#ffffff"); // 21:1

// Check WCAG compliance
const meetsAA = colorContrastUtils.meetsWCAGStandard(ratio, "AA"); // true
const meetsAAA = colorContrastUtils.meetsWCAGStandard(ratio, "AAA", "large"); // true

// Get contrast from DOM element
const { ratio, passes } = colorContrastUtils.getContrastFromElement(element);
```

### Color Utilities

```typescript
// Convert hex to RGB
const rgb = colorContrastUtils.hexToRgb("#ff0000"); // { r: 255, g: 0, b: 0 }

// Calculate luminance
const luminance = colorContrastUtils.getLuminance(255, 255, 255); // 1.0
```

## 📊 Test Configuration

### Vitest Accessibility Config (`vitest.a11y.config.ts`)

- **Specialized Environment**: jsdom with accessibility focus
- **Enhanced Reporters**: JSON, HTML, verbose output
- **Coverage Settings**: 70% threshold for accessibility-critical code
- **Timeout Configuration**: Extended timeouts for complex interactions
- **Single-threaded Execution**: Ensures consistent accessibility testing

### Setup Files

- **Jest-DOM Setup**: Custom matchers and utilities auto-loaded
- **Axe Integration**: Automatic accessibility rule checking
- **Testing Library Config**: Accessibility-first query priorities

## 🔧 Integration Examples

### Basic Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('button is accessible', async () => {
  render(<Button>Click me</Button>);

  const button = screen.getByRole('button');

  // Test custom accessibility matchers
  expect(button).toHaveAccessibleName('Click me');
  expect(button).toSupportKeyboardNavigation();

  // Test axe-core integration
  const results = await axe(button);
  expect(results).toHaveNoViolations();
});
```

### Form Accessibility Testing

```typescript
test('form has proper accessibility', async () => {
  render(<ContactForm />);

  const form = screen.getByRole('form');

  // Test comprehensive form accessibility
  await accessibilityTestPatterns.testFormAccessibility(form);

  // Test individual aspects
  expect(form).toHaveProperFormLabeling();
  expect(form).toHaveProperARIA();

  // Test error handling
  const emailInput = screen.getByLabelText(/email/i);
  await user.type(emailInput, 'invalid-email');
  await user.tab();

  expect(accessibilityUtils.checkErrorAnnouncement(form)).toBe(true);
});
```

### Complex Widget Testing

```typescript
test('combobox widget is accessible', async () => {
  render(<RelationshipCombobox />);

  const combobox = screen.getByRole('combobox');

  // Test ARIA attributes
  expect(combobox).toHaveAttribute('aria-expanded', 'false');
  expect(combobox).toHaveAttribute('aria-haspopup', 'listbox');

  // Test keyboard interaction
  await user.click(combobox);
  expect(combobox).toHaveAttribute('aria-expanded', 'true');

  // Test listbox accessibility
  const listbox = screen.getByRole('listbox');
  expect(listbox).toHaveAccessibleName();

  // Comprehensive accessibility check
  const results = await axe(document.body);
  expect(results).toHaveNoViolations();
});
```

## 📈 CI/CD Integration

### GitHub Actions

```yaml
- name: Run Accessibility Tests
  run: pnpm test:a11y --coverage --reporter=json

- name: Upload Accessibility Results
  uses: actions/upload-artifact@v3
  with:
    name: accessibility-test-results
    path: |
      test-results/accessibility-results.json
      test-results/accessibility-report.html
      coverage/accessibility/
```

### Test Results

- **JSON Report**: Machine-readable accessibility test results
- **HTML Report**: Interactive accessibility test report with details
- **Coverage Report**: Accessibility-focused code coverage metrics

## 🚨 Troubleshooting

### Common Issues

**False positives in color contrast:**

1. Ensure proper background inheritance
2. Check for CSS custom properties
3. Consider transparent/overlay elements
4. Verify computed style calculations

**Axe violations:**

1. Review axe-core rules being triggered
2. Check for proper ARIA usage
3. Ensure semantic HTML structure
4. Validate form label associations

**Focus management issues:**

1. Verify tabindex usage (-1, 0, positive)
2. Test keyboard navigation patterns
3. Check focus trap implementation
4. Ensure visible focus indicators

**Screen reader compatibility:**

1. Test with actual screen readers when possible
2. Validate ARIA live regions
3. Check announcement timing
4. Ensure proper semantic markup

### Debug Mode

```bash
# Run with verbose output
pnpm test:a11y --reporter=verbose

# Run single test with debugging
pnpm test:a11y --no-coverage integration-tests.test.tsx

# Generate detailed accessibility report
pnpm test:a11y --coverage --reporter=html
```

## 📚 Best Practices

### 1. Testing Strategy

- **Start with automated tools**: axe-core for baseline compliance
- **Add custom matchers**: Domain-specific accessibility requirements
- **Test real interactions**: Keyboard navigation, screen reader flows
- **Validate color contrast**: Ensure WCAG compliance across themes

### 2. Test Organization

- **Separate concerns**: Unit tests for matchers, integration tests for
  workflows
- **Group related tests**: Form accessibility, navigation patterns, dynamic
  content
- **Clear descriptions**: Test names should describe accessibility requirements
- **Comprehensive coverage**: Test happy paths and edge cases

### 3. Accessibility Requirements

- **WCAG 2.1 AA**: Minimum compliance level for all components
- **Keyboard navigation**: All interactive elements must be keyboard accessible
- **Screen reader support**: Proper ARIA attributes and semantic markup
- **Color contrast**: 4.5:1 for normal text, 3:1 for large text

### 4. Maintenance

- **Regular updates**: Keep accessibility testing tools current
- **Review new patterns**: Validate accessibility of new UI patterns
- **Performance monitoring**: Ensure accessibility tests run efficiently
- **Documentation**: Keep accessibility requirements documented

## 🔮 Future Enhancements

### Planned Features

- **Automated screen reader testing**: Integration with assistive technology
  APIs
- **Performance accessibility**: Testing for cognitive load and animation
  sensitivity
- **Mobile accessibility**: Touch target sizes, gesture support
- **Advanced color testing**: Dynamic color schemes, user preferences

### Tool Improvements

- **Custom rule development**: Domain-specific accessibility rules
- **Visual accessibility testing**: Integration with visual regression testing
- **Automated reporting**: Accessibility dashboards and trend analysis
- **Real-time monitoring**: Accessibility monitoring in development environment
