import { type FC } from 'react';

import type { TBlogPost } from '@/types';
import PostCard1 from '@/components/blog/PostCard1';
import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/components/ui/Pagination';

export interface SectionLatestPostsProps {
  className?: string;
  posts: TBlogPost[];
  heading?: string;
  'data-testid'?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for SectionGridPosts (Tailwind-only)
function SectionGridPostsSkeleton({
  className,
  heading,
  testId,
}: {
  className?: string;
  heading?: string;
  testId?: string;
}) {
  return (
    <div className={`relative ${className}`} data-testid={testId}>
      <div className="container mx-auto mb-12 px-4 lg:mb-14">
        <div className="text-center sm:text-left">
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
        </div>
      </div>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 sm:gap-y-16 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-y-10">
              <div className="aspect-4/3 relative block overflow-hidden rounded-3xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="mt-auto flex flex-col">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1 w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 flex justify-center md:mt-24">
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Error state for SectionGridPosts (Tailwind-only)
function SectionGridPostsError({
  error,
  className,
  heading,
  testId,
}: {
  error: string;
  className?: string;
  heading?: string;
  testId?: string;
}) {
  return (
    <div className={`relative ${className}`} data-testid={testId}>
      <div className="container mx-auto mb-12 px-4 lg:mb-14">
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
            {heading}
          </h2>
        </div>
      </div>
      <div className="container mx-auto px-4">
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
            Failed to load posts
          </h3>
          <p className="text-red-500 dark:text-red-400">
            Posts could not be loaded. Please try again later.
          </p>
        </div>
      </div>
    </div>
  );
}

// Zero state for SectionGridPosts (Tailwind-only)
function SectionGridPostsEmpty({
  className,
  heading,
  testId,
}: {
  className?: string;
  heading?: string;
  testId?: string;
}) {
  return (
    <div className={`relative ${className}`} data-testid={testId}>
      <div className="container mx-auto mb-12 px-4 lg:mb-14">
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
            {heading}
          </h2>
        </div>
      </div>
      <div className="container mx-auto px-4">
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
            No posts available
          </h3>
          <p className="text-gray-400 dark:text-gray-500">
            Blog posts will appear here when they become available.
          </p>
        </div>
      </div>
    </div>
  );
}

const SectionGridPosts: FC<SectionLatestPostsProps> = ({
  className = '',
  posts,
  heading = 'Latest Articles 🎈',
  'data-testid': testId = 'section-grid-posts',
  loading = false,
  error,
}) => {
  // Show loading state
  if (loading) {
    return <SectionGridPostsSkeleton className={className} heading={heading} testId={testId} />;
  }

  // Show error state
  if (error) {
    return (
      <SectionGridPostsError
        error={error}
        className={className}
        heading={heading}
        testId={testId}
      />
    );
  }

  // Show zero state when no posts
  if (!posts || posts.length === 0) {
    return <SectionGridPostsEmpty className={className} heading={heading} testId={testId} />;
  }
  return (
    <div className={`relative ${className}`} data-testid={testId}>
      {/* Heading */}
      <div className="container mx-auto mb-12 px-4 lg:mb-14">
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
            {heading}
          </h2>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 sm:gap-y-16 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard1 key={post.id} post={post} size="sm" />
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-16 flex justify-center md:mt-24">
          <Pagination className="mx-auto">
            <PaginationPrevious href="?page=1" />
            <PaginationList>
              <PaginationPage href="?page=1" current>
                1
              </PaginationPage>
              <PaginationPage href="?page=2">2</PaginationPage>
              <PaginationPage href="?page=3">3</PaginationPage>
              <PaginationPage href="?page=4">4</PaginationPage>
            </PaginationList>
            <PaginationNext href="?page=3" />
          </Pagination>
        </div>
      </div>
    </div>
  );
};

export default SectionGridPosts;
