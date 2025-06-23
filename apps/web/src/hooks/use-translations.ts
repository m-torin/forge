"use client";

import { useParams } from "next/navigation";
import type { ExtendedDictionary } from "@/i18n";

/**
 * Client-side hook for accessing translations
 *
 * This hook provides access to translation data that was loaded server-side
 * and passed to the client. It also provides the current locale.
 */
export function useTranslations() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  return {
    locale,
    isDefaultLocale: locale === "en",
  };
}

/**
 * Type-safe translation path helper
 *
 * This function provides type-safe access to nested translation keys
 */
export function getTranslationPath<T extends ExtendedDictionary>(
  dictionary: T,
  path: string,
): unknown {
  return path
    .split(".")
    .reduce(
      (obj: unknown, key: string) => (obj as Record<string, unknown>)?.[key],
      dictionary,
    );
}

/**
 * Hook for formatting translation strings with parameters
 */
export function useFormatTranslation() {
  const formatTranslation = (
    text: string,
    params: Record<string, string | number> = {},
  ): string => {
    return Object.entries(params).reduce(
      (acc, [key, value]) =>
        acc.replace(new RegExp(`\\{${key}\\}`, "g"), String(value)),
      text,
    );
  };

  return { formatTranslation };
}
