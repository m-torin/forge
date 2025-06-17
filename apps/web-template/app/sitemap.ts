import { generateSitemapObject, type DynamicSitemapRoute } from '@repo/seo/server/next';
import { getProducts } from '@/actions/products';
import { getArticles } from '@/actions/articles';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';
  const locales = ['en', 'es', 'fr', 'de', 'pt'];

  // Fetch dynamic content
  const products = await getProducts();
  const blogPosts = await getArticles();

  const routes: DynamicSitemapRoute[] = [];

  // Add static pages for each locale
  locales.forEach((locale: any) => {
    // Homepage
    routes.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    });

    // Static pages
    const staticPages = [
      { path: 'about', changeFrequency: 'monthly' as const, priority: 0.8 },
      { path: 'contact', changeFrequency: 'monthly' as const, priority: 0.7 },
      { path: 'brands', changeFrequency: 'weekly' as const, priority: 0.8 },
      { path: 'collections', changeFrequency: 'weekly' as const, priority: 0.8 },
      { path: 'blog', changeFrequency: 'daily' as const, priority: 0.9 },
      { path: 'search', changeFrequency: 'weekly' as const, priority: 0.7 },
    ];

    staticPages.forEach((page: any) => {
      routes.push({
        url: `${baseUrl}/${locale}/${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      });
    });

    // Dynamic product pages
    products.data.forEach((product: any) => {
      routes.push({
        url: `${baseUrl}/${locale}/products/${product.slug}`,
        lastModified: new Date(product.updatedAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      });
    });

    // Dynamic blog pages
    blogPosts.data.forEach((post: any) => {
      routes.push({
        url: `${baseUrl}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt || post.createdAt || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      });
    });
  });

  return generateSitemapObject(routes);
}
