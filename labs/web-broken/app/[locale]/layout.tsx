import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { getDictionary, locales, isLocaleSupported } from "@/i18n";
import { LocaleLayoutUI } from "./LocaleLayoutUI";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Generate metadata for each locale
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  // Validate locale
  if (!isLocaleSupported(locale)) {
    notFound();
  }

  try {
    const dictionary = await getDictionary(locale);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3200";

    // Generate alternate language links
    const languages: Record<string, string> = {};
    for (const locale of locales) {
      const path = locale === "en" ? "/" : `/${locale}`;
      languages[locale] = `${baseUrl}${path}`;
    }

    return {
      title: dictionary.metadata.title,
      description: dictionary.metadata.description,
      alternates: {
        canonical: locale === "en" ? `${baseUrl}/` : `${baseUrl}/${locale}`,
        languages,
      },
      openGraph: {
        title: dictionary.metadata.title,
        description: dictionary.metadata.description,
        locale: locale,
        alternateLocale: locales.filter((l) => l !== locale),
      },
      other: {
        "og:locale": locale,
      },
    };
  } catch (error) {
    // Fallback metadata if dictionary fails to load
    console.error(`Failed to load dictionary for locale ${locale}:`, error);
    return {
      title: "Web App",
      description: "A modern web application",
    };
  }
}

/**
 * Locale-specific layout
 *
 * This server component handles:
 * - Locale validation
 * - Dictionary loading with error handling
 * - Passing data to client-side LocaleLayoutUI
 */
export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps): Promise<React.JSX.Element> {
  const { locale } = await params;

  // Validate locale exists
  if (!isLocaleSupported(locale)) {
    notFound();
  }

  let dictionary;

  try {
    dictionary = await getDictionary(locale);
  } catch (error) {
    console.error(`Failed to load dictionary for locale ${locale}:`, error);
    // You could return an error page here or use a fallback dictionary
    // For now, we'll let the app continue with potentially missing translations
  }

  // Since this is a child of the root layout, we don't need to render HTML structure
  // Just pass the providers and app layout
  const safeDictionary = dictionary || {};

  return (
    <LocaleLayoutUI locale={locale} dictionary={safeDictionary}>
      {children}
    </LocaleLayoutUI>
  );
}

/**
 * Generate static parameters for non-default locales
 * English is handled at the root level for transparent routing
 */
export function generateStaticParams() {
  return locales
    .filter((locale) => locale !== "en")
    .map((locale) => ({ locale }));
}
