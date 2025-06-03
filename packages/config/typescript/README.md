# TypeScript Config

Shared TypeScript configurations for the monorepo.

## Available Configurations

- `base.json` - Base configuration for all TypeScript projects
- `nextjs.json` - Next.js specific configuration
- `react-library.json` - React library configuration

## Usage

### Next.js App

```json
{
  "extends": "@repo/config/typescript/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### React Library

```json
{
  "extends": "@repo/config/typescript/react-library.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Configuration Details

### Base Configuration

- Target: ES2022
- Module: ESNext
- Strict mode enabled
- ESM modules with bundler resolution
- JSX: react-jsx transform

### Next.js Configuration

- Extends base configuration
- Module resolution: Bundler
- JSX: preserve (for Next.js processing)
- Next.js plugin included
- Paths configured for monorepo structure

### React Library Configuration

- Extends base configuration
- Declaration files enabled
- Source maps included
- JSX: react-jsx transform
