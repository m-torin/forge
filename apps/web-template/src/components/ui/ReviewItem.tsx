import { IconStar, IconStarFilled } from '@tabler/icons-react';
import clsx from 'clsx';
import { type FC } from 'react';

import { type TReview } from '../../types';
import Avatar from './Avatar';

export interface ReviewItemProps {
  className?: string;
  data: TReview;
}

const ReviewItem: FC<ReviewItemProps> = ({ className, data }) => {
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
