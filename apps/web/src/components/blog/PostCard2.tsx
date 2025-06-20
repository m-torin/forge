import Image from 'next/image';
import Link from 'next/link';
import { type FC } from 'react';

import type { TBlogPost } from '@/types';
import PostCardMeta from './PostCardMeta';

// Loading skeleton for PostCard2 (Tailwind-only)
function PostCard2Skeleton({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div className={`relative flex justify-between gap-x-8 ${className}`} data-testid={testId}>
      <div className="flex h-full flex-col py-2">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3 w-3/4" />
        <div className="my-3 hidden sm:block">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2 sm:hidden" />
        <div className="mt-auto hidden sm:block">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3" />
        </div>
      </div>
      <div className="relative block h-full w-2/5 shrink-0 sm:w-1/3 bg-gray-200 dark:bg-gray-700 rounded-xl sm:rounded-3xl animate-pulse" />
    </div>
  );
}

// Error state for PostCard2 (Tailwind-only)
function PostCard2Error({
  error,
  className,
  testId,
}: {
  error: string;
  className?: string;
  testId?: string;
}) {
  return (
    <div className={`relative flex justify-between gap-x-8 ${className}`} data-testid={testId}>
      <div className="flex h-full flex-col py-2">
        <h2 className="nc-card-title block text-base font-semibold text-red-600 dark:text-red-400">
          Error loading post
        </h2>
        <span className="my-3 hidden text-red-500 sm:block dark:text-red-400">
          This post could not be loaded. Please try again later.
        </span>
        <span className="mt-4 block text-sm text-red-500 sm:hidden">Error loading content</span>
        <div className="mt-auto hidden sm:block text-sm text-red-500 dark:text-red-400">
          Error loading metadata
        </div>
      </div>
      <div className="relative block h-full w-2/5 shrink-0 sm:w-1/3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl sm:rounded-3xl flex items-center justify-center">
        <div className="text-center p-4">
          <svg
            className="w-6 h-6 text-red-500 mx-auto mb-1"
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
          <span className="text-xs text-red-600 dark:text-red-400">Failed to load</span>
        </div>
      </div>
    </div>
  );
}

// Zero state for PostCard2 (Tailwind-only)
function PostCard2Empty({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div className={`relative flex justify-between gap-x-8 ${className}`} data-testid={testId}>
      <div className="flex h-full flex-col py-2">
        <h2 className="nc-card-title block text-base font-semibold text-gray-500 dark:text-gray-400">
          No post available
        </h2>
        <span className="my-3 hidden text-gray-400 sm:block dark:text-gray-500">
          Post content will appear here when available.
        </span>
        <span className="mt-4 block text-sm text-gray-400 sm:hidden">No content available</span>
        <div className="mt-auto hidden sm:block text-sm text-gray-400 dark:text-gray-500">
          No metadata available
        </div>
      </div>
      <div className="relative block h-full w-2/5 shrink-0 sm:w-1/3 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl sm:rounded-3xl flex items-center justify-center">
        <div className="text-center p-4">
          <svg
            className="w-6 h-6 text-gray-400 mx-auto mb-1"
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
          <span className="text-xs text-gray-500">No image</span>
        </div>
      </div>
    </div>
  );
}

interface Props {
  className?: string;
  post: TBlogPost;
  'data-testid'?: string;
  loading?: boolean;
  error?: string;
}

const PostCard2: FC<Props> = ({
  className,
  post,
  'data-testid': testId = 'post-card-2',
  loading = false,
  error,
}) => {
  // Show loading state
  if (loading) {
    return <PostCard2Skeleton className={className} testId={testId} />;
  }

  // Show error state
  if (error) {
    return <PostCard2Error error={error} className={className} testId={testId} />;
  }

  // Show zero state when no post
  if (!post) {
    return <PostCard2Empty className={className} testId={testId} />;
  }

  const { author, date, excerpt, featuredImage: image, handle, timeToRead, title } = post;

  return (
    <div className={`relative flex justify-between gap-x-8 ${className}`} data-testid={testId}>
      <div className="flex h-full flex-col py-2">
        <h2 className="nc-card-title block text-base font-semibold">
          <Link href={`/blog/${handle}`} className="line-clamp-2 capitalize" title={title}>
            {title}
          </Link>
        </h2>
        <span className="my-3 hidden text-neutral-500 sm:block dark:text-neutral-400">
          <span className="line-clamp-2">{excerpt}</span>
        </span>
        <span className="mt-4 block text-sm text-neutral-500 sm:hidden">
          {date} · {timeToRead}
        </span>
        <div className="mt-auto hidden sm:block">
          <PostCardMeta author={author} date={date || ''} />
        </div>
      </div>

      <Link href={`/blog/${handle}`} className="relative block h-full w-2/5 shrink-0 sm:w-1/3">
        {image?.src && (
          <Image
            className="absolute inset-0 h-full w-full rounded-xl object-cover sm:rounded-3xl"
            alt={title}
            fill
            sizes="400px"
            src={image.src}
          />
        )}
      </Link>
    </div>
  );
};

export default PostCard2;
