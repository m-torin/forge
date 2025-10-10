/**
 * Type augmentation support for next-intl
 * Allows users to extend the Messages type with their own shape
 */

import type { routing } from "./routing";

// Re-export the Locale type from routing
export type Locale = (typeof routing.locales)[number];

// Module augmentation for next-intl v4
declare module "next-intl" {
  interface AppConfig {
    // Define the Locale type based on the routing configuration
    Locale: (typeof routing.locales)[number];

    // Messages and Formats can be augmented by the user
    // Example:
    // Messages: typeof import('./messages/en.json');
    // Formats: typeof import('./i18n/request').formats;
  }

  // If using pathnames configuration, this allows type-safe pathname keys
  interface Pathnames {
    [key: string]: string | { [locale in Locale]: string };
  }
}

// Export helper types for better DX
export type LocalePrefix = "always" | "as-needed" | "never";

export interface LocalePrefixConfig<L extends string = Locale> {
  mode: LocalePrefix;
  prefixes?: Record<L, string>;
}

export interface DomainConfig<L extends string = Locale> {
  domain: string;
  defaultLocale: L;
  locales?: L[];
}

export interface RoutingConfig<L extends string = Locale> {
  locales: readonly L[];
  defaultLocale: L;
  localePrefix?: LocalePrefix | LocalePrefixConfig<L>;
  localeDetection?: boolean;
  alternateLinks?: boolean;
  pathnames?: Record<string, string | Record<L, string>>;
  domains?: DomainConfig<L>[];
}
