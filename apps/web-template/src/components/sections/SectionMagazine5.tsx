import clsx from 'clsx';
import { type FC } from 'react';

import type { TBlogPost } from '@/types';
import PostCard1 from '@/components/blog/PostCard1';
import PostCard2 from '@/components/blog/PostCard2';

export interface SectionMagazine5Props {
  className?: string;
  posts: TBlogPost[];
  heading?: string;
  subHeading?: string;
  'data-testid'?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for SectionMagazine5 (Tailwind-only)
function SectionMagazine5Skeleton({
  className,
  heading,
  subHeading,
  testId,
}: {
  className?: string;
  heading?: string;
  subHeading?: string;
  testId?: string;
}) {
  return (
    <div className={`container mx-auto px-4 ${className || ''}`} data-testid={testId}>
      <div className="mb-12 text-center lg:mb-16">
        <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3 mx-auto mb-4" />
        {subHeading && (
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2 mx-auto" />
        )}
      </div>
      <div className="grid gap-8 md:gap-10 lg:grid-cols-2">
        {/* Featured post skeleton */}
        <div className="flex flex-col gap-y-10">
          <div className="aspect-4/3 relative block overflow-hidden rounded-3xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="mt-auto flex flex-col">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1 w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
          </div>
        </div>
        {/* Other posts skeleton */}
        <div className="grid gap-6 md:gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="relative flex justify-between gap-x-8">
              <div className="flex h-full flex-col py-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3 w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
              </div>
              <div className="relative block h-full w-2/5 shrink-0 sm:w-1/3 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Error state for SectionMagazine5 (Tailwind-only)
function SectionMagazine5Error({
  error,
  className,
  heading,
  subHeading,
  testId,
}: {
  error: string;
  className?: string;
  heading?: string;
  subHeading?: string;
  testId?: string;
}) {
  return (
    <div className={`container mx-auto px-4 ${className || ''}`} data-testid={testId}>
      <div className="mb-12 text-center lg:mb-16">
        <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
          {heading}
        </h2>
        {subHeading && <p className="mt-4 text-neutral-600 dark:text-neutral-400">{subHeading}</p>}
      </div>
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
        <svg
          className="w-12 h-12 text-red-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
          Failed to load articles
        </h3>
        <p className="text-red-500 dark:text-red-400">
          Magazine section could not be loaded. Please try again later.
        </p>
      </div>
    </div>
  );
}

// Zero state for SectionMagazine5 (Tailwind-only)
function SectionMagazine5Empty({
  className,
  heading,
  subHeading,
  testId,
}: {
  className?: string;
  heading?: string;
  subHeading?: string;
  testId?: string;
}) {
  return (
    <div className={`container mx-auto px-4 ${className || ''}`} data-testid={testId}>
      <div className="mb-12 text-center lg:mb-16">
        <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
          {heading}
        </h2>
        {subHeading && <p className="mt-4 text-neutral-600 dark:text-neutral-400">{subHeading}</p>}
      </div>
      <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
        <svg
          className="w-16 h-16 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-2">
          No articles available
        </h3>
        <p className="text-gray-400 dark:text-gray-500">
          Featured articles will appear here when they become available.
        </p>
      </div>
    </div>
  );
}

const SectionMagazine5: FC<SectionMagazine5Props> = ({
  className,
  posts,
  heading = 'Featured Articles',
  subHeading = 'Discover our latest insights and stories',
  'data-testid': testId = 'section-magazine-5',
  loading = false,
  error,
}) => {
  // Show loading state
  if (loading) {
    return (
      <SectionMagazine5Skeleton
        className={className}
        heading={heading}
        subHeading={subHeading}
        testId={testId}
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <SectionMagazine5Error
        error={error}
        className={className}
        heading={heading}
        subHeading={subHeading}
        testId={testId}
      />
    );
  }

  // Show zero state when no posts or no featured post
  if (!posts || posts.length === 0) {
    return (
      <SectionMagazine5Empty
        className={className}
        heading={heading}
        subHeading={subHeading}
        testId={testId}
      />
    );
  }

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1, 4);

  if (!featuredPost) {
    return (
      <SectionMagazine5Empty
        className={className}
        heading={heading}
        subHeading={subHeading}
        testId={testId}
      />
    );
  }

  return (
    <div className={`container mx-auto px-4 ${className || ''}`} data-testid={testId}>
      {/* Heading */}
      <div className="mb-12 text-center lg:mb-16">
        <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
          {heading}
        </h2>
        {subHeading && <p className="mt-4 text-neutral-600 dark:text-neutral-400">{subHeading}</p>}
      </div>

      {/* Content */}
      <div className={clsx('grid gap-8 md:gap-10 lg:grid-cols-2')}>
        <PostCard1 post={featuredPost} size="md" />
        <div className="grid gap-6 md:gap-8">
          {otherPosts.map((post) => (
            <PostCard2 key={post.handle} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionMagazine5;
