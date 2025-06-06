'use client';

import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { type FC } from 'react';

import { type TBlogPost } from '../../data/data';
import { useLocalizeHref } from '../../hooks/useLocale';

import PostCardMeta from './PostCardMeta';

interface Props {
  className?: string;
  post: TBlogPost;
  size?: 'sm' | 'md';
}

const PostCard1: FC<Props> = ({ className = 'h-full', post, size = 'md' }) => {
  const localizeHref = useLocalizeHref();
  const {
    author,
    date,
    excerpt: description,
    featuredImage: image,
    handle,
    timeToRead,
    title,
  } = post;

  return (
    <div className={clsx(className, 'flex flex-col gap-y-10')}>
      <Link
        href={localizeHref(`/blog/${handle}`)}
        className="relative block aspect-4/3 overflow-hidden rounded-3xl"
        title={title}
      >
        {image?.src && (
          <Image
            className="object-cover"
            alt={title || ''}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            src={image}
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
          <Link href={localizeHref(`/blog/${handle}`)} className="line-clamp-1">
            {title}
          </Link>
        </h2>
        <p className="mt-4 line-clamp-2 text-neutral-500 dark:text-neutral-400">{description}</p>
        <PostCardMeta author={author} className="mt-5" date={date || ''} />
      </div>
    </div>
  );
};

export { PostCard1 };
export default PostCard1;
