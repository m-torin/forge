import { StarIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { type FC } from 'react';

import { type TReview } from '../data/types';

import Avatar from './shared/Avatar/Avatar';

export interface ReviewItemProps extends Record<string, any> {
  className?: string;
  data: TReview;
}

const ReviewItem: FC<ReviewItemProps> = ({ className, data }: any) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex gap-x-4">
        <div className="shrink-0 pt-0.5">
          <Avatar
            imgUrl={data.authorAvatar}
            radius="rounded-full"
            sizeClass="size-10 text-lg"
            userName={data.author ?? ''}
          />
        </div>

        <div className="flex flex-1 justify-between">
          <div className="text-sm sm:text-base">
            <span className="block font-semibold">{data.author}</span>
            <span className="mt-0.5 block text-sm text-neutral-500 dark:text-neutral-400">
              {data.date}
            </span>
          </div>

          <div className="mt-0.5 flex text-yellow-500">
            {[0, 1, 2, 3, 4].map((rating: any) => (
              <StarIcon
                key={rating}
                aria-hidden="true"
                className={clsx(
                  (data.rating ?? 1) > rating ? 'text-yellow-400' : 'text-gray-200',
                  'size-5 shrink-0',
                )}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="prose prose-sm mt-4 sm:prose sm:max-w-2xl dark:prose-invert">
        <div
          className="text-neutral-600 dark:text-neutral-300"
          dangerouslySetInnerHTML={{ __html: data.content ?? '' }}
        />
      </div>
    </div>
  );
};

export default ReviewItem;
