import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { type FC } from 'react';

import type { TBlogPost } from '@/types';
import PostCardMeta from './PostCardMeta';

// Loading skeleton for PostCard1 (Tailwind-only)
function PostCard1Skeleton({
  className,
  size,
  testId,
}: {
  className?: string;
  size?: 'sm' | 'md';
  testId?: string;
}) {
  return (
    <div className={clsx(className, 'flex flex-col gap-y-10')} data-testid={testId}>
      <div className="aspect-4/3 relative block overflow-hidden rounded-3xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div className="mt-auto flex flex-col">
        <div
          className={clsx(
            'h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2',
            size === 'sm' && 'h-5',
            size === 'md' && 'h-6',
          )}
        />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1 w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4 w-1/2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3" />
      </div>
    </div>
  );
}

// Error state for PostCard1 (Tailwind-only)
function PostCard1Error({
  error,
  className,
  size,
  testId,
}: {
  error: string;
  className?: string;
  size?: 'sm' | 'md';
  testId?: string;
}) {
  return (
    <div className={clsx(className, 'flex flex-col gap-y-10')} data-testid={testId}>
      <div className="aspect-4/3 relative block overflow-hidden rounded-3xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center justify-center">
        <div className="text-center p-4">
          <svg
            className="w-8 h-8 text-red-500 mx-auto mb-2"
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
          <span className="text-sm text-red-600 dark:text-red-400">Failed to load image</span>
        </div>
      </div>
      <div className="mt-auto flex flex-col">
        <h2
          className={clsx(
            'block font-semibold text-red-600 dark:text-red-400',
            size === 'sm' && 'text-base sm:text-xl',
            size === 'md' && 'text-lg sm:text-2xl',
          )}
        >
          Error loading post
        </h2>
        <p className="mt-4 line-clamp-2 text-red-500 dark:text-red-400">
          This post could not be loaded. Please try again later.
        </p>
        <div className="mt-5 text-sm text-red-500 dark:text-red-400">Error loading metadata</div>
      </div>
    </div>
  );
}

// Zero state for PostCard1 (Tailwind-only)
function PostCard1Empty({
  className,
  size,
  testId,
}: {
  className?: string;
  size?: 'sm' | 'md';
  testId?: string;
}) {
  return (
    <div className={clsx(className, 'flex flex-col gap-y-10')} data-testid={testId}>
      <div className="aspect-4/3 relative block overflow-hidden rounded-3xl bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
        <div className="text-center p-4">
          <svg
            className="w-8 h-8 text-gray-400 mx-auto mb-2"
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
          <span className="text-sm text-gray-500">No image available</span>
        </div>
      </div>
      <div className="mt-auto flex flex-col">
        <h2
          className={clsx(
            'block font-semibold text-gray-500 dark:text-gray-400',
            size === 'sm' && 'text-base sm:text-xl',
            size === 'md' && 'text-lg sm:text-2xl',
          )}
        >
          No post available
        </h2>
        <p className="mt-4 line-clamp-2 text-gray-400 dark:text-gray-500">
          Post content will appear here when available.
        </p>
        <div className="mt-5 text-sm text-gray-400 dark:text-gray-500">No metadata available</div>
      </div>
    </div>
  );
}

interface Props {
  className?: string;
  post: TBlogPost;
  size?: 'sm' | 'md';
  'data-testid'?: string;
  loading?: boolean;
  error?: string;
}

const PostCard1: FC<Props> = ({
  className = 'h-full',
  post,
  size = 'md',
  'data-testid': testId = 'post-card-1',
  loading = false,
  error,
}) => {
  // Show loading state
  if (loading) {
    return <PostCard1Skeleton className={className} size={size} testId={testId} />;
  }

  // Show error state
  if (error) {
    return <PostCard1Error error={error} className={className} size={size} testId={testId} />;
  }

  // Show zero state when no post
  if (!post) {
    return <PostCard1Empty className={className} size={size} testId={testId} />;
  }

  const { author, date, excerpt, featuredImage: image, handle, timeToRead, title } = post;

  return (
    <div className={clsx(className, 'flex flex-col gap-y-10')} data-testid={testId}>
      <Link
        href={`/blog/${handle}`}
        className="aspect-4/3 relative block overflow-hidden rounded-3xl"
        title={title}
      >
        {image?.src && (
          <Image
            className="object-cover"
            alt={title || ''}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            src={image.src}
          />
        )}
      </Link>

      <div className="mt-auto flex flex-col">
        <h2
          className={clsx(
            'block font-semibold text-neutral-900 dark:text-neutral-100',
            size === 'sm' && 'text-base sm:text-xl',
            size === 'md' && 'text-lg sm:text-2xl',
          )}
        >
          <Link href={`/blog/${handle}`} className="line-clamp-1">
            {title}
          </Link>
        </h2>
        <p className="mt-4 line-clamp-2 text-neutral-500 dark:text-neutral-400">{excerpt}</p>
        <PostCardMeta author={author} className="mt-5" date={date || ''} />
      </div>
    </div>
  );
};

export default PostCard1;
