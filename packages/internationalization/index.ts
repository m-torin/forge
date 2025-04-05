import "server-only";

import languine from "./languine.json";

import type en from "./dictionaries/en.json";
import type { I18nConfig } from "./types";

export const locales = [
  languine.locale.source,
  ...languine.locale.targets,
] as const;

export type Dictionary = typeof en;

const dictionaries: Record<string, () => Promise<Dictionary>> =
  Object.fromEntries(
    locales.map((locale) => [
      locale,
      () =>
        import(`./dictionaries/${locale}.json`)
          .then((mod) => mod.default)
          .catch((err) => {
            console.error(
              `Failed to load dictionary for locale: ${locale}`,
              err,
            );
            return import("./dictionaries/en.json").then((mod) => mod.default);
          }),
    ]),
  );

export const getDictionary = async (locale: string): Promise<Dictionary> => {
  const normalizedLocale = locale.split("-")[0];

  if (!locales.includes(normalizedLocale as any)) {
    console.warn(`Locale "${locale}" is not supported, defaulting to "en"`);
    return dictionaries["en"]();
  }

  try {
    return await dictionaries[normalizedLocale]();
  } catch (error) {
    console.error(
      `Error loading dictionary for locale "${normalizedLocale}", falling back to "en"`,
      error,
    );
    return dictionaries["en"]();
  }
};

export async function loadMessages(
  locale: string,
  namespace: string,
): Promise<Record<string, string>> {
  try {
    const messages = await import(`./messages/${locale}/${namespace}.json`);
    return messages.default || {};
  } catch (error) {
    console.error(`Failed to load messages for ${locale}/${namespace}:`, error);
    return {};
  }
}

export async function initializeI18n(config: I18nConfig): Promise<void> {
  const { namespaces, defaultLocale } = config;

  // Load all messages in parallel
  const messagePromises = namespaces.map((namespace) =>
    loadMessages(defaultLocale, namespace),
  );

  try {
    await Promise.all(messagePromises);
  } catch (error) {
    console.error("Failed to initialize i18n:", error);
  }
}
