# Stack-Tailwind-Mantine Extended Documentation

> **Extended guide for Mantine/Tailwind UI system, design tokens, components, and Storybook patterns**

---

## 1. Component Implementation Patterns

### Mantine Component Composition

```typescript
// packages/uix-system/src/Button/Button.tsx
import { Button as MantineButton, ButtonProps } from '@mantine/core';
import { forwardRef } from 'react';
import clsx from 'clsx';

export interface CustomButtonProps extends ButtonProps {
  intent?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ intent = 'primary', isLoading, className, children, disabled, ...props }, ref) => {
    return (
      <MantineButton
        ref={ref}
        className={clsx(
          'button',
          `button--${intent}`,
          isLoading && 'button--loading',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Spinner size="sm" /> : children}
      </MantineButton>
    );
  }
);

Button.displayName = 'Button';
```

### Tailwind Utilities with Mantine

```typescript
import { TextInput } from '@mantine/core';

// ✅ GOOD: Combining Tailwind with Mantine
export function SearchInput() {
  return (
    <TextInput
      placeholder="Search..."
      className="w-full max-w-md"  // Tailwind utilities
      styles={{
        input: {
          // Mantine style overrides when needed
          borderRadius: 'var(--mantine-radius-md)',
        },
      }}
    />
  );
}

// ❌ BAD: Fighting between Tailwind and Mantine
export function BadInput() {
  return (
    <TextInput
      className="border-2 border-red-500 rounded-lg"  // ❌ Conflicts with Mantine defaults
    />
  );
}
```

### Compound Component Pattern

```typescript
// packages/uix-system/src/Card/Card.tsx
import { Paper, PaperProps } from '@mantine/core';
import { createContext, useContext } from 'react';

interface CardContextValue {
  variant: 'default' | 'bordered' | 'elevated';
}

const CardContext = createContext<CardContextValue>({ variant: 'default' });

export interface CardProps extends PaperProps {
  variant?: 'default' | 'bordered' | 'elevated';
}

export function Card({ variant = 'default', children, ...props }: CardProps) {
  return (
    <CardContext.Provider value={{ variant }}>
      <Paper
        shadow={variant === 'elevated' ? 'md' : undefined}
        withBorder={variant === 'bordered'}
        {...props}
      >
        {children}
      </Paper>
    </CardContext.Provider>
  );
}

export function CardHeader({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { variant } = useContext(CardContext);

  return (
    <div
      className={clsx(
        'card-header',
        variant === 'bordered' && 'border-b',
        'p-4'
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="card-body p-4" {...props}>
      {children}
    </div>
  );
}

// Usage
<Card variant="bordered">
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
</Card>
```

---

## 2. Design Token Management

### Mantine Theme Configuration

```typescript
// packages/uix-system/src/theme.ts
import { MantineThemeOverride, createTheme } from '@mantine/core';

export const theme: MantineThemeOverride = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, monospace',

  colors: {
    // Custom color palette
    brand: [
      '#E6F2FF',
      '#BAD7FF',
      '#8EBDFF',
      '#62A3FF',
      '#3689FF',
      '#0A6EFF', // Primary brand color
      '#0858CC',
      '#064299',
      '#042B66',
      '#021533',
    ],
  },

  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },

  radius: {
    xs: '0.25rem',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },

  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },

  components: {
    Button: {
      defaultProps: {
        size: 'md',
      },
      styles: (theme) => ({
        root: {
          transition: 'all 150ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
      }),
    },
  },
});
```

### Tailwind Config Integration

```javascript
// tailwind.config.js (app-level)
import { theme as mantineTheme } from '@repo/uix-system/theme';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Map Mantine colors to Tailwind
        brand: {
          50: mantineTheme.colors.brand[0],
          100: mantineTheme.colors.brand[1],
          200: mantineTheme.colors.brand[2],
          // ... etc
          500: mantineTheme.colors.brand[5],
          900: mantineTheme.colors.brand[9],
        },
      },
      spacing: mantineTheme.spacing,
      borderRadius: mantineTheme.radius,
    },
  },
};
```

### CSS Custom Properties

```css
/* packages/uix-system/src/styles/tokens.css */
:root {
  /* Spacing tokens */
  --spacing-xs: 0.5rem;
  --spacing-sm: 0.75rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Color tokens */
  --color-primary: 218 100% 50%;
  --color-secondary: 240 5% 65%;
  --color-danger: 0 84% 60%;
  --color-success: 142 71% 45%;

  /* Typography tokens */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
}

[data-theme='dark'] {
  --color-primary: 218 100% 60%;
  /* ... dark mode overrides */
}
```

---

## 3. Storybook Integration

### Story Configuration

```typescript
// packages/uix-system/src/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { within, userEvent, expect } from '@storybook/test';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    intent: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
    },
    isLoading: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    intent: 'primary',
    children: 'Click me',
  },
};

export const Loading: Story = {
  args: {
    intent: 'primary',
    isLoading: true,
    children: 'Loading',
  },
};

// Interaction test
export const Clickable: Story = {
  args: {
    intent: 'primary',
    children: 'Click me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Test click interaction
    await userEvent.click(button);

    // Verify button was clicked (if has onClick handler)
    // await expect(button).toHaveBeenCalled();
  },
};

// Dark mode story
export const DarkMode: Story = {
  args: {
    intent: 'primary',
    children: 'Dark mode',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
```

### Storybook Test Runner

```typescript
// .storybook/test-runner.ts
import type { TestRunnerConfig } from '@storybook/test-runner';

const config: TestRunnerConfig = {
  async postRender(page, context) {
    // Accessibility audit
    const elementHandler = await page.$('#storybook-root');
    const innerHTML = await elementHandler?.innerHTML();

    if (innerHTML) {
      // Check for basic a11y issues
      const hasAria = innerHTML.includes('aria-');
      const hasRole = innerHTML.includes('role=');

      if (!hasAria && !hasRole) {
        throw new Error(`Story ${context.id} missing ARIA attributes`);
      }
    }
  },
};

export default config;
```

### Visual Regression with Percy

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../packages/*/src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
};

export default config;

// percy.config.js
module.exports = {
  version: 2,
  snapshot: {
    widths: [375, 768, 1280],
    minHeight: 1024,
  },
  storybook: {
    args: {
      // Test both themes
      theme: ['light', 'dark'],
    },
  },
};
```

---

## 4. Accessibility (A11y) Patterns

### Keyboard Navigation

```typescript
import { useRef } from 'react';

export function Menu() {
  const itemsRef = useRef<HTMLButtonElement[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < itemsRef.current.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : itemsRef.current.length - 1
        );
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(itemsRef.current.length - 1);
        break;
    }
  };

  useEffect(() => {
    itemsRef.current[focusedIndex]?.focus();
  }, [focusedIndex]);

  return (
    <div role="menu" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <button
          key={item.id}
          ref={(el) => el && (itemsRef.current[index] = el)}
          role="menuitem"
          tabIndex={index === focusedIndex ? 0 : -1}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
```

### ARIA Labels and Roles

```typescript
import { Button } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

// ✅ GOOD: Proper ARIA labels
export function DeleteButton({ onDelete, itemName }: Props) {
  return (
    <Button
      onClick={onDelete}
      aria-label={`Delete ${itemName}`}  // ✅ Descriptive label
      color="red"
    >
      <IconTrash />
    </Button>
  );
}

// ❌ BAD: Missing ARIA label
export function BadDeleteButton({ onDelete }: Props) {
  return (
    <Button onClick={onDelete} color="red">  {/* ❌ No label, just icon */}
      <IconTrash />
    </Button>
  );
}
```

### Focus Management

```typescript
import { Modal } from '@mantine/core';
import { useRef, useEffect } from 'react';

export function AccessibleModal({ opened, onClose, children }: Props) {
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (opened) {
      // Store element that had focus before modal opened
      returnFocusRef.current = document.activeElement as HTMLElement;
    } else if (returnFocusRef.current) {
      // Return focus when modal closes
      returnFocusRef.current.focus();
    }
  }, [opened]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      trapFocus  // ✅ Keep focus within modal
      returnFocus={false}  // We handle it manually for better control
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <h2 id="modal-title">Modal Title</h2>
      <p id="modal-description">Modal content</p>
      {children}
    </Modal>
  );
}
```

### Screen Reader Support

```typescript
import { VisuallyHidden } from '@mantine/core';

export function ProgressIndicator({ value, max }: Props) {
  const percentage = (value / max) * 100;

  return (
    <div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      {/* Visual progress bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>

      {/* Screen reader announcement */}
      <VisuallyHidden>
        {percentage.toFixed(0)}% complete
      </VisuallyHidden>
    </div>
  );
}
```

---

## 5. Dark Mode Implementation

### Theme Provider Setup

```typescript
// app/providers.tsx
'use client';

import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { theme } from '@repo/uix-system/theme';

export function Providers({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();

  return (
    <>
      <ColorSchemeScript defaultColorScheme="auto" />
      <MantineProvider theme={theme} defaultColorScheme={colorScheme}>
        {children}
      </MantineProvider>
    </>
  );
}
```

### Dark Mode Toggle

```typescript
'use client';

import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

export function DarkModeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ActionIcon
      variant="subtle"
      onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? <IconSun /> : <IconMoon />}
    </ActionIcon>
  );
}
```

### Theme-Aware Components

```typescript
import { useMantineTheme } from '@mantine/core';

export function Card({ children }: Props) {
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === 'dark';

  return (
    <div
      style={{
        backgroundColor: isDark ? theme.colors.dark[7] : theme.white,
        borderColor: isDark ? theme.colors.dark[5] : theme.colors.gray[3],
        color: isDark ? theme.colors.dark[0] : theme.black,
      }}
    >
      {children}
    </div>
  );
}
```

---

## 6. Form Patterns with Mantine

### Zod-Validated Forms

```typescript
import { useForm, zodResolver } from '@mantine/form';
import { TextInput, Button, Stack } from '@mantine/core';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().min(18, 'Must be 18 or older'),
});

export function ValidatedForm() {
  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      email: '',
      name: '',
      age: '',
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    console.log('Valid values:', values);
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <TextInput
          label="Email"
          placeholder="your@email.com"
          {...form.getInputProps('email')}
        />
        <TextInput
          label="Name"
          placeholder="Your name"
          {...form.getInputProps('name')}
        />
        <TextInput
          label="Age"
          type="number"
          {...form.getInputProps('age')}
        />
        <Button type="submit">Submit</Button>
      </Stack>
    </form>
  );
}
```

### Async Validation

```typescript
import { useForm } from '@mantine/form';

export function AsyncForm() {
  const form = useForm({
    initialValues: { username: '' },
    validate: {
      username: async (value) => {
        // Check if username is available
        const response = await fetch(`/api/check-username?username=${value}`);
        const { available } = await response.json();

        return available ? null : 'Username already taken';
      },
    },
  });

  return <form>{/* ... */}</form>;
}
```

---

## 7. Responsive Design Patterns

### Breakpoint Utilities

```typescript
import { useMediaQuery } from '@mantine/hooks';

export function ResponsiveLayout() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  if (isMobile) {
    return <MobileLayout />;
  }

  if (isTablet) {
    return <TabletLayout />;
  }

  return <DesktopLayout />;
}
```

### Responsive Grid

```typescript
import { Grid } from '@mantine/core';

export function ResponsiveGrid() {
  return (
    <Grid>
      <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
        <Card />
      </Grid.Col>
      {/* Responsive columns */}
    </Grid>
  );
}
```

---

## 8. Anti-Patterns & Common Mistakes

### ❌ Anti-Pattern: Direct DOM Manipulation

```typescript
// WRONG
export function BadComponent() {
  useEffect(() => {
    document.getElementById('my-element')!.style.color = 'red';  // ❌ Direct DOM manipulation
  }, []);
}

// RIGHT
export function GoodComponent() {
  return <div style={{ color: 'red' }}>Content</div>;  // ✅ React-controlled
}
```

### ❌ Anti-Pattern: Missing ARIA Labels

```typescript
// WRONG
<Button onClick={handleDelete}>
  <IconTrash />  {/* ❌ No label for screen readers */}
</Button>

// RIGHT
<Button onClick={handleDelete} aria-label="Delete item">
  <IconTrash />  {/* ✅ Accessible */}
</Button>
```

### ❌ Anti-Pattern: Inconsistent Spacing

```typescript
// WRONG - Magic numbers
<Stack gap={15}>  {/* ❌ Not from design system */}
  <div style={{ marginBottom: 23 }}>Content</div>  {/* ❌ Inconsistent */}
</Stack>

// RIGHT - Design tokens
<Stack gap="md">  {/* ✅ Uses Mantine spacing token */}
  <div style={{ marginBottom: 'var(--spacing-md)' }}>Content</div>
</Stack>
```

---

## Resources

### Official Documentation
- **Mantine**: https://mantine.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **Storybook**: https://storybook.js.org/

### Internal Resources
- **Agent doc**: `.claude/agents/stack-tailwind-mantine.md`
- **Package**: `packages/uix-system/`
- **Storybook**: `apps/storybook/`

### Context7 MCP Quick Access
```bash
mcp__context7__get-library-docs("/mantinedev/mantine")
mcp__context7__get-library-docs("/tailwindlabs/tailwindcss")
mcp__context7__get-library-docs("/storybookjs/storybook")
```

---

*Last updated: 2025-10-07*
*Part of the Forge two-tier agent documentation system*
