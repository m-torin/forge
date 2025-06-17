import Link from 'next/link';
import { type FC } from 'react';

import { type TBlogPost } from '../../data/types';
import Avatar from '../shared/Avatar/Avatar';

export interface PostCardMetaProps extends Record<string, any> {
  author: TBlogPost['author'];
  className?: string;
  date: string;
  hiddenAvatar?: boolean;
  testId?: string;
}

const PostCardMeta: FC<PostCardMetaProps> = ({
  author,
  className = 'leading-none',
  date,
  hiddenAvatar = false,
  testId = 'post-card-meta',
}) => {
  return (
    <div
      className={`inline-flex flex-wrap items-center text-sm text-neutral-800 dark:text-neutral-200 ${className}`}
      data-testid={testId}
    >
      <Link
        className="relative flex shrink-0 items-center space-x-2"
        data-testid={`${testId}-author-link`}
        href="/blog"
      >
        {!hiddenAvatar && (
          <Avatar
            imgUrl={typeof author === 'object' ? author.avatar : undefined}
            radius="rounded-full"
            sizeClass="h-7 w-7 text-sm"
            testId={`${testId}-avatar`}
            userName={typeof author === 'object' ? author.name : author}
          />
        )}
        <span
          className="block font-medium text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white"
          data-testid={`${testId}-author`}
        >
          {typeof author === 'object' ? author.name : author}
        </span>
      </Link>
      <span className="mx-[6px] font-medium text-neutral-500 dark:text-neutral-400">·</span>
      <span
        className="line-clamp-1 font-normal text-neutral-500 dark:text-neutral-400"
        data-testid={`${testId}-date`}
      >
        {date}
      </span>
    </div>
  );
};

export default PostCardMeta;
