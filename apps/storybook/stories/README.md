# Storybook Stories Organization

**Note: Stories have been moved to live next to their components in the design-system package.**

Stories are now co-located with their components for better organization:

## New Story Locations

### UIX Design System Stories
Stories are located in `/packages/design-system/uix/components/ui/[component]/`
- **Core UI components** - buttons, inputs, cards, etc. based on shadcn/ui and Mantine
- **Authentication components** - sign-in, user-button, etc. in `/auth/`
- **Admin panel components** - user management, etc. in `/admin/`

### Ciesco2 E-commerce Stories  
Stories are located in `/packages/design-system/ciesco2/components/[component]/`
- E-commerce focused components for online stores
- Product cards, shopping carts, checkout flows
- E-commerce specific headers, heroes, and layouts
- Built with Tailwind CSS and e-commerce best practices

### Gluestack React Native Stories
Stories are located in `/packages/design-system/gluestack/components/[component]/`
- Cross-platform components for React Native
- Mobile-first design patterns
- Works with React Native Web for web compatibility
- Consistent styling across iOS, Android, and web

### Algolia Search Stories
Stories are located in `/packages/design-system/algolia/components/[component]/`
- Search components powered by Algolia
- Search boxes, results, autocomplete, and providers
- E-commerce search examples
- Documentation search patterns

## Story Categories

Stories maintain their hierarchical organization:
- `uix/ui/Button` - Core UI button component
- `ciesco2/ProductCard` - E-commerce product card  
- `gluestack/Button` - React Native button
- `algolia/SearchBox` - Search input component

## Usage

Run Storybook to explore all components:

```bash
pnpm dev
# Storybook runs on http://localhost:3700
```

## Component Import Examples

```typescript
// UIX components
import { Button, Card } from '@repo/design-system/uix';

// Ciesco2 components  
import { ProductCard, Header } from '@repo/design-system/ciesco2';

// Gluestack components
import { Button, Input } from '@repo/design-system/gluestack';

// Algolia components
import { SearchBox, SearchProvider } from '@repo/design-system/algolia';
```

## Features

- **Interactive Controls** - Adjust component props in real-time
- **Responsive Design** - Test components across different screen sizes  
- **Dark Mode Support** - Toggle between light and dark themes
- **Accessibility** - Components built with a11y best practices
- **Documentation** - Auto-generated docs from TypeScript types
- **Cross-Platform** - React Native components work on web via react-native-web