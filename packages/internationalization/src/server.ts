/**
 * Server-side internationalization exports (non-Next.js)
 *
 * This file provides server-side internationalization functionality for non-Next.js environments.
 * Use this for API routes, server components, and server-side dictionary loading.
 *
 * For Next.js applications, use '@repo/internationalization/server/next' instead.
 */

import 'server-only';

// Import shared functionality for dictionary loading
import type { Dictionary } from './shared/dictionary-loader';
import { createDictionaryLoader } from './shared/dictionary-loader';

// Re-export routing configuration
export { locales, routing, type Locale } from './routing';

// Create dictionary loader instance
const dictionaryLoader = createDictionaryLoader();

// Export dictionary-related functions
export const getDictionary = dictionaryLoader.getDictionary;
export const isLocaleSupported = dictionaryLoader.isLocaleSupported;

// Re-export Dictionary type
export type { Dictionary };
