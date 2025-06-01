# Ciesco2 Design System

This directory contains all the migrated components from the Ciseco Next.js application.

## Directory Structure

- `components/` - Main UI components
  - `aside/` - Aside/drawer components
  - `blog/` - Blog-related components
  - `Header/` - Header and navigation components
  - `listing-image-gallery/` - Image gallery components
  - `SectionGridMoreExplore/` - Grid and explore components
  - `SectionHero/` - Hero section components
  - `SectionHowItWork/` - How it works section
- `shared/` - Shared/reusable components
  - `Alert/`, `Avatar/`, `Badge/` - Basic UI components
  - `Button/` - Button variants
  - `Footer/`, `Logo/` - Layout components
  - `Input/`, `Select/`, `Textarea/` - Form components
  - `Nav/`, `NavItem/` - Navigation components
  - `SocialsList/`, `SocialsShare/` - Social media components
  - `SwitchDarkMode/` - Theme switching components
- `page-components/` - Page-specific components
  - `about/` - About page components
  - `accounts/` - Account page components
  - `checkout/` - Checkout page components
  - `products/` - Product page components
- `data/` - Data and configuration files
- `hooks/` - Custom React hooks
- `utils/` - Utility functions
- `types/` - TypeScript type definitions
- `styles/` - CSS styles

## Usage

Import components from `@repo/design-system/ciesco2`:

```typescript
import { Button, Header, ProductCard } from '@repo/design-system/ciesco2';
```

## Components

All components are built with:

- React 19.1.0
- TypeScript
- Tailwind CSS v4
- Next.js compatibility

## Migration Notes

This is a complete migration of all components from the Ciseco Next.js application to the design
system package for better reusability across the monorepo.
