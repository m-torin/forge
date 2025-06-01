# Gluestack UI v2 Component Library

A comprehensive React Native component library built with Gluestack UI v2 and NativeWind (Tailwind CSS for React Native).

## Features

- 🎨 **Modern Design System** - Built with Tailwind CSS classes via NativeWind
- 📱 **Cross-Platform** - Works on React Native (iOS/Android) and React Native Web
- 🎯 **TypeScript First** - Full TypeScript support with proper type definitions
- 🔧 **Customizable** - Easy to customize with Tailwind classes and variants
- 📖 **Storybook Ready** - Includes Storybook stories for all components
- ♿ **Accessible** - Built with accessibility in mind
- 🎭 **Theme Support** - Light/dark mode and custom theming
- 🪝 **Useful Hooks** - Includes common hooks for UI interactions

## Components

### Core Components

- **Button** - Interactive button with multiple variants and states
- **Card** - Container component with header, content, and footer sections
- **Input** - Text input with validation and icon support
- **Badge** - Status indicators and labels
- **Avatar** - User profile images with fallbacks
- **Alert** - Notification messages with different severity levels
- **Checkbox** - Boolean input control
- **Switch** - Toggle switch control
- **Spinner** - Loading indicators with progress support
- **Toast** - Temporary notification messages

### Providers

- **ThemeProvider** - Global theme and color mode management
- **ToastProvider** - Global toast notification system

### Hooks

- **useDisclosure** - Boolean state management for modals, dropdowns, etc.
- **useBreakpoints** - Responsive design utilities
- **useTheme** - Access theme values and color mode
- **useToast** - Show toast notifications

## Installation

```bash
# Install dependencies
npm install @gluestack-ui/nativewind-utils nativewind tailwindcss react-native-reanimated
```

## Setup

1. **Configure NativeWind** in your project following the [official guide](https://www.nativewind.dev/quick-starts/react-native)

2. **Wrap your app** with the necessary providers:

```tsx
import { ThemeProvider, ToastProvider } from '@repo/design-system/gluestack';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        {/* Your app content */}
      </ToastProvider>
    </ThemeProvider>
  );
}
```

## Usage

### Basic Components

```tsx
import { Button, Card, Input, Badge } from '@repo/design-system/gluestack';

function MyComponent() {
  return (
    <Card className="p-4">
      <Input 
        label="Email"
        placeholder="Enter your email"
        keyboardType="email-address"
      />
      
      <Badge variant="success" className="mt-2">
        Verified
      </Badge>
      
      <Button 
        onPress={() => console.log('Pressed!')}
        className="mt-4"
      >
        Submit
      </Button>
    </Card>
  );
}
```

### Using Hooks

```tsx
import { useDisclosure, useToast } from '@repo/design-system/gluestack';

function MyComponent() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const handleSuccess = () => {
    toast.show({
      title: "Success!",
      description: "Your action was completed successfully.",
      variant: "success",
    });
  };

  return (
    <Button onPress={handleSuccess}>
      Show Success Toast
    </Button>
  );
}
```

### Theme Customization

```tsx
import { ThemeProvider } from '@repo/design-system/gluestack';

const customTheme = {
  colors: {
    primary: {
      500: '#your-brand-color',
      600: '#your-brand-color-dark',
    },
  },
};

function App() {
  return (
    <ThemeProvider customTheme={customTheme}>
      {/* Your app */}
    </ThemeProvider>
  );
}
```

## Component API

### Button

```tsx
interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}
```

### Card

```tsx
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  className?: string;
}

// Sub-components: CardHeader, CardContent, CardFooter
```

### Input

```tsx
interface InputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  variant?: 'default' | 'outlined' | 'filled' | 'unstyled';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  // ... and more
}
```

## Styling

All components support Tailwind CSS classes via the `className` prop. The library uses NativeWind to translate Tailwind classes to React Native styles.

```tsx
<Button 
  className="bg-purple-500 hover:bg-purple-600 px-8 py-4"
  variant="primary"
>
  Custom Styled Button
</Button>
```

## Contributing

1. Add new components to the `components/` directory
2. Export them from `components/index.ts`
3. Create corresponding TypeScript interfaces
4. Add Storybook stories in `stories/`
5. Update this README with new component documentation

## File Structure

```
gluestack/
├── components/          # React components
│   ├── Button.tsx
│   ├── Card.tsx
│   └── index.ts
├── providers/           # Context providers
│   ├── ThemeProvider.tsx
│   └── ToastProvider.tsx
├── hooks/               # Custom hooks
│   ├── useDisclosure.ts
│   └── useBreakpoints.ts
├── utils/               # Utilities and helpers
│   ├── cn.ts
│   ├── theme.ts
│   └── animations.ts
├── types/               # TypeScript type definitions
├── stories/             # Storybook stories
└── index.ts             # Main export file
```

## Design Tokens

The library includes a comprehensive design token system:

- **Colors**: Primary, secondary, success, warning, error palettes
- **Spacing**: Consistent spacing scale (xs, sm, md, lg, xl, 2xl)
- **Typography**: Font sizes and weights
- **Border Radius**: Consistent rounded corners
- **Shadows**: Elevation system for depth

## Responsive Design

Use responsive values with breakpoint objects:

```tsx
<Card className="w-full md:w-1/2 lg:w-1/3">
  Responsive card width
</Card>
```

Or use the `useBreakpoints` hook for programmatic responsive behavior:

```tsx
const { currentBreakpoint, isLargeScreen } = useBreakpoints();
```

## Dark Mode

Dark mode is handled automatically through the theme system:

```tsx
const { colorMode, toggleColorMode } = useTheme();

<Button onPress={toggleColorMode}>
  Switch to {colorMode === 'light' ? 'dark' : 'light'} mode
</Button>
```