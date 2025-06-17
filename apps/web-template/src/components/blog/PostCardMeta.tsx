'use client';

import { Avatar, Skeleton, Alert, Text } from '@mantine/core';
import { IconAlertTriangle, IconUser } from '@tabler/icons-react';
import Link from 'next/link';
import { type FC, useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

import type { TBlogPost } from '@/types';

export interface PostCardMetaProps {
  author: TBlogPost['author'];
  className?: string;
  date: string;
  hiddenAvatar?: boolean;
  'data-testid'?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for PostCardMeta
function PostCardMetaSkeleton({
  className,
  hiddenAvatar,
  testId,
}: {
  className?: string;
  hiddenAvatar?: boolean;
  testId?: string;
}) {
  return (
    <div
      className={`inline-flex flex-wrap items-center text-sm text-neutral-800 dark:text-neutral-200 ${className}`}
      data-testid={testId}
    >
      <div className="relative flex shrink-0 items-center space-x-2">
        {!hiddenAvatar && <Skeleton height={28} width={28} circle />}
        <Skeleton height={16} width={80} />
      </div>
      <span className="mx-[6px] font-medium text-neutral-500 dark:text-neutral-400">·</span>
      <Skeleton height={16} width={60} />
    </div>
  );
}

// Error state for PostCardMeta
function PostCardMetaError({
  error,
  className,
  testId,
}: {
  error: string;
  className?: string;
  testId?: string;
}) {
  return (
    <div
      className={`inline-flex flex-wrap items-center text-sm text-neutral-800 dark:text-neutral-200 ${className}`}
      data-testid={testId}
    >
      <Alert icon={<IconAlertTriangle size={14} />} color="red" variant="light">
        <Text size="xs">Metadata failed to load</Text>
      </Alert>
    </div>
  );
}

// Zero state for PostCardMeta
function PostCardMetaEmpty({
  className,
  hiddenAvatar,
  testId,
}: {
  className?: string;
  hiddenAvatar?: boolean;
  testId?: string;
}) {
  return (
    <div
      className={`inline-flex flex-wrap items-center text-sm text-neutral-800 dark:text-neutral-200 ${className}`}
      data-testid={testId}
    >
      <div className="relative flex shrink-0 items-center space-x-2">
        {!hiddenAvatar && (
          <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <IconUser size={14} color="var(--mantine-color-gray-5)" />
          </div>
        )}
        <span className="block font-medium text-gray-400 dark:text-gray-500">No author</span>
      </div>
      <span className="mx-[6px] font-medium text-neutral-500 dark:text-neutral-400">·</span>
      <span className="line-clamp-1 font-normal text-gray-400 dark:text-gray-500">No date</span>
    </div>
  );
}

const PostCardMeta: FC<PostCardMetaProps> = ({
  hiddenAvatar = false,
  author,
  className = 'leading-none',
  date,
  'data-testid': testId = 'post-card-meta',
  loading = false,
  error,
}) => {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return (
      <PostCardMetaSkeleton className={className} hiddenAvatar={hiddenAvatar} testId={testId} />
    );
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <PostCardMetaError error={currentError} className={className} testId={testId} />;
  }

  // Show zero state when no author or date
  if (!author || !date) {
    return <PostCardMetaEmpty className={className} hiddenAvatar={hiddenAvatar} testId={testId} />;
  }
  return (
    <ErrorBoundary
      fallback={
        <PostCardMetaError error="Meta failed to render" className={className} testId={testId} />
      }
    >
      <div
        className={`inline-flex flex-wrap items-center text-sm text-neutral-800 dark:text-neutral-200 ${className}`}
        data-testid={testId}
      >
        <ErrorBoundary fallback={<Skeleton height={28} width={100} />}>
          <Link href="/blog" className="relative flex shrink-0 items-center space-x-2">
            {!hiddenAvatar && (
              <ErrorBoundary fallback={<Skeleton height={28} width={28} circle />}>
                <Avatar
                  src={author?.avatar || author?.image}
                  alt={author?.name}
                  size="sm"
                  radius="xl"
                  className="h-7 w-7"
                />
              </ErrorBoundary>
            )}
            <span className="block font-medium text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white">
              {author?.name}
            </span>
          </Link>
        </ErrorBoundary>
        <span className="mx-[6px] font-medium text-neutral-500 dark:text-neutral-400">·</span>
        <span className="line-clamp-1 font-normal text-neutral-500 dark:text-neutral-400">
          {date}
        </span>
      </div>
    </ErrorBoundary>
  );
};

export default PostCardMeta;
