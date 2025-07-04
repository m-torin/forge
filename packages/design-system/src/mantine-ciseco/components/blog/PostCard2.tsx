'use client';

import Link from 'next/link';
import { type FC } from 'react';

import { type TBlogPost } from '../../data/types';
import { useLocalizeHref } from '../../hooks/useLocale';
import NcImage from '../shared/NcImage/NcImage';

import PostCardMeta from './PostCardMeta';

interface Props extends Record<string, any> {
  className?: string;
  post: TBlogPost;
}

const PostCard2: FC<Props> = ({ className, post }: any) => {
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
    <div className={`relative flex justify-between gap-x-8 ${className}`}>
      <div className="flex h-full flex-col py-2">
        <h2 className="block text-base font-semibold nc-card-title">
          <Link
            className="line-clamp-2 capitalize"
            href={localizeHref(`/blog/${handle}`)}
            title="title"
          >
            {title}
          </Link>
        </h2>
        <span className="my-3 hidden text-neutral-500 sm:block dark:text-neutral-400">
          <span className="line-clamp-2">{description}</span>
        </span>
        <span className="mt-4 block text-sm text-neutral-500 sm:hidden">
          {date} · {timeToRead}
        </span>
        <div className="mt-auto hidden sm:block">
          <PostCardMeta author={author} date={date ?? ''} />
        </div>
      </div>

      <Link
        className="relative block h-full w-2/5 shrink-0 sm:w-1/3"
        href={localizeHref(`/blog/${handle}`)}
      >
        {image?.src && (
          <NcImage
            alt={title}
            className="h-full w-full rounded-xl object-cover sm:rounded-3xl"
            containerClassName="absolute inset-0"
            fill
            sizes="400px"
            src={image}
          />
        )}
      </Link>
    </div>
  );
};

export default PostCard2;
