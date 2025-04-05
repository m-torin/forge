# Storybook Guide

This Storybook app is configured to display components from across the
Next-Forge monorepo, including the design system, Next.js applications, and
more.

## Configuration Details

The Storybook configuration is set up to look for story files in:

- `packages/design-system/**/*.stories.tsx` - All components in the design
  system
- `apps/next-app-mantine-tailwind/src/**/*.stories.tsx` - Components in the main
  Next.js app
- `apps/email/**/*.stories.tsx` - Email templates
- `apps/studio/**/*.stories.tsx` - Studio app components
- `apps/storybook/stories/**/*.stories.tsx` - Local stories in this app

## Adding Stories

### 1. Design System Components

To add a story for a design system component, create a `.stories.tsx` file next
to your component file:

```
packages/design-system/components/ui/
├── button.tsx
└── button.stories.tsx
```

Example story file:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    // Define control types for your component props
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
  },
};
```

### 2. Next.js App Components

For components in the Next.js app, create a `.stories.tsx` file in the same
directory:

```
apps/next-app-mantine-tailwind/src/components/
├── feature.tsx
└── feature.stories.tsx
```

## Running Storybook

Run Storybook with:

```bash
# From the root directory
pnpm --filter=@repo/storybook dev

# Or from the storybook directory
cd apps/storybook
pnpm dev
```

## Troubleshooting

If you encounter a "Module not found" error related to component paths, ensure:

1. The referenced path exists in your project structure
2. The Storybook configuration in `.storybook/main.ts` matches your actual
   project structure
3. Your imports in story files are correct
