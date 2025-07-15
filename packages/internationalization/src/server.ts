/**
 * Server-side internationalization exports (non-Next.js)
 *
 * This file provides server-side internationalization functionality for non-Next.js environments.
 * Use this for API routes, server components, and server-side dictionary loading.
 *
 * For Next.js applications, use '@repo/internationalization/server/next' instead.
 */

import 'server-only';

import { createDictionaryLoader } from './shared/dictionary-loader';

// Create dictionary loader instance
const dictionaryLoader = createDictionaryLoader();

// Re-export types and utilities from shared loader
export type { Dictionary, Locale } from './shared/dictionary-loader';
export const locales = dictionaryLoader.getLocales();
export const getDictionary = dictionaryLoader.getDictionary;
export const isLocaleSupported = dictionaryLoader.isLocaleSupported;
