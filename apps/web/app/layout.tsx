import type { Metadata } from "next";
import "./globals.css";
import { getDictionary } from "@/i18n";
import { RootLayoutUI } from "./RootLayoutUI";

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Generate metadata for the English root route
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const dictionary = await getDictionary("en");
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3200";

    return {
      title: dictionary.metadata.title,
      description: dictionary.metadata.description,
      alternates: {
        canonical: `${baseUrl}/`,
        languages: {
          en: `${baseUrl}/`,
          fr: `${baseUrl}/fr`,
          es: `${baseUrl}/es`,
          pt: `${baseUrl}/pt`,
          de: `${baseUrl}/de`,
        },
      },
      openGraph: {
        title: dictionary.metadata.title,
        description: dictionary.metadata.description,
        locale: "en",
        alternateLocale: ["fr", "es", "pt", "de"],
      },
    };
  } catch (error) {
    // Fallback metadata if dictionary fails to load
    console.error("Failed to load dictionary for metadata:", error);
    return {
      title: "Web App",
      description: "A modern web application",
    };
  }
}

/**
 * Root layout that applies to ALL routes
 *
 * This is the top-level layout that wraps the entire application.
 * It only renders the HTML structure and defers content to child layouts.
 */
export default async function RootLayout({
  children,
}: RootLayoutProps): Promise<React.JSX.Element> {
  return <RootLayoutUI>{children}</RootLayoutUI>;
}
