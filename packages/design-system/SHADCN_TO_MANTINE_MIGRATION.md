# shadcn/ui to Mantine Migration Plan

## Overview

This document outlines the migration strategy from shadcn/ui components to Mantine equivalents in
the forge-ahead design system.

## Component Mapping Table

| shadcn/ui Component | Mantine Equivalent                 | Notes                                                    |
| ------------------- | ---------------------------------- | -------------------------------------------------------- |
| **Button**          | `Button`                           | Direct equivalent with similar variants                  |
| **Card**            | `Card`, `Paper`                    | Card for structured content, Paper for simple containers |
| **Input**           | `TextInput`                        | Direct equivalent                                        |
| **Select**          | `Select`, `NativeSelect`           | Select for searchable, NativeSelect for simple           |
| **Dialog**          | `Modal`                            | Direct equivalent with similar API                       |
| **Checkbox**        | `Checkbox`                         | Direct equivalent                                        |
| **Textarea**        | `Textarea`                         | Direct equivalent                                        |
| **Switch**          | `Switch`                           | Direct equivalent                                        |
| **Tabs**            | `Tabs`                             | Direct equivalent                                        |
| **Table**           | `Table`                            | Direct equivalent with more features                     |
| **Alert**           | `Alert`, `Notification`            | Alert for inline, Notification for toast-style           |
| **Badge**           | `Badge`                            | Direct equivalent                                        |
| **Avatar**          | `Avatar`                           | Direct equivalent                                        |
| **Tooltip**         | `Tooltip`                          | Direct equivalent                                        |
| **Popover**         | `Popover`                          | Direct equivalent                                        |
| **Dropdown Menu**   | `Menu`                             | Direct equivalent                                        |
| **Radio Group**     | `Radio.Group`                      | Direct equivalent                                        |
| **Slider**          | `Slider`                           | Direct equivalent                                        |
| **Progress**        | `Progress`                         | Direct equivalent                                        |
| **Skeleton**        | `Skeleton`                         | Direct equivalent                                        |
| **Accordion**       | `Accordion`                        | Direct equivalent                                        |
| **Toggle**          | `Button` (toggle variant)          | Use Button with toggle behavior                          |
| **Toggle Group**    | `SegmentedControl`, `Button.Group` | Depends on use case                                      |
| **Label**           | `Text` or native label             | Mantine inputs have built-in labels                      |
| **Separator**       | `Divider`                          | Direct equivalent                                        |
| **Sheet**           | `Drawer`                           | Direct equivalent                                        |
| **Command**         | `Spotlight`, `Combobox`            | Spotlight for command palette, Combobox for search       |
| **Calendar**        | `Calendar`, `DatePicker`           | Direct equivalent                                        |
| **Drawer**          | `Drawer`                           | Direct equivalent                                        |
| **Hover Card**      | `HoverCard`                        | Direct equivalent                                        |
| **Context Menu**    | `Menu` (with context trigger)      | Use Menu with right-click trigger                        |
| **Navigation Menu** | `NavLink`, custom                  | No direct equivalent, use NavLink or custom              |
| **Menubar**         | `Menu` (horizontal)                | Use Menu with horizontal layout                          |
| **Breadcrumb**      | `Breadcrumbs`                      | Direct equivalent                                        |
| **Carousel**        | `Carousel`                         | Direct equivalent                                        |
| **Pagination**      | `Pagination`                       | Direct equivalent                                        |
| **Aspect Ratio**    | `AspectRatio`                      | Direct equivalent                                        |
| **Scroll Area**     | `ScrollArea`                       | Direct equivalent                                        |
| **Form**            | Mantine form hooks                 | Use @mantine/form instead                                |
| **Toast/Toaster**   | `Notifications`                    | Use Mantine notifications system                         |
| **Alert Dialog**    | `Modal` with confirmation          | Use Modal with confirmation pattern                      |
| **Collapsible**     | `Collapse`                         | Direct equivalent                                        |
| **Resizable**       | No direct equivalent               | Consider custom implementation or third-party            |
| **Input OTP**       | `PinInput`                         | Direct equivalent                                        |
| **Sidebar**         | `AppShell.Navbar`                  | Part of AppShell layout system                           |
| **Chart**           | No direct equivalent               | Continue using Recharts or consider Mantine charts       |

## Components Without Direct Mantine Equivalents

1. **Resizable** - No built-in resizable panels in Mantine
2. **Navigation Menu** - Complex mega-menu style component
3. **Chart** - Mantine doesn't have built-in charting (use Recharts directly)
4. **Sonner** - Toast library, use Mantine's Notifications instead

## Migration Considerations

### 1. Styling System Differences

- **shadcn/ui**: Uses Tailwind CSS with CSS variables for theming
- **Mantine**: Has its own theming system with CSS-in-JS (emotion)
- **Action**: Need to map Tailwind utilities to Mantine theme tokens

### 2. Variant System

- **shadcn/ui**: Uses class-variance-authority (cva) for variants
- **Mantine**: Built-in variant props
- **Example**:

  ```tsx
  // shadcn/ui
  <Button variant="destructive" size="sm" />

  // Mantine
  <Button color="red" size="sm" />
  ```

### 3. Composition vs Configuration

- **shadcn/ui**: Highly composable (Card, CardHeader, CardTitle, etc.)
- **Mantine**: More configuration-based with props
- **Example**:

  ```tsx
  // shadcn/ui
  <Card>
    <CardHeader>
      <CardTitle>Title</CardTitle>
    </CardHeader>
    <CardContent>Content</CardContent>
  </Card>

  // Mantine
  <Card>
    <Card.Section>
      <Title order={3}>Title</Title>
    </Card.Section>
    <Text>Content</Text>
  </Card>
  ```

### 4. Form Handling

- **shadcn/ui**: Integrates with react-hook-form
- **Mantine**: Has @mantine/form with built-in validation
- **Action**: Evaluate whether to keep react-hook-form or migrate to @mantine/form

### 5. Animation System

- **shadcn/ui**: Uses Tailwind animations and Radix UI
- **Mantine**: Built-in transitions and animations
- **Action**: Map animation classes to Mantine transition components

### 6. Accessibility

- **shadcn/ui**: Built on Radix UI primitives (excellent a11y)
- **Mantine**: Also has excellent accessibility support
- **Action**: Ensure all ARIA attributes are properly mapped

### 7. Dark Mode

- **shadcn/ui**: CSS variables with class-based dark mode
- **Mantine**: Built-in color scheme management
- **Action**: Use Mantine's ColorSchemeProvider

## Migration Strategy

### Phase 1: Core Components (Week 1)

1. Button
2. Input, Textarea
3. Select
4. Checkbox, Switch, Radio
5. Card
6. Alert

### Phase 2: Layout Components (Week 2)

1. Modal (Dialog)
2. Drawer (Sheet)
3. Tabs
4. Accordion
5. Table
6. Sidebar → AppShell

### Phase 3: Navigation & Feedback (Week 3)

1. Menu (Dropdown, Context Menu)
2. Tooltip, Popover
3. Notifications (Toast)
4. Progress, Skeleton
5. Badge, Avatar

### Phase 4: Complex Components (Week 4)

1. Form system migration
2. Calendar, DatePicker
3. Combobox (Command replacement)
4. Custom implementations for missing components

## Code Migration Examples

### Button Migration

```tsx
// Before (shadcn/ui)
import { Button } from '@/components/ui/button';

<Button variant="destructive" size="lg" className="custom-class">
  Delete
</Button>;

// After (Mantine)
import { Button } from '@mantine/core';

<Button color="red" size="lg" className="custom-class">
  Delete
</Button>;
```

### Modal Migration

```tsx
// Before (shadcn/ui)
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    <div>Content</div>
  </DialogContent>
</Dialog>;

// After (Mantine)
import { Modal } from '@mantine/core';

<Modal opened={open} onClose={() => setOpen(false)} title="Title">
  <div>Content</div>
</Modal>;
```

### Form Migration

```tsx
// Before (shadcn/ui + react-hook-form)
import { Form, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <Input {...field} />
      </FormItem>
    )}
  />
</Form>

// After (Mantine)
import { TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'

const form = useForm({
  initialValues: { email: '' }
})

<form onSubmit={form.onSubmit(handleSubmit)}>
  <TextInput
    label="Email"
    {...form.getInputProps('email')}
  />
</form>
```

## Testing Strategy

1. **Unit Tests**: Update component tests to use Mantine testing utilities
2. **Visual Tests**: Update Storybook stories for Mantine components
3. **Integration Tests**: Ensure forms and interactions work correctly
4. **Accessibility Tests**: Verify ARIA attributes and keyboard navigation

## Rollback Plan

1. Keep shadcn/ui components in a `legacy` folder during migration
2. Use feature flags to toggle between implementations
3. Maintain both component sets until migration is validated
4. Remove shadcn/ui components only after full QA cycle

## Success Metrics

1. Bundle size reduction (Mantine tree-shaking)
2. Consistent theming across all components
3. Improved developer experience with Mantine's built-in features
4. Maintained or improved accessibility scores
5. No regression in functionality or user experience
