import { cache } from "react";
import {
  getDictionary as getBaseDictionary,
  createDictionary,
} from "@repo/internationalization/server/next";
import { fallbackDictionary } from "./fallback-dictionary";

const getAppDictionary = cache(async (locale: string) => {
  const normalizedLocale = locale.split("-")[0]; // Handle fr-CA -> fr
  try {
    const dict = await import(`./dictionaries/${normalizedLocale}.json`);
    return dict.default;
  } catch {
    console.warn(
      `Failed to load dictionary for locale ${normalizedLocale}, trying English`,
    );
    try {
      // Try to fallback to English
      const dict = await import("./dictionaries/en.json");
      return dict.default;
    } catch (enError) {
      console.error(
        "Failed to load English dictionary, using fallback:",
        enError,
      );
      // Use the hardcoded fallback dictionary as last resort
      return fallbackDictionary;
    }
  }
});

const cachedGetBaseDictionary = cache(getBaseDictionary);

// Wrap dictionary creation with error handling
const createSafeDictionary = cache(async (locale: string) => {
  try {
    const dictFunction = createDictionary(
      cachedGetBaseDictionary,
      getAppDictionary,
    );
    const result = await dictFunction(locale);
    return result;
  } catch (error) {
    console.error(`Failed to create dictionary for locale ${locale}:`, error);
    // Return fallback dictionary merged with empty base dictionary
    return {
      ...fallbackDictionary,
      // Add any base dictionary keys that might be expected
    };
  }
});

export const getDictionary = createSafeDictionary;

// Re-export useful utilities from the base package
export {
  locales,
  isLocaleSupported,
} from "@repo/internationalization/server/next";
export type {
  Dictionary,
  Locale,
} from "@repo/internationalization/server/next";

// Type for app-specific dictionary
export type AppDictionary = typeof import("./dictionaries/en.json");
export type ExtendedDictionary = Awaited<ReturnType<typeof getDictionary>>;
