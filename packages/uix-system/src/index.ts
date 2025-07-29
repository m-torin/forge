/**
 * @repo/uix-system
 *
 * UIX System - Design system foundations and utilities
 * No React components - pure utilities, constants, and types only
 *
 * Main exports - choose your design system:
 * - Use @repo/uix-system/mantine for Mantine v8
 * - Use @repo/uix-system/tailwind for Tailwind CSS (v3/v4)
 */

// Note: Import from specific routes for better tree-shaking
// @repo/uix-system/mantine - for Mantine v8 utilities
// @repo/uix-system/tailwind - for Tailwind CSS utilities

// Shared UI components
export { I18nLink, InternationalizationLink } from './shared/i18n';
export type { I18nLinkProps } from './shared/i18n';
