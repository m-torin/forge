import { IconStar, IconStarFilled } from '@tabler/icons-react';
import { type FC } from 'react';

import { type TReview } from '../../types';
import Avatar from './Avatar';

export interface ReviewItemProps {
  className?: string;
  data: TReview;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for ReviewItem (Tailwind-only)
function ReviewItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex gap-x-4">
        <div className="shrink-0 pt-0.5">
          <div className="size-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        </div>
        <div className="flex flex-1 justify-between">
          <div className="text-sm sm:text-base">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2 w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2 w-4/5" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/5" />
      </div>
    </div>
  );
}

// Error state for ReviewItem (Tailwind-only)
function ReviewItemError({ error: _error, className }: { error: string; className?: string }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <span className="text-sm text-red-600 dark:text-red-400">Review failed to load</span>
      </div>
    </div>
  );
}

// Zero state for ReviewItem (Tailwind-only)
function ReviewItemEmpty({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-2 p-3 bg-gray-50 border border-dashed border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v10a2 2 0 002 2h10a2 2 0 002-2V8M9 12h6"
          />
        </svg>
        <span className="text-sm text-gray-500 dark:text-gray-400">No review content</span>
      </div>
    </div>
  );
}

const ReviewItem: FC<ReviewItemProps> = ({ className, data, loading = false, error }) => {
  // Show loading state
  if (loading) {
    return <ReviewItemSkeleton className={className} />;
  }

  // Show error state
  if (error) {
    return <ReviewItemError error={error} className={className} />;
  }

  // Show zero state when no data
  if (!data) {
    return <ReviewItemEmpty className={className} />;
  }

  // Adapt data to handle both new and legacy field names
  const authorName =
    typeof data.author === 'string' ? data.author : data.author?.name || 'Anonymous';
  const authorAvatar =
    typeof data.author === 'string'
      ? data.authorAvatar
      : data.author?.image || data.authorAvatar || '';
  const reviewContent = data.comment || data.content || '';
  const reviewDate = data.createdAt || data.date || data.datetime || '';
  const reviewRating = data.rating || 1;

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex gap-x-4">
        <div className="shrink-0 pt-0.5">
          <Avatar
            imgUrl={authorAvatar}
            radius="rounded-full"
            sizeClass="size-10 text-lg"
            userName={authorName}
          />
        </div>

        <div className="flex flex-1 justify-between">
          <div className="text-sm sm:text-base">
            <span className="block font-semibold">{authorName}</span>
            <span className="mt-0.5 block text-sm text-neutral-500 dark:text-neutral-400">
              {reviewDate}
            </span>
          </div>

          <div className="mt-0.5 flex text-yellow-500">
            {[0, 1, 2, 3, 4].map((rating) => {
              const isFilled = reviewRating > rating;
              return isFilled ? (
                <IconStarFilled key={rating} className="size-5 shrink-0 text-yellow-400" />
              ) : (
                <IconStar key={rating} className="size-5 shrink-0 text-gray-200" />
              );
            })}
          </div>
        </div>
      </div>
      <div className="prose prose-sm mt-4 sm: prose sm:max-w-2xl dark:prose-invert">
        <div
          className="text-neutral-600 dark:text-neutral-300"
          dangerouslySetInnerHTML={{ __html: reviewContent }}
        />
      </div>
    </div>
  );
};

export default ReviewItem;
