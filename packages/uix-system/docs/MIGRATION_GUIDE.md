# Migration Guide

Complete guide for migrating from local components to the Unified UI System.
This guide covers the migration process, breaking changes, and step-by-step
instructions for each component.

## 🎯 Migration Overview

### Why Migrate?

**Benefits of the Unified UI System:**

- ✅ **Consistent Design**: Uniform look and feel across all applications
- ✅ **Accessibility**: WCAG 2.1 AA compliance built-in
- ✅ **Performance**: Optimized loading and rendering
- ✅ **Maintainability**: Single source of truth for components
- ✅ **Testing**: Comprehensive test coverage included
- ✅ **Documentation**: Thorough usage guides and examples

### Migration Strategy

1. **Assess Current Usage**: Identify components that need migration
2. **Update Dependencies**: Ensure proper package setup
3. **Replace Imports**: Switch to unified system imports
4. **Update Props**: Adjust for any prop changes
5. **Test Functionality**: Verify everything works as expected
6. **Remove Old Code**: Clean up deprecated components

## 🚀 Quick Migration Checklist

### Pre-Migration Setup

```bash
# Ensure you have the latest uix-system package
cd packages/uix-system
pnpm install

# Verify theme is properly imported in your app
# Check that MantineProvider uses backstageTheme
```

### Import Changes

**Old Import Pattern:**

```tsx
// ❌ Old way - local components
import { LazyIcon } from "../components/shared/LazyIcon";
import { PageHeader } from "../components/shared/PageHeader";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
```

**New Import Pattern:**

```tsx
// ✅ New way - unified system
import {
  LazyIcon,
  PageHeader,
  LoadingSpinner
} from "@repo/uix-system/mantine/backstage";
```

### Theme Migration

**Old Theme Usage:**

```tsx
// ❌ Old way - custom theme
import { MantineProvider } from '@mantine/core';
import { customTheme } from './theme';

<MantineProvider theme={customTheme}>
```

**New Theme Usage:**

```tsx
// ✅ New way - unified theme
import { MantineProvider } from '@mantine/core';
import { backstageTheme } from '@repo/uix-system/mantine/backstage';

<MantineProvider theme={backstageTheme}>
```

## 📋 Component-by-Component Migration

### LazyIcon Migration

#### Breaking Changes

- `iconName` prop renamed to `name`
- `iconSize` prop renamed to `size`
- New `ariaLabel` prop for accessibility
- Added loading state support

#### Migration Example

**Before:**

```tsx
// Old LazyIcon usage
import { LazyIcon } from "../components/shared/LazyIcon";

<LazyIcon iconName="user" iconSize={24} color="blue" />;
```

**After:**

```tsx
// New LazyIcon usage
import { LazyIcon } from "@repo/uix-system/mantine/backstage";

<LazyIcon
  name="user" // ✅ renamed from iconName
  size={24} // ✅ renamed from iconSize
  color="blue.6" // ✅ use theme colors
  ariaLabel="User icon" // ✅ add accessibility
/>;
```

#### Migration Script

```typescript
// Find and replace patterns
// iconName= → name=
// iconSize= → size=
// Add ariaLabel for interactive icons
```

### PageHeader Migration

#### Breaking Changes

- `headerTitle` prop renamed to `title`
- Breadcrumbs structure changed
- New `actions` and `metadata` props
- Enhanced accessibility support

#### Migration Example

**Before:**

```tsx
// Old PageHeader usage
import { PageHeader } from "../components/shared/PageHeader";

<PageHeader
  headerTitle="User Management"
  subtitle="Manage system users"
  breadcrumbItems={["Home", "Users"]}
/>;
```

**After:**

```tsx
// New PageHeader usage
import { PageHeader } from "@repo/uix-system/mantine/backstage";

<PageHeader
  title="User Management" // ✅ renamed from headerTitle
  description="Manage system users" // ✅ renamed from subtitle
  breadcrumbs={[
    // ✅ new structure
    { label: "Home", href: "/" },
    { label: "Users", href: "/users" }
  ]}
/>;
```

### LoadingSpinner Migration

#### Breaking Changes

- `spinnerSize` prop renamed to `size`
- New `label` prop for accessibility
- Added overlay and progress support
- Enhanced animation options

#### Migration Example

**Before:**

```tsx
// Old LoadingSpinner usage
import { LoadingSpinner } from "../components/shared/LoadingSpinner";

<LoadingSpinner spinnerSize="large" color="blue" />;
```

**After:**

```tsx
// New LoadingSpinner usage
import { LoadingSpinner } from "@repo/uix-system/mantine/backstage";

<LoadingSpinner
  size="lg" // ✅ use standard sizes
  color="blue.6" // ✅ use theme colors
  label="Loading content..." // ✅ add accessibility
/>;
```

### LoadingButton Migration

#### Breaking Changes

- Enhanced loading state management
- New `loadingText` prop
- Progress indication support
- Improved accessibility

#### Migration Example

**Before:**

```tsx
// Old LoadingButton usage
import { LoadingButton } from "../components/shared/LoadingButton";

<LoadingButton isLoading={saving} onClick={handleSave}>
  Save Changes
</LoadingButton>;
```

**After:**

```tsx
// New LoadingButton usage
import { LoadingButton } from "@repo/uix-system/mantine/backstage";

<LoadingButton
  loading={saving} // ✅ renamed from isLoading
  loadingText="Saving..." // ✅ add loading text
  onClick={handleSave}
>
  Save Changes
</LoadingButton>;
```

### Form Component Migrations

#### RelationshipCombobox Migration

**Before:**

```tsx
// Old custom combobox
import { Select } from "@mantine/core";

<Select
  data={users}
  value={selectedUser}
  onChange={setSelectedUser}
  searchable
  placeholder="Select user"
/>;
```

**After:**

```tsx
// New RelationshipCombobox
import { RelationshipCombobox } from "@repo/uix-system/mantine/backstage";

<RelationshipCombobox
  entity="User" // ✅ Prisma integration
  value={selectedUser}
  onChange={setSelectedUser}
  placeholder="Select user"
  searchable={true} // ✅ Enhanced search
/>;
```

#### AccessibleFormField Migration

**Before:**

```tsx
// Old form field structure
<div>
  <label htmlFor="email">Email Address</label>
  <TextInput id="email" />
  {error && <Text color="red">{error}</Text>}
</div>
```

**After:**

```tsx
// New AccessibleFormField
import { AccessibleFormField } from "@repo/uix-system/mantine/backstage";

<AccessibleFormField
  label="Email Address" // ✅ Automatic association
  error={errors.email} // ✅ Built-in error display
  required={true} // ✅ Accessibility indicators
>
  <TextInput placeholder="Enter email" />
</AccessibleFormField>;
```

## 🔧 App-Specific Migration Guides

### Backstage App Migration

**Files to Update:**

- `src/app/layout.tsx` - Update theme import
- `src/components/shared/index.ts` - Update barrel exports
- All component usage files

**Step 1: Update Theme**

```tsx
// src/app/layout.tsx
import { backstageTheme } from "@repo/uix-system/mantine/backstage";

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MantineProvider theme={backstageTheme}>{children}</MantineProvider>
      </body>
    </html>
  );
}
```

**Step 2: Update Barrel Exports**

```tsx
// src/components/shared/index.ts
export {
  LazyIcon,
  PageHeader,
  LoadingSpinner,
  LoadingButton,
  PerformanceMonitor,
  RelationshipCombobox,
  AccessibleFormField,
  FormValidation
} from "@repo/uix-system/mantine/backstage";
```

### Backstage-CMS Migration

**Key Changes:**

- Update bulk edit components
- Migrate relationship forms
- Update entity detail pages

**Bulk Edit Migration:**

```tsx
// Before: Custom bulk edit
import { GenericBulkEditView } from "../components/bulk-edit/GenericBulkEditView";

// After: Unified system
import { GenericBulkEditView } from "@repo/uix-system/mantine/backstage";
```

**Relationship Form Migration:**

```tsx
// Before: Custom relationship picker
const RelationshipPicker = ({ options, value, onChange }) => {
  // Custom implementation
};

// After: Unified system
import { RelationshipCombobox } from "@repo/uix-system/mantine/backstage";

<RelationshipCombobox entity="Category" value={value} onChange={onChange} />;
```

### Backstage-Workflows Migration

**Key Changes:**

- Update performance monitoring
- Maintain workflow-specific components
- Hybrid approach for specialized features

**Performance Monitor Migration:**

```tsx
// Before: Local performance monitor
import { PerformanceMonitor } from "../components/PerformanceMonitor";

// After: Unified system
import { PerformanceMonitor } from "@repo/uix-system/mantine/backstage";
```

### Backstage-Authmgmt Migration

**Key Changes:**

- Update authentication forms
- Migrate user management components
- Maintain auth-specific logic

**Form Migration:**

```tsx
// Before: Custom auth forms
const LoginForm = () => {
  return (
    <form>
      <TextInput label="Email" />
      <PasswordInput label="Password" />
      <Button type="submit">Login</Button>
    </form>
  );
};

// After: Unified form system
import {
  FormValidation,
  AccessibleFormField
} from "@repo/uix-system/mantine/backstage";

const LoginForm = () => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
  });

  return (
    <FormValidation schema={schema} onSubmit={handleLogin}>
      {({ register, errors }) => (
        <>
          <AccessibleFormField label="Email" error={errors.email}>
            <TextInput {...register("email")} />
          </AccessibleFormField>
          <AccessibleFormField label="Password" error={errors.password}>
            <PasswordInput {...register("password")} />
          </AccessibleFormField>
        </>
      )}
    </FormValidation>
  );
};
```

## 🧪 Testing After Migration

### Unit Tests Update

**Before:**

```tsx
import { PageHeader } from "../components/shared/PageHeader";

test("renders page header", () => {
  render(<PageHeader headerTitle="Test" />);
});
```

**After:**

```tsx
import { PageHeader } from "@repo/uix-system/mantine/backstage";

test("renders page header", () => {
  render(<PageHeader title="Test" />); // Updated prop name
});
```

### Accessibility Testing

```tsx
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

test("migrated component is accessible", async () => {
  const { container } = render(<PageHeader title="Test Page" />);

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 🚨 Common Migration Issues

### Issue 1: Import Errors

**Problem:**

```
Module not found: Can't resolve '@repo/uix-system/mantine/backstage'
```

**Solution:**

```bash
# Ensure package is installed
pnpm install @repo/uix-system

# Check package.json includes workspace dependency
"@repo/uix-system": "workspace:*"
```

### Issue 2: Theme Not Applied

**Problem:** Components don't match design system

**Solution:**

```tsx
// Ensure proper theme import
import { backstageTheme } from "@repo/uix-system/mantine/backstage";

// Wrap app with correct theme
<MantineProvider theme={backstageTheme}>{/* Your app */}</MantineProvider>;
```

### Issue 3: Prop Type Errors

**Problem:**

```
Property 'iconName' does not exist on type 'LazyIconProps'
```

**Solution:**

```tsx
// Update prop names according to migration guide
<LazyIcon
  name="user" // ✅ was iconName
  size={24} // ✅ was iconSize
/>
```

### Issue 4: Accessibility Violations

**Problem:** New accessibility requirements causing test failures

**Solution:**

```tsx
// Add missing accessibility props
<LazyIcon
  name="delete"
  ariaLabel="Delete item"  // ✅ Add aria labels
/>

<LoadingSpinner
  label="Loading data..."  // ✅ Add loading labels
/>
```

## 📊 Migration Validation

### Pre-Migration Checklist

- [ ] All local components identified
- [ ] Dependencies up to date
- [ ] Theme properly configured
- [ ] Test suite ready for updates

### Post-Migration Checklist

- [ ] All imports updated
- [ ] Props migrated correctly
- [ ] Accessibility tests passing
- [ ] Visual regression tests passing
- [ ] Performance metrics maintained
- [ ] Local components removed
- [ ] Documentation updated

### Validation Script

```typescript
// scripts/validate-migration.ts
import { execSync } from "child_process";

// Run type checking
execSync("pnpm typecheck", { stdio: "inherit" });

// Run accessibility tests
execSync("pnpm test:a11y", { stdio: "inherit" });

// Run visual regression tests
execSync("pnpm test:visual", { stdio: "inherit" });

// Run full test suite
execSync("pnpm test", { stdio: "inherit" });

console.log("✅ Migration validation complete!");
```

## 🔄 Rollback Strategy

### If Migration Issues Occur

1. **Revert Imports:**

   ```tsx
   // Temporarily revert to local components
   import { LazyIcon } from "../components/shared/LazyIcon";
   ```

2. **Keep Old Components:** Don't delete local components until migration is
   validated

3. **Feature Flag:** Use feature flags to toggle between old and new components

4. **Gradual Migration:** Migrate one component type at a time

### Emergency Rollback

```bash
# Revert to previous commit if needed
git revert <migration-commit-hash>

# Or cherry-pick specific fixes
git cherry-pick <fix-commit-hash>
```

## 🎉 Post-Migration Benefits

### Immediate Benefits

- ✅ **Consistent UI**: All apps now use the same components
- ✅ **Better Accessibility**: WCAG compliance built-in
- ✅ **Improved Performance**: Optimized loading and rendering
- ✅ **Enhanced Testing**: Comprehensive test coverage

### Long-term Benefits

- ✅ **Easier Maintenance**: Single source of truth
- ✅ **Faster Development**: Reusable, documented components
- ✅ **Better User Experience**: Consistent interactions
- ✅ **Scalability**: New apps can adopt components easily

### Metrics to Track

- Bundle size reduction
- Accessibility score improvements
- Development velocity increase
- Bug reduction in UI components

## 📞 Support and Resources

### Getting Help

- **Documentation**: Check component usage guides
- **Storybook**: View live examples and documentation
- **Tests**: Reference existing test files for examples
- **Migration Issues**: Create issues in the repository

### Additional Resources

- [Component Usage Guide](./COMPONENT_USAGE.md)
- [Accessibility Testing Guide](../__tests__/accessibility/README.md)
- [Visual Regression Testing](../__tests__/visual-regression/README.md)
- [Storybook Documentation](../stories/README.md)
