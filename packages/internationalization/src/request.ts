/**
 * Request-scoped configuration for next-intl
 * This file is used by the next-intl plugin to provide
 * messages and other i18n settings to Server Components
 */

import { logError, logWarn } from "@repo/observability/server";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import type { Locale } from "./routing";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  const requested = await requestLocale;

  // Validate that the requested locale is supported
  const locale =
    requested && hasLocale(routing.locales, requested)
      ? (requested as Locale)
      : routing.defaultLocale;

  if (requested && requested !== locale) {
    logWarn(
      `Unsupported locale "${requested}" requested, falling back to "${locale}"`,
    );
  }

  try {
    // Load messages for the determined locale
    const messages = (await import(`./dictionaries/${locale}.json`)).default;

    return {
      locale,
      messages,
      // Optional: Add default formats for dates, numbers, etc.
      formats: {
        dateTime: {
          short: {
            day: "numeric",
            month: "short",
            year: "numeric",
          },
        },
        number: {
          currency: {
            style: "currency",
            currency: "USD",
          },
        },
      },
      // Optional: Configure default timezone
      timeZone: "UTC",
      // Optional: Set the current time for consistent server/client rendering
      now: new Date(),
    };
  } catch (error) {
    logError(`Failed to load messages for locale "${locale}"`, {
      error: error instanceof Error ? error.message : String(error),
    });

    // Fallback to English messages
    try {
      const fallbackMessages = (await import("./dictionaries/en.json")).default;
      return {
        locale: "en",
        messages: fallbackMessages,
        timeZone: "UTC",
        now: new Date(),
      };
    } catch (fallbackError) {
      logError("Failed to load fallback messages", {
        error:
          fallbackError instanceof Error
            ? fallbackError.message
            : String(fallbackError),
      });
      throw new Error("Unable to load any translation messages");
    }
  }
});
