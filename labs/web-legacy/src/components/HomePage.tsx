import React, { Suspense } from 'react';
import Image from 'next/image';

import SectionGridFeatureItems from '@/components/sections/SectionGridFeatureItems';
import SectionSliderLargeProduct from '@/components/sections/SectionSliderLargeProduct';
import { SectionPromo2 } from '@/components/ui';

import type { TProductItem, TCollection, TBlogPost } from '@/types';

interface HomePageProps {
  dict: any;
  locale: string;
  featuredProducts: TProductItem[];
  recentProducts: TProductItem[];
  featuredCollections: TCollection[];
  featuredArticles: TBlogPost[];
}

// Loading component for sections (Tailwind-only)
function SectionLoader() {
  return (
    <div className="py-16 flex flex-col items-center justify-center gap-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
      <p className="text-sm text-gray-600 dark:text-gray-400">Loading content...</p>
    </div>
  );
}

// Zero state for empty sections
function EmptyHomeState({ dict, locale }: { dict: any; locale: string }) {
  return (
    <div className="container mx-auto px-4">
      <div className="text-center py-16 lg:py-28">
        <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50 mb-4">
          {dict.home?.welcomeTitle || 'Welcome to Our Store'}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
          {dict.home?.welcomeMessage ||
            "We're setting up amazing products for you. Check back soon!"}
        </p>
        <a
          href={`/${locale}/products`}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {dict.home?.browseProducts || 'Browse Products'}
        </a>
      </div>
    </div>
  );
}

export function HomePage({
  dict,
  locale,
  featuredProducts,
  recentProducts,
  featuredCollections,
  featuredArticles,
}: HomePageProps) {
  // Check if we have any content to display
  const hasContent =
    featuredProducts.length > 0 ||
    recentProducts.length > 0 ||
    featuredCollections.length > 0 ||
    featuredArticles.length > 0;

  if (!hasContent) {
    return <EmptyHomeState dict={dict} locale={locale} />;
  }

  return (
    <div className="nc-PageHome relative overflow-hidden">
      {/* Hero Section with Featured Products */}
      {featuredProducts.length > 0 && (
        <Suspense fallback={<SectionLoader />}>
          <SectionSliderLargeProduct
            className="pt-10 pb-16 md:py-16 lg:pb-28 lg:pt-20"
            heading={dict.home?.featuredProducts || 'Featured Products'}
            headingDim={dict.home?.handpicked || 'Handpicked for you'}
            products={featuredProducts}
            showMoreHref={`/${locale}/products`}
          />
        </Suspense>
      )}

      {/* Product Grid Section */}
      {recentProducts.length > 0 && (
        <Suspense fallback={<SectionLoader />}>
          <div className="pb-16 lg:pb-28">
            <SectionGridFeatureItems
              data={recentProducts.slice(0, 8)}
              heading={dict.home?.discoverProducts || 'Discover Amazing Products'}
              showMoreHref={`/${locale}/products`}
              showMoreText={dict.home?.shopAll || 'Shop All Products'}
            />
          </div>
        </Suspense>
      )}

      {/* Promo Section */}
      <Suspense fallback={<SectionLoader />}>
        <div className="pb-16 lg:pb-28">
          <SectionPromo2 />
        </div>
      </Suspense>

      {/* Collections Preview */}
      {featuredCollections.length > 0 && (
        <Suspense fallback={<SectionLoader />}>
          <div className="pb-16 lg:pb-28">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12 lg:mb-14">
                <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
                  {dict.home?.featuredCollections || 'Featured Collections'}
                </h2>
                <p className="mt-4 text-neutral-600 dark:text-neutral-400">
                  {dict.home?.collectionsSubtext || 'Curated collections for every style'}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredCollections.slice(0, 6).map((collection) => (
                  <div
                    key={collection.id}
                    className="group relative overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800"
                  >
                    <div className="aspect-[4/3] w-full">
                      {collection.image?.src ? (
                        <Image
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          src={collection.image.src}
                          alt={collection.image.alt || collection.title}
                          width={400}
                          height={300}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/30 flex items-end">
                      <div className="p-6 text-white">
                        <h3 className="text-xl font-semibold mb-2">{collection.title}</h3>
                        {collection.description && (
                          <p className="text-sm opacity-90">{collection.description}</p>
                        )}
                        <p className="text-sm mt-2 opacity-75">
                          {collection.count} {dict.home?.items || 'items'}
                        </p>
                      </div>
                    </div>
                    <a
                      href={`/${locale}/collections/${collection.handle}`}
                      className="absolute inset-0"
                      aria-label={`View ${collection.title} collection`}
                    />
                  </div>
                ))}
              </div>

              {featuredCollections.length > 6 && (
                <div className="text-center mt-12">
                  <a
                    href={`/${locale}/collections`}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
                  >
                    {dict.home?.viewAllCollections || 'View All Collections'}
                  </a>
                </div>
              )}
            </div>
          </div>
        </Suspense>
      )}

      {/* Blog/Articles Preview */}
      {featuredArticles.length > 0 && (
        <Suspense fallback={<SectionLoader />}>
          <div className="pb-16 lg:pb-28 bg-neutral-50 dark:bg-neutral-900">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12 lg:mb-14 pt-16 lg:pt-28">
                <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
                  {dict.home?.latestArticles || 'Latest Articles'}
                </h2>
                <p className="mt-4 text-neutral-600 dark:text-neutral-400">
                  {dict.home?.articlesSubtext || 'Stories, tips, and insights from our community'}
                </p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {featuredArticles.map((article) => (
                  <article
                    key={article.id}
                    className="group bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                  >
                    {article.featuredImage?.src && (
                      <div className="aspect-[4/3] overflow-hidden">
                        <Image
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          src={article.featuredImage.src}
                          alt={article.featuredImage.alt || article.title}
                          width={400}
                          height={300}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {article.title}
                      </h3>

                      {article.excerpt && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-3">
                          {article.excerpt}
                        </p>
                      )}

                      <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-500">
                        <span>
                          {typeof article.author === 'string'
                            ? article.author
                            : article.author?.name}
                        </span>
                        <span className="mx-2">·</span>
                        <span>{article.date}</span>
                      </div>
                    </div>

                    <a
                      href={`/${locale}/blog/${article.handle}`}
                      className="absolute inset-0"
                      aria-label={`Read ${article.title}`}
                    />
                  </article>
                ))}
              </div>

              <div className="text-center mt-12">
                <a
                  href={`/${locale}/blog`}
                  className="inline-flex items-center px-6 py-3 border border-neutral-300 dark:border-neutral-600 text-base font-medium rounded-md text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  {dict.home?.readAllArticles || 'Read All Articles'}
                </a>
              </div>
            </div>
          </div>
        </Suspense>
      )}

      {/* Call to Action Section */}
      <Suspense fallback={<SectionLoader />}>
        <div className="pb-16 lg:pb-28">
          <div className="container mx-auto px-4">
            <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 lg:p-16 text-white">
              <h2 className="text-3xl font-bold mb-4 lg:text-4xl">
                {dict.home?.ctaTitle || 'Ready to Start Shopping?'}
              </h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                {dict.home?.ctaSubtext ||
                  'Discover thousands of products from trusted sellers worldwide'}
              </p>
              <a
                href={`/${locale}/products`}
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-neutral-50 transition-colors"
              >
                {dict.home?.shopNow || 'Shop Now'}
              </a>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
