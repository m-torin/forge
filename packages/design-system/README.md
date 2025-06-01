# Design System

A comprehensive design system built with React, Tailwind CSS, and Radix UI primitives.

## Overview

This package provides a complete design system for the forge-ahead applications, including:

- **UI Components**: A full suite of accessible, customizable components
- **Theme System**: Dark/light mode support with system preferences
- **Typography**: Consistent font system using Geist
- **Utilities**: Helper functions for styling and functionality
- **Providers**: Context providers for theme, analytics, and authentication

## Installation

This package is part of the forge-ahead monorepo and is installed automatically as a workspace
dependency.

```bash
pnpm install
```

## Usage

### Basic Setup

Wrap your application with the `DesignSystemProvider`:

```tsx
import { DesignSystemProvider } from '@repo/design-system';

function App() {
  return <DesignSystemProvider>{/* Your app content */}</DesignSystemProvider>;
}
```

### Using Components

Import components from the design system:

```tsx
import { Button, Card, Dialog } from '@repo/design-system/uix';

function MyComponent() {
  return (
    <Card>
      <Button variant="primary">Click me</Button>
    </Card>
  );
}
```

### Theme Customization

The design system uses CSS variables for theming. You can customize colors in your global CSS:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... other variables */
}
```

## Components

### UI Components

- **Accordion**: Collapsible content sections
- **Alert**: Informational messages
- **Badge**: Status indicators
- **Button**: Interactive buttons with variants
- **Card**: Content containers
- **Checkbox**: Checkable inputs
- **Dialog**: Modal dialogs
- **Input**: Text inputs
- **Select**: Dropdown selections
- **Switch**: Toggle switches
- **Toast**: Notification messages
- ...and many more

### Providers

- **DesignSystemProvider**: Main provider that includes all necessary contexts
- **ThemeProvider**: Handles theme switching
- **TooltipProvider**: Provides tooltip functionality

### Hooks

- **useToast**: Toast notification management
- **useMobile**: Mobile breakpoint detection

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
import { Button } from '../components/ui/button';

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
├── components/
│   ├── ui/           # UI component tests
│   └── mode-toggle.test.tsx
├── hooks/            # Hook tests
├── lib/              # Utility tests
├── providers/        # Provider tests
└── index.test.tsx    # Main export tests
```

## Development

### Adding New Components

1. Create the component in `components/ui/`
2. Export it from the component's index file
3. Add tests in `__tests__/components/ui/`
4. Document usage in this README

### Styling Guidelines

- Use Tailwind utility classes
- Leverage CSS variables for theming
- Use the `cn` utility for conditional classes
- Follow accessibility best practices

### Component Guidelines

- Use Radix UI primitives where available
- Ensure keyboard navigation support
- Include ARIA labels for accessibility
- Support both controlled and uncontrolled usage
- Forward refs when appropriate

## Architecture

### Directory Structure

```
packages/design-system/
├── components/       # React components
│   ├── ui/          # UI components
│   └── mode-toggle.tsx
├── hooks/           # Custom React hooks
├── lib/             # Utilities and helpers
├── providers/       # Context providers
├── styles/          # Global styles
├── __tests__/       # Test files
└── index.tsx        # Main exports
```

### Dependencies

- **React**: UI framework
- **Radix UI**: Unstyled, accessible components
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Component variants
- **next-themes**: Theme management
- **lucide-react**: Icon library

## Contributing

1. Follow the existing component patterns
2. Ensure full test coverage
3. Update documentation as needed
4. Run tests before submitting PRs

## License

Part of the forge-ahead monorepo. See root LICENSE file.
