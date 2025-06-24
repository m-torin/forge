'use client';

import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { type FC } from 'react';

import { type TBlogPost } from '../../data/types';
import { useLocalizeHref } from '../../hooks/useLocale';

import PostCardMeta from './PostCardMeta';

interface Props extends Record<string, any> {
  className?: string;
  post: TBlogPost;
  size?: 'md' | 'sm';
  testId?: string;
}

const PostCard1: FC<Props> = ({
  className = 'h-full',
  post,
  size = 'md',
  testId = 'post-card',
}) => {
  const localizeHref = useLocalizeHref();
  const {
    author,
    date,
    excerpt: description,
    featuredImage: image,
    handle,
    timeToRead: timeToRead,
    title,
  } = post;

  return (
    <div className={clsx(className, 'flex flex-col gap-y-10')} data-testid={testId}>
      <Link
        className="relative block aspect-4/3 overflow-hidden rounded-3xl"
        data-testid={`${testId}-image-link`}
        href={localizeHref(`/blog/${handle}`)}
        title={title}
      >
        {image?.src && (
          <Image
            alt={title || ''}
            className="object-cover"
            data-testid={`${testId}-image`}
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
          data-testid={`${testId}-title`}
        >
          <Link
            className="line-clamp-1"
            data-testid={`${testId}-title-link`}
            href={localizeHref(`/blog/${handle}`)}
          >
            {title}
          </Link>
        </h2>
        <p
          className="mt-4 line-clamp-2 text-neutral-500 dark:text-neutral-400"
          data-testid={`${testId}-excerpt`}
        >
          {description}
        </p>
        <PostCardMeta
          author={author}
          className="mt-5"
          date={date ?? ''}
          testId={`${testId}-meta`}
        />
      </div>
    </div>
  );
};

export { PostCard1 };
export default PostCard1;
