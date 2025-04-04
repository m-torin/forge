# Next-Forge Storybook

This is a Storybook implementation for the Next-Forge monorepo, configured with a comprehensive set of addons for development, testing, and documentation.

## Getting Started

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:6006](http://localhost:6006) to view Storybook.

## Available Addons

### Core Addons

#### 1. `@storybook/addon-essentials`
Includes core addons for development:
- **Controls**: Edit component props dynamically
- **Actions**: Track callback usage and events
- **Viewport**: Test responsive layouts
- **Docs**: Auto-generate documentation

Example usage:
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
  args: {
    // Default props
    variant: 'primary',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
```

#### 2. `@storybook/addon-links`
Navigate between stories programmatically.

```typescript
import { linkTo } from '@storybook/addon-links';

export const LinkedStory: StoryObj<typeof Button> = {
  args: {
    onClick: linkTo('OtherComponent', 'OtherStory'),
  },
};
```

### Development Tools

#### 3. `@storybook/addon-measure`
Inspect layout measurements and spacing.

```typescript
export const WithMeasurements: StoryObj<typeof Component> = {
  parameters: {
    measure: {
      baseline: 8, // 8px grid
    },
  },
};
```

#### 4. `@storybook/addon-outline`
Visualize component boundaries and layout structure.

```typescript
export const WithOutlines: StoryObj<typeof Component> = {
  parameters: {
    outline: {
      enabled: true,
      style: {
        border: '1px dashed rgba(0, 0, 0, 0.2)',
      },
    },
  },
};
```

### Testing and Accessibility

#### 5. `@storybook/addon-a11y`
Test component accessibility compliance.

```typescript
export const AccessibleComponent: StoryObj<typeof Component> = {
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
};
```

#### 6. `@storybook/addon-interactions`
Test user interactions and component behavior.

```typescript
import { expect, userEvent, within } from '@storybook/test';

export const WithInteractions: StoryObj<typeof Form> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox'), 'Hello');
    await expect(canvas.getByRole('textbox')).toHaveValue('Hello');
  },
};
```

### Theming and Styling

#### 7. `@storybook/addon-themes`
Test components across different themes.

```typescript
export const ThemedComponent: StoryObj<typeof Component> = {
  parameters: {
    themes: {
      default: 'light',
      list: [
        { name: 'light', class: '', color: '#ffffff' },
        { name: 'dark', class: 'dark', color: '#1a1a1a' },
      ],
    },
  },
};
```

#### 8. `@storybook/addon-backgrounds`
Test components against different background colors.

```typescript
export const WithBackground: StoryObj<typeof Component> = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
  },
};
```

## Writing Stories

### Basic Story Structure
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from './YourComponent';

const meta: Meta<typeof YourComponent> = {
  component: YourComponent,
  title: 'Components/YourComponent',
  // Global parameters for all stories
  parameters: {
    layout: 'centered',
  },
  // Global decorators for all stories
  decorators: [
    (Story) => (
      <div style={{ padding: '1rem' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

// Define individual stories
export const Default: StoryObj<typeof YourComponent> = {
  args: {
    // Component props
  },
};
```

### Documentation with MDX
Create `.mdx` files for custom documentation:

```mdx
import { Meta, Story } from '@storybook/blocks';
import * as ComponentStories from './YourComponent.stories';

<Meta of={ComponentStories} />

# YourComponent

<Story of={ComponentStories.Default} />

## Usage
...
```

## Best Practices

1. **Organize Stories**
   - Group related components
   - Use consistent naming
   - Provide meaningful descriptions

2. **Testing**
   - Include interaction tests
   - Check accessibility
   - Test responsive behavior

3. **Documentation**
   - Document props and usage
   - Include examples
   - Show edge cases

4. **Performance**
   - Lazy load large assets
   - Use decorators efficiently
   - Minimize story complexity

## Keyboard Shortcuts

- `A`: Show/hide addons panel
- `D`: Show/hide dock to bottom
- `T`: Show/hide toolbar
- `S`: Go to search
- `M`: Toggle measure addon
- `O`: Toggle outline addon
- `/`: Focus search
- `F`: Go to component
- `Alt + ←/→`: Navigate through story hierarchy

## Learn More

- [Storybook Documentation](https://storybook.js.org/docs)
- [Writing Stories](https://storybook.js.org/docs/writing-stories)
- [Addons](https://storybook.js.org/docs/addons)
- [Testing with Storybook](https://storybook.js.org/docs/writing-tests)
