import { getProducts } from '@/actions/products';
import { getCollections } from '@/actions/collections';
import { getArticles } from '@/actions/articles';
import { type Metadata } from 'next';
import Link from 'next/link';

import { Heading } from '@/components/ui';

export const metadata: Metadata = {
  description: 'Browse all pages and sections of our online store',
  title: 'Sitemap - All Pages',
};

export default async function SitemapPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Fetch dynamic data for dynamic routes
  const products = await getProducts({ limit: 100 });
  const collections = await getCollections({ limit: 100 });
  const blogPosts = await getArticles({ limit: 100 });

  // Take a sample of products and collections for the sitemap
  const sampleProducts = products.data.slice(0, 5);
  const sampleCollections = collections.data.slice(0, 5);
  const sampleBlogPosts = blogPosts.data.slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-16">
      <Heading className="text-center mb-12">Sitemap</Heading>

      <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {/* Main Pages */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
            Main Pages
          </h2>
          <ul className="space-y-2">
            <li>
              <Link
                href={`/${locale}`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/home-2`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Home 2 (Alternative)
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/about`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/contact`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/coming-soon`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Coming Soon
              </Link>
            </li>
          </ul>
        </div>

        {/* Shop Pages */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
            Shop Pages
          </h2>
          <ul className="space-y-2">
            <li>
              <Link
                href={`/${locale}/collections/all`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                All Collections
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/collections/page-style-2/all`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Collections (Style 2)
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/search`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Search
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/cart`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Shopping Cart
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/checkout`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Checkout
              </Link>
            </li>
          </ul>
        </div>

        {/* Account Pages */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
            Account Pages
          </h2>
          <ul className="space-y-2">
            <li>
              <Link
                href={`/${locale}/login`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/signup`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Sign Up
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/forgot-password`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Forgot Password
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/account`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                My Account
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/account-wishlists`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                My Wishlists
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/orders`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Order History
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/orders/4657`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Order Detail (Example)
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/order-successful`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Order Successful
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/subscription`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Subscription
              </Link>
            </li>
          </ul>
        </div>

        {/* Sample Collections */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
            Sample Collections
          </h2>
          <ul className="space-y-2">
            {sampleCollections
              .filter((collection: any) => collection?.slug || collection?.handle)
              .map((collection: any) => (
                <li key={collection.id}>
                  <Link
                    href={`/${locale}/collections/${collection.slug || collection.handle}`}
                    className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    {collection.name || collection.title}
                  </Link>
                </li>
              ))}
            <li className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              + {collections.data.length - 5} more collections
            </li>
          </ul>
        </div>

        {/* Sample Products */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
            Sample Products
          </h2>
          <ul className="space-y-2">
            {sampleProducts.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/${locale}/products/${product.id}`}
                  className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  {product.name}
                </Link>
              </li>
            ))}
            <li className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              + {products.data.length - 5} more products
            </li>
          </ul>
        </div>

        {/* Blog */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
            Blog
          </h2>
          <ul className="space-y-2">
            <li>
              <Link
                href={`/${locale}/blog`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Blog Home
              </Link>
            </li>
            {sampleBlogPosts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/${locale}/blog/${post.slug}`}
                  className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  {post.title}
                </Link>
              </li>
            ))}
            <li className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              + {blogPosts.data.length - 5} more posts
            </li>
          </ul>
        </div>

        {/* Special Pages */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
            Special Pages
          </h2>
          <ul className="space-y-2">
            <li>
              <Link
                href={`/${locale}/brands/nike`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Brand: Nike (Example)
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/events/summer-sale-2024`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Event: Summer Sale (Example)
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/locations/new-york`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Location: New York (Example)
              </Link>
            </li>
          </ul>
        </div>

        {/* Test & Demo Pages */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
            Test & Demo Pages
          </h2>
          <ul className="space-y-2">
            <li>
              <Link
                href={`/${locale}/test-drawers`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Test Drawers
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/test-drawers-manual`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Test Drawers Manual
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/products/unified/leather-tote-bag`}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Unified Product Page (Example)
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-16 text-center text-sm text-neutral-500 dark:text-neutral-400">
        <p>This sitemap shows all major pages in our store.</p>
        <p>Dynamic pages (products, collections, blog posts) show only a sample.</p>
      </div>
    </div>
  );
}
