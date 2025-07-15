# Mintlify Documentation Unit Tests

This directory contains unit tests for the Mintlify documentation site. These
tests validate the structure, content, and configuration of the documentation
without requiring a running server.

## Test Categories

### 1. Configuration Tests (`config.test.ts`)

Validates the `mint.json` configuration file:

- Schema structure validation
- Logo and favicon file existence
- Color scheme configuration
- Topbar and navigation setup

### 2. Navigation Tests (`navigation.test.ts`)

Ensures the navigation structure is valid:

- All referenced pages exist
- No duplicate page references
- Valid group structure
- Page metadata (frontmatter) validation

### 3. Content Tests (`content.test.ts`)

Validates MDX content structure:

- Frontmatter presence and format
- Internal link validation (with warnings for broken links)
- Code block syntax and language validation
- Heading hierarchy consistency

### 4. Asset Tests (`assets.test.ts`)

Validates referenced assets:

- Logo and favicon file existence
- Image references in content
- File extension validation
- File size limits

## Why These Tests Are Appropriate

### **Static Analysis Focus**

Mintlify documentation is primarily static content, so unit tests focus on:

- File existence and structure
- Content format validation
- Configuration correctness
- Asset availability

### **No Server Required**

These tests run without starting the Mintlify dev server, making them:

- Fast to execute
- Suitable for CI/CD pipelines
- Independent of network connectivity
- Reliable across environments

### **Content Quality Assurance**

The tests help maintain documentation quality by:

- Catching broken links early
- Ensuring consistent formatting
- Validating configuration changes
- Preventing missing assets

## What These Tests DON'T Cover

### **Visual Rendering**

- How content looks in the browser
- CSS styling and layout
- Interactive components
- Responsive design

### **User Interactions**

- Navigation functionality
- Search behavior
- Form submissions
- Dynamic content loading

### **Performance**

- Page load times
- Asset optimization
- Bundle sizes
- Server response times

## For Visual and Interactive Testing

Use the existing E2E tests in `e2e-tests/` for:

- Visual regression testing
- User interaction flows
- Cross-browser compatibility
- Accessibility testing

## Running the Tests

```bash
# Run all unit tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test config.test.ts

# Run in watch mode (development)
pnpm test:watch
```

## Test Output

The tests provide warnings for issues rather than failing completely:

- **Broken links**: Listed in console warnings
- **Invalid code languages**: Reported but not blocking
- **Heading structure issues**: Warned about but tests pass
- **Missing assets**: Logged for review

This approach allows the test suite to run successfully while still highlighting
areas that need attention.

## Adding New Tests

When adding new tests, consider:

1. **Static validation**: Focus on file/content analysis
2. **Fast execution**: Avoid network calls or heavy processing
3. **Clear warnings**: Provide actionable feedback
4. **Maintainable**: Use helper functions for common operations

## Integration with CI/CD

These tests are designed to run in CI/CD pipelines:

- No external dependencies
- Deterministic results
- Fast execution (< 1 second)
- Clear pass/fail status

The warnings help identify documentation issues without blocking deployments.
