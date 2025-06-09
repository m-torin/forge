# Design System

A comprehensive design system built with Mantine v8 for e-commerce and general web applications.

## Overview

This package provides a complete design system for the forge-ahead applications, including:

- **Mantine-Ciseco Components**: Full suite of e-commerce and web components built on Mantine v8
- **Algolia Search Components**: Specialized search and autocomplete components
- **Theme System**: Dark/light mode support with Mantine's color scheme system
- **Typography**: Consistent font system and responsive design
- **Authentication Integration**: Built-in auth components with @repo/auth integration

## Installation

This package is part of the forge-ahead monorepo and is installed automatically as a workspace
dependency.

```bash
pnpm install
```

## Usage

### Mantine-Ciseco Components

Import and use components from the main design system:

```tsx
import { ProductCard, Button, Header } from '@repo/design-system/mantine-ciseco';

function EcommerceApp() {
  return (
    <>
      <Header logo="/logo.svg" cartItemCount={3} />
      <ProductCard 
        product={product} 
        onAddToCart={handleAddToCart}
      />
      <Button variant="filled">Shop Now</Button>
    </>
  );
}
```

### Algolia Search Components

Import search components for search functionality:

```tsx
import { SearchProvider, SearchBox, SearchResults } from '@repo/design-system/algolia';

function SearchApp() {
  return (
    <SearchProvider searchClient={client} indexName="products">
      <SearchBox placeholder="Search products..." />
      <SearchResults hitComponent={ProductHit} />
    </SearchProvider>
  );
}
```

### Theme Customization

The design system uses Mantine's theme system:

```tsx
import { MantineProvider } from '@repo/design-system/mantine-ciseco';

function App() {
  return (
    <MantineProvider
      theme={{
        primaryColor: 'blue',
        fontFamily: 'Inter, sans-serif',
        colors: {
          brand: ['#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8'],
        },
      }}
    >
      {/* Your app content */}
    </MantineProvider>
  );
}
```

## Component Systems

### Mantine-Ciseco Components

- **Product Cards**: Display products with ratings, pricing, and actions
- **Headers**: Navigation and branding components
- **Hero Sections**: Promotional and landing page components
- **Shopping Cart**: Cart management components
- **Forms**: Enhanced form components with validation
- **Buttons**: Interactive buttons with Mantine variants
- **Navigation**: Menu and navigation components
- **Layout**: Responsive layout components

### Algolia Search Components

- **SearchProvider**: Context provider for Algolia integration
- **SearchBox**: Search input with autocomplete
- **SearchResults**: Display search results
- **Autocomplete**: Quick search functionality
- **SearchStats**: Display search metrics

### Available Hooks

- **useMediaQuery**: Responsive breakpoint detection
- **useColorScheme**: Dark/light mode management
- **useForm**: Form state management

## Testing

The design system includes comprehensive test coverage using Vitest and React Testing Library.

### Running Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### Writing Tests

Tests are located in the `__tests__` directory. Example test:

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@repo/design-system/mantine-ciseco';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### Test Structure

```
__tests__/
├── mantine-ciseco/   # Mantine-Ciseco component tests
├── algolia/          # Algolia component tests
└── shared/           # Shared utility tests
```

## Development

### Adding New Components

1. Create the component in `mantine-ciseco/components/` or `algolia/components/`
2. Export it from the appropriate subsystem's index file
3. Add tests in `__tests__/mantine-ciseco/` or `__tests__/algolia/`
4. Document usage in this README

### Component Guidelines

- Use Mantine v8 components as the foundation
- Ensure keyboard navigation and accessibility support
- Include ARIA labels for accessibility
- Support both controlled and uncontrolled usage
- Forward refs when appropriate
- Follow Mantine's styling patterns

## Architecture

### Directory Structure

```
packages/design-system/
├── mantine-ciseco/   # Main component system
│   ├── components/  # E-commerce and web components
│   ├── hooks/       # Custom hooks
│   └── styles.css   # Component styles
├── algolia/         # Search components
│   ├── components/  # Search UI components
│   └── index.ts     # Algolia exports
├── __tests__/       # Test files
└── package.json     # Package configuration
```

### Dependencies

- **React**: UI framework
- **Mantine v8**: Complete component library
- **Algolia**: Search and autocomplete
- **@tabler/icons-react**: Icon library
- **Embla Carousel**: Carousel functionality

## Contributing

1. Follow the existing component patterns
2. Ensure full test coverage
3. Update documentation as needed
4. Run tests before submitting PRs

## License

Part of the forge-ahead monorepo. See root LICENSE file.
