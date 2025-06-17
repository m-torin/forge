import { type Metadata } from 'next';
import React from 'react';
import { createMetadata } from '@repo/seo/server/next';

import { BgGlassmorphism, SectionPromo2 } from '@/components/ui';
import { getArticles } from '@/actions/articles';
import { transformDatabaseArticleToTBlogPost } from '@/types/database';
import SectionMagazine5 from '@/components/sections/SectionMagazine5';
import SectionGridPosts from '@/components/sections/SectionGridPosts';

const SectionAds = () => (
  <div className="container mx-auto px-4">
    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-8 text-center my-8">
      <p className="text-neutral-500 dark:text-neutral-400">Advertisement Space</p>
    </div>
  </div>
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';
  const blogUrl = `${baseUrl}/${locale}/blog`;

  return createMetadata({
    title: 'Blog',
    description: 'Explore our blog for the latest news, articles, and insights on various topics.',
    alternates: {
      canonical: blogUrl,
      languages: {
        en: `${baseUrl}/en/blog`,
        es: `${baseUrl}/es/blog`,
        fr: `${baseUrl}/fr/blog`,
        de: `${baseUrl}/de/blog`,
        pt: `${baseUrl}/pt/blog`,
      },
    },
  });
}

async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const articlesResult = await getArticles({ status: 'PUBLISHED', page: 1, limit: 10 });
  const blogPosts = (articlesResult.data || []).map(transformDatabaseArticleToTBlogPost);

  // If no blog posts, show zero state
  if (blogPosts.length === 0) {
    return (
      <div>
        <BgGlassmorphism />
        <div className="container relative">
          <div className="pb-16 pt-12 lg:pb-28 text-center">
            <div className="mx-auto max-w-md">
              <div className="mx-auto h-24 w-24 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
                <svg
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  className="h-12 w-12 text-neutral-400 dark:text-neutral-500"
                  fill="none"
                >
                  <path
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                Blog Coming Soon
              </h1>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                No blog posts yet
              </h3>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                We're working on creating great content for you. Check back soon for articles, news,
                and insights.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/en/collections"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
                >
                  Shop Products
                </a>
                <a
                  href="/en"
                  className="inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-sm font-medium rounded-md text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BgGlassmorphism />
      <div className="container relative">
        <div className="pb-16 pt-12 lg:pb-28">
          <SectionMagazine5 posts={blogPosts} />
        </div>
        <SectionAds />
        <SectionGridPosts posts={blogPosts} className="py-16 lg:py-28" />
        <SectionPromo2 className="pb-16 lg:pb-28" />
      </div>
    </div>
  );
}

export default BlogPage;
