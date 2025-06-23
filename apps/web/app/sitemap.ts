import { MetadataRoute } from "next";
import { locales } from "@repo/internationalization/server/next";

/**
 * Generate sitemap for all locales
 *
 * This creates a sitemap that includes all pages for all supported locales,
 * helping search engines discover and index the multilingual content.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3200";

  // Define all routes that should be included in the sitemap
  const routes = [
    "", // Home page
    // Add more routes here as you create them
    // '/about',
    // '/contact',
  ];

  const sitemap: MetadataRoute.Sitemap = [];

  // Generate sitemap entries for each locale and route
  for (const locale of locales) {
    for (const route of routes) {
      const isDefaultLocale = locale === "en";
      const localizedPath = isDefaultLocale
        ? route || "/"
        : `/${locale}${route || ""}`;

      sitemap.push({
        url: `${baseUrl}${localizedPath}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: route === "" ? 1.0 : 0.8,
        // Add alternate language links
        alternates: {
          languages: Object.fromEntries(
            locales.map((loc) => {
              const altPath =
                loc === "en" ? route || "/" : `/${loc}${route || ""}`;
              return [loc, `${baseUrl}${altPath}`];
            }),
          ),
        },
      });
    }
  }

  return sitemap;
}
