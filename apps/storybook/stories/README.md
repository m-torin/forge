# Storybook Stories Organization

**Note: Stories have been moved to live next to their components in the
design-system package.**

Stories are now co-located with their components for better organization:

## New Story Locations

### Ciseco E-commerce Stories

Stories are located in `/packages/design-system/ciseco/components/[component]/`

- E-commerce focused components for online stores
- Product cards, shopping carts, checkout flows
- E-commerce specific headers, heroes, and layouts
- Built with Tailwind CSS and e-commerce best practices

### Algolia Search Stories

Stories are located in `/packages/design-system/algolia/components/[component]/`

- Search components powered by Algolia
- Search boxes, results, autocomplete, and providers
- E-commerce search examples
- Documentation search patterns

## Story Categories

Stories maintain their hierarchical organization:

- `ciseco/ProductCard` - E-commerce product card
- `algolia/SearchBox` - Search input component

## Usage

Run Storybook to explore all components:

```bash
pnpm dev
# Storybook runs on http://localhost:3700
```

## Component Import Examples

```typescript
// Ciseco components
import { ProductCard, Header } from "@repo/uix-system/mantine";

// Algolia components
import { SearchBox, SearchProvider } from "@repo/uix-system/algolia";
```

## Features

- **Interactive Controls** - Adjust component props in real-time
- **Responsive Design** - Test components across different screen sizes
- **Dark Mode Support** - Toggle between light and dark themes
- **Accessibility** - Components built with a11y best practices
- **Documentation** - Auto-generated docs from TypeScript types
