export default {
  // Auto-format staged files (Layer 1: file-level formatting only)
  // ESLint runs in Layer 2 via Turbo per-package with proper configs
  '**/*.{ts,tsx,js,jsx,json,md,mdx,yaml,yml,css,scss}': [
    'pnpm exec prettier --write'
  ]
};
