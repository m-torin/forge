import Image from 'next/image';
import Link from 'next/link';
import { type FC } from 'react';

import type { TBlogPost } from '@/types';
import PostCardMeta from './PostCardMeta';

interface Props {
  className?: string;
  post: TBlogPost;
}

const PostCard2: FC<Props> = ({ className, post }) => {
  const { 
    author, 
    date, 
    excerpt, 
    featuredImage: image, 
    handle, 
    timeToRead, 
    title 
  } = post;

  return (
    <div className={`relative flex justify-between gap-x-8 ${className}`}>
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