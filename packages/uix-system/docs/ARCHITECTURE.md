# Unified UI System Architecture

Comprehensive technical documentation for the Unified UI System architecture,
design decisions, and implementation details.

## 🏗️ System Overview

### Design Philosophy

The Unified UI System is built on four core principles:

1. **Consistency**: Single source of truth for UI components across all
   applications
2. **Accessibility**: WCAG 2.1 AA compliance built into every component
3. **Performance**: Optimized for loading speed and runtime efficiency
4. **Developer Experience**: Intuitive APIs with comprehensive documentation

### System Architecture

```
@repo/uix-system
├── src/
│   ├── mantine/                 # Mantine-based components
│   │   ├── backstage/           # Backstage-specific theme and components
│   │   │   ├── components/      # Core UI components
│   │   │   ├── theme.ts         # Unified theme configuration
│   │   │   ├── types.ts         # TypeScript definitions
│   │   │   └── index.ts         # Barrel exports
│   │   └── index.ts             # Mantine root exports
│   ├── tailwind/                # Tailwind-based components (future)
│   └── shared/                  # Framework-agnostic utilities
├── __tests__/                   # Comprehensive test suites
├── docs/                        # Architecture and usage documentation
├── stories/                     # Storybook stories
└── playwright.config.ts         # Visual regression testing
```

## 🎨 Theme Architecture

### Design System Hierarchy

```typescript
// Theme structure
interface BackstageTheme extends MantineTheme {
  // Core design tokens
  colors: Record<string, string[]>; // Color palettes
  spacing: Record<string, string>; // Spacing scale
  radius: Record<string, string>; // Border radius scale
  shadows: Record<string, string>; // Box shadow scale

  // Typography system
  fontFamily: string; // Primary font stack
  fontSizes: Record<string, string>; // Type scale
  lineHeights: Record<string, number>; // Line height scale

  // Component overrides
  components: {
    Button: ThemeComponent;
    TextInput: ThemeComponent;
    // ... all Mantine components
  };

  // Custom properties
  focusRingStyles: FocusRingConfig; // Focus management
  accessibilityFeatures: A11yConfig; // Accessibility settings
}
```

### Color System

```typescript
// Semantic color mapping
const colors = {
  // Brand colors
  primary: [
    /* blue scale */
  ],
  secondary: [
    /* gray scale */
  ],

  // Semantic colors
  success: [
    /* green scale */
  ],
  warning: [
    /* yellow scale */
  ],
  error: [
    /* red scale */
  ],
  info: [
    /* blue scale */
  ],

  // Neutral colors
  gray: [
    /* 10-step gray scale */
  ],
  dark: [
    /* 10-step dark scale */
  ],

  // Functional colors
  background: "var(--mantine-color-white)",
  text: "var(--mantine-color-gray-9)",
  border: "var(--mantine-color-gray-3)"
};
```

### Responsive Design

```typescript
// Breakpoint system
const breakpoints = {
  xs: "36em", // 576px
  sm: "48em", // 768px
  md: "62em", // 992px
  lg: "75em", // 1200px
  xl: "88em" // 1408px
};

// Spacing scale (rem-based)
const spacing = {
  xs: "0.625rem", // 10px
  sm: "0.75rem", // 12px
  md: "1rem", // 16px
  lg: "1.25rem", // 20px
  xl: "1.5rem", // 24px
  xxl: "2rem" // 32px
};
```

## 🧩 Component Architecture

### Base Component Pattern

All components follow a consistent architecture:

```typescript
// Component interface pattern
interface ComponentProps {
  // Core functionality
  children?: ReactNode;

  // Styling props
  className?: string;
  style?: CSSProperties;

  // Accessibility props (required for interactive components)
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;

  // Mantine integration
  ...MantineComponentProps;
}

// Implementation pattern
const Component = forwardRef<HTMLElement, ComponentProps>((props, ref) => {
  // Props destructuring with defaults
  const {
    children,
    className,
    style,
    ariaLabel,
    ...mantineProps
  } = props;

  // Accessibility setup
  const accessibilityProps = useAccessibility({
    ariaLabel,
    // ... other a11y props
  });

  // Theme integration
  const theme = useMantineTheme();
  const classes = useComponentStyles(theme);

  // Component logic
  const componentState = useComponentLogic(props);

  return (
    <MantineComponent
      ref={ref}
      className={clsx(classes.root, className)}
      style={style}
      {...accessibilityProps}
      {...mantineProps}
    >
      {children}
    </MantineComponent>
  );
});

Component.displayName = 'ComponentName';
```

### Component Categories

#### 1. Foundation Components

- **LazyIcon**: Optimized icon loading with accessibility
- **LoadingSpinner**: Consistent loading states
- **LoadingButton**: Buttons with integrated loading states

#### 2. Layout Components

- **PageHeader**: Standardized page headers with breadcrumbs
- **PerformanceMonitor**: Web Vitals integration

#### 3. Form Components

- **AccessibleFormField**: ARIA-compliant form wrapper
- **RelationshipCombobox**: Prisma-aware relationship picker
- **FormValidation**: Zod-based validation system

#### 4. Data Components

- **GenericBulkEditView**: Comprehensive bulk editing system
- **AccessibleDataGrid**: Screen reader friendly data tables

#### 5. Interaction Components

- **CommandPalette**: Spotlight-based command system
- **KeyboardShortcuts**: Unified hotkey management

## 🔧 Technical Implementation

### Bundle Architecture

```typescript
// Export structure for optimal tree-shaking
// packages/uix-system/src/mantine/backstage/index.ts

// Core components (always included)
export { LazyIcon } from "./components/LazyIcon";
export { PageHeader } from "./components/PageHeader";
export { LoadingSpinner } from "./components/LoadingSpinner";

// Form components (lazy-loaded)
export { RelationshipCombobox } from "./components/RelationshipCombobox";
export { AccessibleFormField } from "./components/AccessibleFormField";
export { FormValidation } from "./components/FormValidation";

// Advanced components (lazy-loaded)
export { GenericBulkEditView } from "./components/GenericBulkEditView";
export { CommandPalette } from "./components/CommandPalette";

// Theme and utilities
export { backstageTheme, createBackstageTheme } from "./theme";
export type * from "./types";
```

### Performance Optimizations

#### 1. Component Lazy Loading

```typescript
// Dynamic component loading
const GenericBulkEditView = lazy(() =>
  import('./components/GenericBulkEditView').then(module => ({
    default: module.GenericBulkEditView
  }))
);

// Usage with suspense
<Suspense fallback={<LoadingSpinner />}>
  <GenericBulkEditView {...props} />
</Suspense>
```

#### 2. Icon Optimization

```typescript
// LazyIcon implementation
const LazyIcon = ({ name, ...props }: LazyIconProps) => {
  const [IconComponent, setIconComponent] = useState<ComponentType | null>(null);

  useEffect(() => {
    // Dynamic icon loading with caching
    const loadIcon = async () => {
      try {
        const module = await import(`@tabler/icons-react/icons-js/icon-${name}.js`);
        setIconComponent(() => module.default);
      } catch (error) {
        // Fallback to default icon
        setIconComponent(() => DefaultIcon);
      }
    };

    loadIcon();
  }, [name]);

  if (!IconComponent) {
    return props.showLoadingState ? <LoadingSpinner size={props.size} /> : null;
  }

  return <IconComponent {...props} />;
};
```

#### 3. Memory Management

```typescript
// Component memoization strategy
const ExpensiveComponent = memo(({ data, onAction }: Props) => {
  // Expensive computation
  const processedData = useMemo(() =>
    processData(data),
    [data]
  );

  // Stable callback references
  const handleAction = useCallback((id: string) => {
    onAction(id);
  }, [onAction]);

  return (
    <div>
      {processedData.map(item => (
        <ItemComponent
          key={item.id}
          item={item}
          onAction={handleAction}
        />
      ))}
    </div>
  );
});
```

## ♿ Accessibility Architecture

### Accessibility-First Design

Every component is built with accessibility as a primary concern:

```typescript
// Accessibility hook pattern
const useAccessibility = (props: AccessibilityProps) => {
  const { ariaLabel, ariaLabelledBy, ariaDescribedBy } = props;

  // Generate unique IDs for associations
  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  // Manage focus and announcements
  const announcements = useAnnouncements();
  const focusManagement = useFocusManagement();

  return {
    // ARIA attributes
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy || labelId,
    "aria-describedby": ariaDescribedBy || descriptionId,

    // Focus management
    onFocus: focusManagement.handleFocus,
    onBlur: focusManagement.handleBlur,

    // Screen reader utilities
    announceToScreenReader: announcements.announce,

    // Generated IDs
    ids: {
      label: labelId,
      description: descriptionId,
      error: errorId
    }
  };
};
```

### WCAG 2.1 Compliance

#### Level AA Requirements

1. **Color Contrast**: 4.5:1 ratio for normal text, 3:1 for large text
2. **Keyboard Navigation**: All interactive elements accessible via keyboard
3. **Focus Management**: Visible focus indicators and logical tab order
4. **Screen Reader Support**: Proper ARIA attributes and semantic markup
5. **Responsive Design**: Works at 200% zoom level

#### Implementation Example

```typescript
// Color contrast validation
const validateColorContrast = (
  foreground: string,
  background: string
): boolean => {
  const ratio = calculateContrastRatio(foreground, background);
  return ratio >= 4.5; // WCAG AA standard
};

// Focus management
const useFocusManagement = () => {
  const focusRingRef = useRef<HTMLElement>(null);

  return {
    handleFocus: (event: FocusEvent) => {
      // Show focus ring
      event.target.setAttribute("data-focus-visible", "true");
    },

    handleBlur: (event: FocusEvent) => {
      // Hide focus ring
      event.target.removeAttribute("data-focus-visible");
    }
  };
};
```

## 🧪 Testing Architecture

### Multi-Layer Testing Strategy

```
Testing Pyramid
├── Unit Tests (60%)           # Component logic and props
│   ├── Component rendering
│   ├── Props validation
│   ├── Event handling
│   └── Edge cases
├── Integration Tests (30%)    # Component interactions
│   ├── Form workflows
│   ├── User interactions
│   ├── Accessibility patterns
│   └── Theme integration
└── Visual Tests (10%)         # UI consistency
    ├── Cross-browser screenshots
    ├── Responsive design
    ├── Theme variations
    └── Animation states
```

#### 1. Unit Testing Framework

```typescript
// Component testing pattern
import { render, screen, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('ComponentName', () => {
  it('renders with required props', () => {
    render(<ComponentName title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<ComponentName onClick={handleClick} />);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('meets accessibility standards', async () => {
    const { container } = render(<ComponentName />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

#### 2. Visual Regression Testing

```typescript
// Playwright visual testing
import { test, expect } from "@playwright/test";

test("component visual consistency", async ({ page }) => {
  await page.goto("/storybook/component");

  // Test different states
  await expect(page).toHaveScreenshot("component-default.png");

  await page.click('[data-testid="toggle-state"]');
  await expect(page).toHaveScreenshot("component-active.png");

  // Test responsive design
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page).toHaveScreenshot("component-mobile.png");
});
```

#### 3. Accessibility Testing

```typescript
// Custom accessibility matchers
expect.extend({
  toHaveProperARIA(received: HTMLElement) {
    const issues = [];

    // Check ARIA attributes
    if (!received.getAttribute("aria-label") && !received.textContent) {
      issues.push("Element lacks accessible name");
    }

    return {
      message: () =>
        `Expected proper ARIA attributes. Issues: ${issues.join(", ")}`,
      pass: issues.length === 0
    };
  }
});
```

## 🚀 Performance Architecture

### Bundle Optimization

#### 1. Code Splitting Strategy

```typescript
// Route-based splitting
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));

// Component-based splitting
const AdvancedChart = lazy(() => import("./components/AdvancedChart"));

// Feature-based splitting
const BulkEditFeature = lazy(() => import("./features/BulkEdit"));
```

#### 2. Tree Shaking Optimization

```typescript
// Optimized exports for tree shaking
// ✅ Named exports (tree-shakeable)
export { LazyIcon } from "./LazyIcon";
export { PageHeader } from "./PageHeader";

// ❌ Default export with object (not tree-shakeable)
export default {
  LazyIcon,
  PageHeader
};
```

#### 3. Asset Optimization

```typescript
// Image optimization
const OptimizedImage = ({ src, alt, ...props }: ImageProps) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      setImageSrc(fallbackImage);
      setIsLoading(false);
    };
    img.src = src;
  }, [src]);

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <img
        src={imageSrc}
        alt={alt}
        style={{ display: isLoading ? 'none' : 'block' }}
        {...props}
      />
    </>
  );
};
```

### Runtime Performance

#### 1. Memoization Strategy

```typescript
// Component memoization
const ExpensiveList = memo(({ items, onItemClick }: ListProps) => {
  // Only re-render if items change
  return (
    <div>
      {items.map(item => (
        <MemoizedListItem
          key={item.id}
          item={item}
          onClick={onItemClick}
        />
      ))}
    </div>
  );
});

// Hook memoization
const useExpensiveCalculation = (data: Data[]) => {
  return useMemo(() => {
    return data.reduce((acc, item) => {
      // Expensive calculation
      return acc + complexCalculation(item);
    }, 0);
  }, [data]);
};
```

#### 2. Virtual Scrolling

```typescript
// Virtual list implementation
const VirtualizedList = ({ items, itemHeight = 50 }: VirtualListProps) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(visibleStart, visibleEnd);

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => (
          <div
            key={visibleStart + index}
            style={{
              position: 'absolute',
              top: (visibleStart + index) * itemHeight,
              height: itemHeight,
              width: '100%',
            }}
          >
            <ListItem item={item} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 🔄 State Management Architecture

### Component State Strategy

```typescript
// Local state for UI interactions
const useToggleState = (initialState = false) => {
  const [isToggled, setIsToggled] = useState(initialState);

  const toggle = useCallback(() => {
    setIsToggled((prev) => !prev);
  }, []);

  return { isToggled, toggle, setIsToggled };
};

// Server state for data
const useEntityData = (entityId: string) => {
  return useSWR(`/api/entities/${entityId}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000 // 1 minute
  });
};

// Form state with validation
const useFormWithValidation = <T>(schema: ZodSchema<T>) => {
  const [data, setData] = useState<Partial<T>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(
    async (fieldData: Partial<T>) => {
      try {
        await schema.parseAsync(fieldData);
        setErrors({});
        return true;
      } catch (error) {
        if (error instanceof ZodError) {
          const fieldErrors = error.errors.reduce(
            (acc, err) => {
              const path = err.path.join(".");
              acc[path] = err.message;
              return acc;
            },
            {} as Record<string, string>
          );
          setErrors(fieldErrors);
        }
        return false;
      }
    },
    [schema]
  );

  return { data, setData, errors, validate };
};
```

## 📦 Deployment Architecture

### Build Process

```typescript
// Vite configuration for optimal builds
export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "UixSystem",
      fileName: (format) => `uix-system.${format}.js`
    },
    rollupOptions: {
      external: ["react", "react-dom", "@mantine/core"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "@mantine/core": "MantineCore"
        }
      }
    },
    sourcemap: true,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true // Remove console.log in production
      }
    }
  }
});
```

### Package Distribution

```json
{
  "name": "@repo/uix-system",
  "exports": {
    ".": {
      "import": "./dist/index.es.js",
      "require": "./dist/index.cjs.js",
      "types": "./dist/index.d.ts"
    },
    "./mantine": {
      "import": "./dist/mantine.es.js",
      "types": "./dist/mantine.d.ts"
    },
    "./mantine/backstage": {
      "import": "./dist/mantine/backstage.es.js",
      "types": "./dist/mantine/backstage.d.ts"
    }
  },
  "files": ["dist", "docs", "README.md"]
}
```

## 🔮 Future Architecture Considerations

### Scalability Plans

1. **Multi-Framework Support**: Extend beyond Mantine to support additional UI
   frameworks
2. **Design Token Pipeline**: Automated design token generation from design
   tools
3. **AI-Assisted Testing**: Automated accessibility and visual testing
4. **Micro-Frontend Ready**: Architecture that supports micro-frontend
   deployment

### Performance Targets

- **Bundle Size**: <100KB for core components
- **Tree Shaking**: 90%+ unused code elimination
- **Loading Speed**: <200ms component initialization
- **Accessibility**: 100% WCAG 2.1 AA compliance
- **Browser Support**: Modern browsers (ES2020+)

## 📊 Metrics and Monitoring

### Key Performance Indicators

```typescript
// Performance monitoring integration
const ComponentMetrics = {
  // Bundle metrics
  bundleSize: "Total package size in KB",
  treeShakingEfficiency: "Percentage of unused code eliminated",

  // Runtime metrics
  componentRenderTime: "Average render time per component",
  memoryUsage: "Peak memory usage during rendering",

  // Accessibility metrics
  wcagComplianceScore: "Percentage of WCAG 2.1 AA requirements met",
  keyboardNavigationCoverage:
    "Percentage of interactive elements keyboard accessible",

  // Developer experience metrics
  apiConsistencyScore: "Consistency of component APIs",
  documentationCoverage: "Percentage of components with complete documentation"
};
```

This architecture provides a solid foundation for the Unified UI System,
ensuring scalability, maintainability, and excellent developer experience while
maintaining high performance and accessibility standards.
