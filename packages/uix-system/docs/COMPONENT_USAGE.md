# Component Usage Guide

Comprehensive guide for using the Unified UI System components in your
applications. This guide covers all shared components with detailed examples,
accessibility considerations, and best practices.

## 🎯 Quick Start

### Installation

The unified UI system is already available as a workspace package:

```bash
# Import components from the unified system
import {
  LazyIcon,
  PageHeader,
  LoadingSpinner,
  RelationshipCombobox,
  AccessibleFormField,
  FormValidation
} from '@repo/uix-system/mantine';
```

### Theme Setup

Ensure your app is wrapped with the theme:

```tsx
import { MantineProvider } from "@mantine/core";
import { theme } from "@repo/uix-system/mantine";

function App() {
  return (
    <MantineProvider theme={theme}>{/* Your app content */}</MantineProvider>
  );
}
```

## 📋 Component Reference

### LazyIcon

**Purpose**: Unified icon loading with performance optimization and
accessibility features.

**When to use**:

- Any time you need icons in your application
- When you want consistent icon sizing and theming
- For icons that need to be loaded asynchronously

#### Basic Usage

```tsx
import { LazyIcon } from '@repo/uix-system/mantine';

// Simple icon with default settings
<LazyIcon name="user" />

// Icon with custom size and color
<LazyIcon
  name="settings"
  size={24}
  color="blue.6"
/>

// Icon with accessibility label
<LazyIcon
  name="delete"
  size={18}
  color="red.6"
  ariaLabel="Delete item"
/>
```

#### Advanced Usage

```tsx
// Icon with loading state and fallback
<LazyIcon
  name="complex-chart"
  size={32}
  showLoadingState={true}
  fallbackIcon="chart-line"
  onLoad={() => console.log('Icon loaded')}
  onError={() => console.log('Icon failed to load')}
/>

// Icon with custom styling
<LazyIcon
  name="notification"
  size={20}
  style={{
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
    transform: 'rotate(15deg)'
  }}
/>
```

#### Props Reference

| Prop               | Type               | Default          | Description                           |
| ------------------ | ------------------ | ---------------- | ------------------------------------- |
| `name`             | `string`           | Required         | Icon name from the icon library       |
| `size`             | `number \| string` | `16`             | Icon size in pixels                   |
| `color`            | `MantineColor`     | `'currentColor'` | Icon color from theme                 |
| `ariaLabel`        | `string`           | -                | Accessible label for screen readers   |
| `showLoadingState` | `boolean`          | `false`          | Show loading spinner while icon loads |
| `fallbackIcon`     | `string`           | -                | Fallback icon if main icon fails      |
| `onLoad`           | `() => void`       | -                | Callback when icon loads successfully |
| `onError`          | `() => void`       | -                | Callback when icon fails to load      |

#### Accessibility

- Always provide `ariaLabel` for interactive icons
- Use semantic colors that maintain contrast ratios
- Consider screen reader users when choosing icon meanings

---

### PageHeader

**Purpose**: Consistent page headers with breadcrumbs, actions, and navigation.

**When to use**:

- Top of every page in backstage applications
- When you need consistent navigation and page identification
- For pages that require action buttons or breadcrumb navigation

#### Basic Usage

```tsx
import { PageHeader } from '@repo/uix-system/mantine';

// Simple page header
<PageHeader title="User Management" />

// Header with description
<PageHeader
  title="Product Catalog"
  description="Manage your product inventory and relationships"
/>

// Header with breadcrumbs
<PageHeader
  title="Edit Product"
  breadcrumbs={[
    { label: 'Products', href: '/products' },
    { label: 'Electronics', href: '/products/electronics' },
    { label: 'iPhone 14', href: '/products/electronics/iphone-14' }
  ]}
/>
```

#### Advanced Usage

```tsx
// Header with actions and metadata
<PageHeader
  title="User Profile"
  description="Manage user account and permissions"
  breadcrumbs={[
    { label: 'Users', href: '/users' },
    { label: 'John Doe' }
  ]}
  actions={[
    <Button key="edit" leftSection={<LazyIcon name="edit" />}>
      Edit Profile
    </Button>,
    <Button key="delete" color="red" leftSection={<LazyIcon name="trash" />}>
      Delete User
    </Button>
  ]}
  metadata={[
    { label: 'Created', value: '2024-01-15' },
    { label: 'Last Login', value: '2024-01-20' },
    { label: 'Status', value: 'Active', color: 'green' }
  ]}
/>

// Header with custom layout
<PageHeader
  title="Dashboard"
  size="xl"
  variant="subtle"
  withBorder={true}
  icon={<LazyIcon name="dashboard" size={32} />}
/>
```

#### Props Reference

| Prop          | Type                           | Default     | Description                 |
| ------------- | ------------------------------ | ----------- | --------------------------- |
| `title`       | `string`                       | Required    | Page title                  |
| `description` | `string`                       | -           | Optional page description   |
| `breadcrumbs` | `BreadcrumbItem[]`             | -           | Navigation breadcrumbs      |
| `actions`     | `ReactNode[]`                  | -           | Action buttons for the page |
| `metadata`    | `MetadataItem[]`               | -           | Key-value metadata display  |
| `icon`        | `ReactNode`                    | -           | Optional icon for the page  |
| `size`        | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'lg'`      | Header size variant         |
| `variant`     | `'default' \| 'subtle'`        | `'default'` | Visual style variant        |
| `withBorder`  | `boolean`                      | `false`     | Show bottom border          |

#### Accessibility

- Page title is automatically set as H1 for screen readers
- Breadcrumbs provide proper navigation context
- Action buttons maintain proper focus order
- Metadata is marked up for screen reader comprehension

---

### LoadingSpinner

**Purpose**: Consistent loading states with accessibility and customization
options.

**When to use**:

- During data fetching operations
- While processing user actions
- As overlay for loading states
- In buttons during async operations

#### Basic Usage

```tsx
import { LoadingSpinner } from '@repo/uix-system/mantine';

// Simple loading spinner
<LoadingSpinner />

// Spinner with custom size
<LoadingSpinner size="lg" />

// Spinner with label
<LoadingSpinner
  size="md"
  label="Loading products..."
/>
```

#### Advanced Usage

```tsx
// Overlay spinner
<LoadingSpinner
  overlay={true}
  label="Processing your request..."
  showProgress={true}
  progress={65}
/>

// Custom styled spinner
<LoadingSpinner
  size={32}
  color="blue.6"
  thickness={4}
  speed="slow"
  variant="bars"
/>

// Spinner with timeout handling
<LoadingSpinner
  size="lg"
  label="Saving changes..."
  timeout={10000}
  onTimeout={() => showError('Operation timed out')}
/>
```

#### Props Reference

| Prop           | Type                                             | Default     | Description                 |
| -------------- | ------------------------------------------------ | ----------- | --------------------------- |
| `size`         | `number \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`      | Spinner size                |
| `color`        | `MantineColor`                                   | `'blue'`    | Spinner color               |
| `label`        | `string`                                         | -           | Accessible loading label    |
| `overlay`      | `boolean`                                        | `false`     | Show as fullscreen overlay  |
| `showProgress` | `boolean`                                        | `false`     | Show progress indicator     |
| `progress`     | `number`                                         | -           | Progress percentage (0-100) |
| `thickness`    | `number`                                         | `2`         | Spinner line thickness      |
| `speed`        | `'fast' \| 'normal' \| 'slow'`                   | `'normal'`  | Animation speed             |
| `variant`      | `'spinner' \| 'dots' \| 'bars'`                  | `'spinner'` | Visual variant              |
| `timeout`      | `number`                                         | -           | Timeout in milliseconds     |
| `onTimeout`    | `() => void`                                     | -           | Timeout callback            |

#### Accessibility

- Includes proper ARIA attributes for screen readers
- Loading label is announced to assistive technology
- Respects reduced motion preferences
- Progress information is conveyed accessibly

---

### LoadingButton

**Purpose**: Buttons with integrated loading states for async operations.

**When to use**:

- Form submission buttons
- Action buttons that trigger API calls
- Any button that performs asynchronous operations

#### Basic Usage

```tsx
import { LoadingButton } from '@repo/uix-system/mantine';

// Basic loading button
<LoadingButton
  loading={isSubmitting}
  onClick={handleSubmit}
>
  Save Changes
</LoadingButton>

// Button with custom loading text
<LoadingButton
  loading={isDeleting}
  loadingText="Deleting..."
  onClick={handleDelete}
  color="red"
>
  Delete Item
</LoadingButton>
```

#### Advanced Usage

```tsx
// Button with progress indication
<LoadingButton
  loading={isUploading}
  loadingText="Uploading..."
  progress={uploadProgress}
  showProgress={true}
  onClick={handleUpload}
  leftSection={<LazyIcon name="upload" />}
>
  Upload File
</LoadingButton>

// Button with custom loading spinner
<LoadingButton
  loading={isProcessing}
  loadingSpinner={<LoadingSpinner size={16} variant="dots" />}
  disabled={!canProcess}
  onClick={handleProcess}
  size="lg"
  fullWidth
>
  Process Data
</LoadingButton>
```

#### Props Reference

| Prop             | Type                          | Default        | Description                       |
| ---------------- | ----------------------------- | -------------- | --------------------------------- |
| `loading`        | `boolean`                     | `false`        | Show loading state                |
| `loadingText`    | `string`                      | `'Loading...'` | Text to show while loading        |
| `loadingSpinner` | `ReactNode`                   | -              | Custom loading spinner            |
| `progress`       | `number`                      | -              | Progress percentage               |
| `showProgress`   | `boolean`                     | `false`        | Show progress bar                 |
| `onClick`        | `() => void \| Promise<void>` | -              | Click handler                     |
| `...ButtonProps` | -                             | -              | All standard Mantine Button props |

#### Accessibility

- Loading state is announced to screen readers
- Button remains focusable but disabled during loading
- Progress information is conveyed accessibly
- Keyboard interaction is maintained

---

### RelationshipCombobox

**Purpose**: Prisma-aware combobox for selecting related entities with search
and filtering.

**When to use**:

- Selecting related database entities (users, products, categories)
- When you need searchable dropdowns with large datasets
- For form fields that reference other tables

#### Basic Usage

```tsx
import { RelationshipCombobox } from '@repo/uix-system/mantine';

// Simple relationship selection
<RelationshipCombobox
  entity="User"
  value={selectedUser}
  onChange={setSelectedUser}
  placeholder="Select a user"
/>

// Multi-select relationship
<RelationshipCombobox
  entity="Category"
  multiple={true}
  value={selectedCategories}
  onChange={setSelectedCategories}
  placeholder="Select categories"
/>
```

#### Advanced Usage

```tsx
// Combobox with custom filtering and display
<RelationshipCombobox
  entity="Product"
  value={selectedProduct}
  onChange={setSelectedProduct}
  searchable={true}
  clearable={true}
  placeholder="Search for products..."
  displayField="name"
  searchFields={['name', 'sku', 'description']}
  filter={{
    status: 'active',
    category: selectedCategory?.id
  }}
  limit={50}
  withAsterisk={true}
  error={errors.product}
  description="Select the product for this order"
/>

// Combobox with custom item rendering
<RelationshipCombobox
  entity="User"
  value={selectedUser}
  onChange={setSelectedUser}
  itemComponent={({ item }) => (
    <Group>
      <Avatar src={item.avatar} size={24} />
      <div>
        <Text size="sm">{item.name}</Text>
        <Text size="xs" color="dimmed">{item.email}</Text>
      </div>
    </Group>
  )}
/>
```

#### Props Reference

| Prop            | Type                        | Default    | Description                   |
| --------------- | --------------------------- | ---------- | ----------------------------- |
| `entity`        | `string`                    | Required   | Prisma entity name            |
| `value`         | `T \| T[]`                  | -          | Selected value(s)             |
| `onChange`      | `(value: T \| T[]) => void` | Required   | Change handler                |
| `multiple`      | `boolean`                   | `false`    | Allow multiple selection      |
| `searchable`    | `boolean`                   | `true`     | Enable search functionality   |
| `clearable`     | `boolean`                   | `true`     | Allow clearing selection      |
| `displayField`  | `string`                    | `'name'`   | Field to display in options   |
| `searchFields`  | `string[]`                  | `['name']` | Fields to search in           |
| `filter`        | `object`                    | -          | Additional filtering criteria |
| `limit`         | `number`                    | `25`       | Maximum number of results     |
| `itemComponent` | `Component`                 | -          | Custom item renderer          |
| `placeholder`   | `string`                    | -          | Placeholder text              |
| `error`         | `string`                    | -          | Error message                 |
| `description`   | `string`                    | -          | Helper description            |
| `withAsterisk`  | `boolean`                   | `false`    | Show required asterisk        |

#### Accessibility

- Full keyboard navigation support
- Screen reader announcements for search results
- Proper ARIA attributes for combobox pattern
- Focus management for dropdown interactions

---

### AccessibleFormField

**Purpose**: ARIA-compliant form field wrapper with validation and error
handling.

**When to use**:

- All form inputs in your applications
- When you need consistent form field styling and behavior
- For inputs that require accessibility compliance

#### Basic Usage

```tsx
import { AccessibleFormField } from '@repo/uix-system/mantine';

// Simple form field
<AccessibleFormField
  label="Full Name"
  required={true}
>
  <TextInput placeholder="Enter your full name" />
</AccessibleFormField>

// Field with description and error
<AccessibleFormField
  label="Email Address"
  description="We'll use this to send you notifications"
  error={errors.email}
  required={true}
>
  <TextInput
    type="email"
    placeholder="john@example.com"
  />
</AccessibleFormField>
```

#### Advanced Usage

```tsx
// Complex form field with validation
<AccessibleFormField
  label="Password"
  description="Must be at least 8 characters with uppercase, lowercase, and numbers"
  error={errors.password}
  success={passwordStrength.isStrong ? "Strong password!" : undefined}
  required={true}
  fieldId="password-field"
>
  <PasswordInput
    placeholder="Enter secure password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
</AccessibleFormField>

// Field with custom layout
<AccessibleFormField
  label="Profile Picture"
  description="Upload a profile picture (max 5MB)"
  layout="horizontal"
  labelWidth="150px"
>
  <FileInput
    accept="image/*"
    placeholder="Choose file"
  />
</AccessibleFormField>
```

#### Props Reference

| Prop          | Type                         | Default      | Description                       |
| ------------- | ---------------------------- | ------------ | --------------------------------- |
| `label`       | `string`                     | Required     | Field label                       |
| `children`    | `ReactNode`                  | Required     | Form input component              |
| `description` | `string`                     | -            | Helper description                |
| `error`       | `string`                     | -            | Error message                     |
| `success`     | `string`                     | -            | Success message                   |
| `required`    | `boolean`                    | `false`      | Mark field as required            |
| `fieldId`     | `string`                     | -            | Custom field ID                   |
| `layout`      | `'vertical' \| 'horizontal'` | `'vertical'` | Field layout                      |
| `labelWidth`  | `string`                     | -            | Label width for horizontal layout |

#### Accessibility

- Proper label-input associations
- Error and success announcements
- Required field indicators
- Screen reader-friendly markup

---

### FormValidation

**Purpose**: Zod-based form validation with async support and accessibility
features.

**When to use**:

- Forms that require client-side validation
- When you need consistent validation behavior
- For forms with complex validation rules

#### Basic Usage

```tsx
import { FormValidation } from "@repo/uix-system/mantine/backstage";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(18, "Must be 18 or older")
});

// Basic form validation
<FormValidation
  schema={schema}
  onSubmit={(data) => console.log("Valid data:", data)}
  onError={(errors) => console.log("Validation errors:", errors)}
>
  {({ register, errors, isSubmitting }) => (
    <>
      <AccessibleFormField label="Name" error={errors.name}>
        <TextInput {...register("name")} />
      </AccessibleFormField>

      <AccessibleFormField label="Email" error={errors.email}>
        <TextInput {...register("email")} />
      </AccessibleFormField>

      <LoadingButton type="submit" loading={isSubmitting}>
        Submit
      </LoadingButton>
    </>
  )}
</FormValidation>;
```

#### Advanced Usage

```tsx
// Form with async validation and complex schema
const asyncSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .refine(async (username) => {
        const exists = await checkUsernameExists(username);
        return !exists;
      }, "Username already taken"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and number"
      ),

    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  });

<FormValidation
  schema={asyncSchema}
  defaultValues={{ username: "", password: "", confirmPassword: "" }}
  onSubmit={handleSubmit}
  onError={handleErrors}
  validateOnChange={true}
  debounceMs={500}
>
  {({ register, errors, isValidating, isDirty, isValid }) => (
    <Stack>
      <AccessibleFormField
        label="Username"
        error={errors.username}
        description="Choose a unique username"
      >
        <TextInput
          {...register("username")}
          placeholder="Enter username"
          rightSection={isValidating ? <LoadingSpinner size={16} /> : null}
        />
      </AccessibleFormField>

      <AccessibleFormField label="Password" error={errors.password}>
        <PasswordInput {...register("password")} />
      </AccessibleFormField>

      <AccessibleFormField
        label="Confirm Password"
        error={errors.confirmPassword}
      >
        <PasswordInput {...register("confirmPassword")} />
      </AccessibleFormField>

      <LoadingButton
        type="submit"
        disabled={!isDirty || !isValid}
        loading={isValidating}
      >
        Create Account
      </LoadingButton>
    </Stack>
  )}
</FormValidation>;
```

#### Props Reference

| Prop               | Type                           | Default  | Description                     |
| ------------------ | ------------------------------ | -------- | ------------------------------- |
| `schema`           | `ZodSchema`                    | Required | Zod validation schema           |
| `children`         | `Function`                     | Required | Render function with form props |
| `onSubmit`         | `(data: T) => void`            | Required | Valid form submission handler   |
| `onError`          | `(errors: FormErrors) => void` | -        | Validation error handler        |
| `defaultValues`    | `Partial<T>`                   | `{}`     | Default form values             |
| `validateOnChange` | `boolean`                      | `false`  | Validate on field changes       |
| `debounceMs`       | `number`                       | `300`    | Debounce delay for validation   |

#### Accessibility

- Error announcements for screen readers
- Validation state communication
- Proper form submission handling
- Focus management for error fields

---

## 🎨 Styling and Theming

### Using Theme Colors

All components support theme-aware colors:

```tsx
// Using theme colors
<LazyIcon name="star" color="yellow.6" />
<LoadingButton color="green.7">Success Action</LoadingButton>
<LoadingSpinner color="blue.5" />

// Using semantic colors
<Button color="primary">Primary Action</Button>
<Alert color="error">Error message</Alert>
```

### Custom Styling

Components accept standard Mantine styling props:

```tsx
// Custom styles
<PageHeader
  title="Custom Page"
  style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}
  className="custom-header"
/>

// CSS-in-JS styles
<LoadingSpinner
  styles={{
    root: {
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
    }
  }}
/>
```

## ♿ Accessibility Guidelines

### General Principles

1. **Always provide labels**: Use `ariaLabel` or associated labels
2. **Maintain focus order**: Ensure logical tab sequence
3. **Provide context**: Use descriptions and error messages
4. **Test with keyboard**: All interactions must work with keyboard only
5. **Validate contrast**: Ensure sufficient color contrast ratios

### Screen Reader Support

```tsx
// Good: Provides context for screen readers
<LoadingButton
  loading={isSubmitting}
  loadingText="Saving your changes"
  ariaLabel="Save user profile changes"
>
  Save Profile
</LoadingButton>

// Good: Form field with proper associations
<AccessibleFormField
  label="User Role"
  description="Select the user's permission level"
  error={errors.role}
>
  <Select data={roleOptions} />
</AccessibleFormField>
```

### Keyboard Navigation

All components support standard keyboard interactions:

- **Tab/Shift+Tab**: Navigate between elements
- **Enter/Space**: Activate buttons and controls
- **Arrow keys**: Navigate within components (combobox, etc.)
- **Escape**: Close modals and dropdowns

## 🧪 Testing Components

### Unit Testing

```tsx
import { render, screen } from "@testing-library/react";
import { PageHeader } from "@repo/uix-system/mantine/backstage";

test("renders page header with title", () => {
  render(<PageHeader title="Test Page" />);
  expect(
    screen.getByRole("heading", { name: "Test Page" })
  ).toBeInTheDocument();
});
```

### Accessibility Testing

```tsx
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

test("component is accessible", async () => {
  const { container } = render(
    <RelationshipCombobox entity="User" onChange={jest.fn()} />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 📝 Best Practices

### Performance

1. **Use lazy loading**: Components load icons and resources on demand
2. **Implement proper memoization**: Use React.memo for expensive components
3. **Optimize re-renders**: Pass stable references to avoid unnecessary updates

### Error Handling

1. **Always handle loading states**: Use LoadingButton and LoadingSpinner
2. **Provide meaningful error messages**: Use AccessibleFormField error prop
3. **Implement graceful fallbacks**: Use fallbackIcon in LazyIcon

### Code Organization

1. **Import from barrel exports**: Use `@repo/uix-system/mantine/backstage`
2. **Follow naming conventions**: Use descriptive component and prop names
3. **Maintain consistency**: Use the same patterns across your application

## 🔧 Troubleshooting

### Common Issues

**Icons not loading**:

- Check icon name exists in the library
- Provide fallbackIcon for critical icons
- Use onError callback to handle failures

**Form validation not working**:

- Ensure Zod schema is properly defined
- Check that form fields are registered
- Verify error handling is implemented

**Accessibility violations**:

- Always provide labels for form fields
- Ensure sufficient color contrast
- Test with keyboard-only navigation
- Use semantic HTML elements

**Theme not applying**:

- Verify MantineProvider wraps your app
- Check that backstageTheme is imported correctly
- Ensure theme colors are used consistently

## 📚 Additional Resources

- [Mantine Documentation](https://mantine.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles/)
- [Zod Validation Library](https://zod.dev/)

For more specific examples and advanced usage patterns, refer to the individual
component Storybook stories in your development environment.
