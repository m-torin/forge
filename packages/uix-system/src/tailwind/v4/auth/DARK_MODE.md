# Dark Mode Support - Better Auth Components

Complete dark mode implementation for all Better Auth RSC components with
Tailwind CSS v4.

## 🌙 Features

- **Automatic System Detection**: Follows user's system theme preference
- **Manual Theme Toggle**: Users can override system settings
- **Persistent Storage**: Theme preference saved in localStorage
- **SSR Compatible**: No hydration mismatches
- **Smooth Transitions**: Animated theme switching
- **Comprehensive Coverage**: All 37+ components support dark mode

## 🚀 Quick Start

### 1. Wrap Your App with Theme Provider

```tsx
import { AuthThemeProvider } from "@repo/uix-system/tailwind/v4/auth";

export default function App({ children }: { children: React.ReactNode }) {
  return <AuthThemeProvider>{children}</AuthThemeProvider>;
}
```

### 2. Add Theme Toggle Button

```tsx
import { ThemeToggle } from "@repo/uix-system/tailwind/v4/auth";

export function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>My App</h1>
      <ThemeToggle variant="button" size="md" />
    </header>
  );
}
```

### 3. Use Components with Dark Mode

```tsx
import { SignInForm, Alert } from "@repo/uix-system/tailwind/v4/auth";

export function LoginPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-md pt-12">
        <Alert variant="default">
          Welcome! All components automatically support dark mode.
        </Alert>

        <SignInForm
          onSuccess={() => console.log("Signed in!")}
          className="mt-6"
        />
      </div>
    </div>
  );
}
```

## ⚙️ Configuration

### Custom Theme Provider

```tsx
import { ThemeProvider } from "@repo/uix-system/tailwind/v4/auth";

function CustomThemeProvider({ children }) {
  return (
    <ThemeProvider
      defaultTheme="light" // 'light' | 'dark' | 'system'
      storageKey="my-app-theme" // localStorage key
      attribute="class" // 'class' | 'data-theme'
      enableSystem={true} // Allow system detection
      disableTransitionOnChange={false} // Disable animations
    >
      {children}
    </ThemeProvider>
  );
}
```

### Theme Toggle Variants

```tsx
// Button Toggle
<ThemeToggle variant="button" size="lg" />

// Switch Toggle
<ThemeToggle variant="switch" />

// Dropdown Menu
<ThemeToggle variant="dropdown" />
```

## 🎨 Styling Reference

### Color Mappings

| Light Mode        | Dark Mode              | Usage             |
| ----------------- | ---------------------- | ----------------- |
| `bg-white`        | `dark:bg-gray-800`     | Card backgrounds  |
| `bg-gray-50`      | `dark:bg-gray-700`     | Input backgrounds |
| `text-gray-900`   | `dark:text-gray-100`   | Primary text      |
| `text-gray-600`   | `dark:text-gray-400`   | Secondary text    |
| `border-gray-300` | `dark:border-gray-600` | Borders           |

### Status Colors

| Status  | Light             | Dark                   |
| ------- | ----------------- | ---------------------- |
| Success | `text-green-600`  | `dark:text-green-400`  |
| Error   | `text-red-600`    | `dark:text-red-400`    |
| Warning | `text-yellow-600` | `dark:text-yellow-400` |
| Info    | `text-blue-600`   | `dark:text-blue-400`   |

### Background Variants

| Type    | Light          | Dark                    |
| ------- | -------------- | ----------------------- |
| Success | `bg-green-50`  | `dark:bg-green-900/20`  |
| Error   | `bg-red-50`    | `dark:bg-red-900/20`    |
| Warning | `bg-yellow-50` | `dark:bg-yellow-900/20` |
| Info    | `bg-blue-50`   | `dark:bg-blue-900/20`   |

## 🔧 Advanced Usage

### Using Theme Hook

```tsx
import { useTheme } from "@repo/uix-system/tailwind/v4/auth";

function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Resolved theme: {resolvedTheme}</p>

      <button onClick={() => setTheme("dark")}>Switch to Dark</button>
    </div>
  );
}
```

### Custom Dark Mode Classes

```tsx
import { cn, getDarkModeClasses } from "@repo/uix-system/tailwind/v4/auth";

function CustomCard() {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        "border-gray-200 bg-white",
        "dark:border-gray-700 dark:bg-gray-800"
      )}
    >
      <h2
        className={cn("text-xl font-bold", "text-gray-900 dark:text-gray-100")}
      >
        Custom Component
      </h2>
    </div>
  );
}
```

### Utility Functions

```tsx
import {
  darkModeHelpers,
  generateDarkModeClass,
  themeAware
} from "@repo/uix-system/tailwind/v4/auth";

// Helper classes
const classes = cn(
  "p-4",
  darkModeHelpers.pageBackground,
  darkModeHelpers.primaryText
);

// Generate dark mode class
const darkClass = generateDarkModeClass("bg-gray-100");
// Returns: 'dark:bg-gray-600'

// Theme-aware styling
const conditional = themeAware(
  "bg-white text-black",
  "dark:bg-gray-900 dark:text-white",
  resolvedTheme
);
```

## 📱 Component Support

All components include comprehensive dark mode support:

### ✅ Core Forms

- SignInForm, SignUpForm, ForgotPasswordForm, ResetPasswordForm

### ✅ Advanced Auth

- TwoFactorSetup, TwoFactorVerify, PasskeySetup

### ✅ Enhanced Components

- EmailChangeVerification, DeviceManagement, BackupCodesManager
- PasswordStrengthIndicator, AccountDeletionFlow, DataExportRequest
- All existing enhanced components (11 total)

### ✅ Organization

- OrganizationSwitcher, OrganizationSettings, MembersList
- InviteMembers, RoleManagement, OrganizationCreation

### ✅ Admin Components

- AdminUsersList, AdminUserDetail, AdminDashboard
- AdminUserCreation, AdminBulkUserActions, AdminImpersonation

### ✅ UI Primitives

- Button, Input, Card, Alert (all variants)

## 🎯 Best Practices

### 1. Always Use Theme Provider

```tsx
// ✅ Good - Wrap your app
<AuthThemeProvider>
  <App />
</AuthThemeProvider>

// ❌ Bad - Components without provider
<SignInForm /> // Will not have theme context
```

### 2. Use Semantic Colors

```tsx
// ✅ Good - Semantic color names
className = "text-gray-900 dark:text-gray-100";

// ❌ Bad - Hard-coded colors
className = "text-black dark:text-white";
```

### 3. Test Both Themes

```tsx
// Always test your components in both themes
<ThemeToggle variant="dropdown" /> // Easy testing
```

### 4. Consider Contrast

```tsx
// ✅ Good - Sufficient contrast
className = "bg-gray-50 text-gray-900 dark:bg-gray-800 dark:text-gray-100";

// ❌ Bad - Poor contrast
className = "bg-gray-100 text-gray-200 dark:bg-gray-700 dark:text-gray-600";
```

## 🔍 Troubleshooting

### Hydration Mismatches

```tsx
// ✅ Solution - Use mounted state
function MyComponent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Theme-dependent rendering here
}
```

### Theme Not Persisting

```tsx
// ✅ Ensure localStorage access
// Check if running in browser environment
if (typeof window !== "undefined") {
  // localStorage operations
}
```

### CSS Specificity Issues

```tsx
// ✅ Use cn() utility to ensure proper ordering
import { cn } from '@repo/uix-system/tailwind/v4/auth';

className={cn(
  'base-styles',
  'light-mode-styles',
  'dark:dark-mode-styles'
)}
```

## 📚 Examples

### Complete Login Page with Dark Mode

```tsx
import {
  AuthThemeProvider,
  ThemeToggle,
  SignInForm,
  Alert,
  Card,
  CardHeader,
  CardContent
} from "@repo/uix-system/tailwind/v4/auth";

export default function LoginPage() {
  return (
    <AuthThemeProvider>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
        <div className="w-full max-w-md">
          {/* Theme Toggle */}
          <div className="mb-4 flex justify-end">
            <ThemeToggle variant="button" />
          </div>

          {/* Login Card */}
          <Card className="shadow-xl">
            <CardHeader>
              <h1 className="text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
                Welcome Back
              </h1>

              <Alert variant="default">
                Sign in to your account to continue
              </Alert>
            </CardHeader>

            <CardContent>
              <SignInForm
                onSuccess={() => (window.location.href = "/dashboard")}
                onError={(error) => console.error(error)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthThemeProvider>
  );
}
```

### Settings Page with Theme Preferences

```tsx
import { useTheme, ThemeToggle } from "@repo/uix-system/tailwind/v4/auth";

function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        Appearance
      </h2>

      <div className="space-y-4">
        {[
          { value: "light", label: "Light", description: "Use light theme" },
          { value: "dark", label: "Dark", description: "Use dark theme" },
          {
            value: "system",
            label: "System",
            description: "Follow system preference"
          }
        ].map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start space-x-3"
          >
            <input
              type="radio"
              name="theme"
              value={option.value}
              checked={theme === option.value}
              onChange={() => setTheme(option.value as any)}
              className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {option.label}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {option.description}
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Theme toggle button
          </span>
          <ThemeToggle variant="switch" />
        </div>
      </div>
    </div>
  );
}
```

## 🎨 Tailwind CSS Configuration

Ensure your `tailwind.config.js` includes:

```js
module.exports = {
  darkMode: "class", // Enable class-based dark mode
  content: [
    // Your content paths
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Custom dark mode colors if needed
      }
    }
  },
  plugins: []
};
```

---

🎉 **That's it!** Your Better Auth components now have complete dark mode
support. The theme will automatically persist across sessions and follow user
preferences.
