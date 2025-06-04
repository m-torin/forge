import {
  getBrands,
  getEvents,
  getLocations,
  getProducts,
} from "@/actions/products";
import { type MetadataRoute } from "next";

import { getBlogPosts } from "@repo/design-system/mantine-ciseco";

// Supported languages from your i18n config
const languages = ["en", "fr", "es", "pt", "de"];
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";

// Enable ISR with 4-hour revalidation
export const revalidate = 14400; // 4 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all data using server actions
  const [products, brands, events, locations, blogPosts] = await Promise.all([
    getProducts({ limit: 10000 }), // Fetch all products
    getBrands(),
    getEvents(),
    getLocations(),
    getBlogPosts(),
  ]);

  // Helper function to create multilingual URLs
  const createMultilingualUrls = (path: string) => {
    return languages.map((lang) => ({
      url: `${baseUrl}/${lang}${path}`,
      changeFrequency: "daily" as const,
      lastModified: new Date(),
      priority: 0.8,
    }));
  };

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    // Home pages for each language
    ...languages.map((lang) => ({
      url: `${baseUrl}/${lang}`,
      changeFrequency: "daily" as const,
      lastModified: new Date(),
      priority: 1.0,
    })),
    // Other static pages
    ...createMultilingualUrls("/about"),
    ...createMultilingualUrls("/contact"),
    ...createMultilingualUrls("/cart"),
    ...createMultilingualUrls("/checkout"),
    ...createMultilingualUrls("/subscription"),
    ...createMultilingualUrls("/blog"),
    ...createMultilingualUrls("/collections"),
    ...createMultilingualUrls("/brands"),
    ...createMultilingualUrls("/events"),
    ...createMultilingualUrls("/locations"),
  ];

  // Product pages
  const productPages: MetadataRoute.Sitemap = products.items.flatMap(
    (product) =>
      languages.map((lang) => ({
        url: `${baseUrl}/${lang}/products/${product.handle}`,
        changeFrequency: "weekly" as const,
        lastModified: product.updatedAt || new Date(),
        priority: 0.7,
      })),
  );

  // Brand pages
  const brandPages: MetadataRoute.Sitemap = brands.flatMap((brand) =>
    languages.map((lang) => ({
      url: `${baseUrl}/${lang}/brands/${brand.slug}`,
      changeFrequency: "weekly" as const,
      lastModified: new Date(),
      priority: 0.6,
    })),
  );

  // Event pages
  const eventPages: MetadataRoute.Sitemap = events.flatMap((event) =>
    languages.map((lang) => ({
      url: `${baseUrl}/${lang}/events/${event.slug}`,
      changeFrequency: "weekly" as const,
      lastModified: new Date(),
      priority: 0.6,
    })),
  );

  // Location pages
  const locationPages: MetadataRoute.Sitemap = locations.flatMap((location) =>
    languages.map((lang) => ({
      url: `${baseUrl}/${lang}/locations/${location.slug}`,
      changeFrequency: "monthly" as const,
      lastModified: new Date(),
      priority: 0.5,
    })),
  );

  // Blog post pages
  const blogPages: MetadataRoute.Sitemap = blogPosts.flatMap((post) =>
    languages.map((lang) => ({
      url: `${baseUrl}/${lang}/blog/${post.handle}`,
      changeFrequency: "monthly" as const,
      lastModified: post.publishedAt || new Date(),
      priority: 0.6,
    })),
  );

  // Combine all pages
  return [
    ...staticPages,
    ...productPages,
    ...brandPages,
    ...eventPages,
    ...locationPages,
    ...blogPages,
  ];
}
