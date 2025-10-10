/**
 * Client-side internationalization exports for Next.js
 *
 * This file provides client-side internationalization functionality specifically for Next.js applications.
 * Use this in client components, browser environments, and client-side routing.
 *
 * For non-Next.js applications, use '@repo/internationalization/client' instead.
 */

// Re-export all client-side hooks from next-intl
export {
  NextIntlClientProvider,
  useFormatter,
  useTranslations as useI18n,
  useLocale,
  useMessages,
  useNow,
  useTimeZone,
  useTranslations,
} from "next-intl";

// Re-export navigation components from our navigation module
export {
  Link,
  permanentRedirect,
  redirect,
  usePathname,
  useRouter,
} from "./navigation";

// Re-export types
export type { Locale } from "./routing";

// Provide a compatibility hook for locale switching
export { useRouter as useChangeLocale } from "./navigation";

// Export useLocale as useCurrentLocale for compatibility
export { useLocale as useCurrentLocale } from "next-intl";
