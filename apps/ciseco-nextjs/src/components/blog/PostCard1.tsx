import { TBlogPost } from '@/data/data'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { FC } from 'react'
import PostCardMeta from './PostCardMeta'

interface Props {
  className?: string
  post: TBlogPost
  size?: 'sm' | 'md'
}

const PostCard1: FC<Props> = ({ className = 'h-full', post, size = 'md' }) => {
  const { handle, title, timeToRead, excerpt: description, date, featuredImage: image, author } = post

  return (
    <div className={clsx(className, 'flex flex-col gap-y-10')}>
      <Link href={'/blog/' + handle} title={title} className="relative block aspect-4/3 overflow-hidden rounded-3xl">
        {image?.src && (
          <Image src={image} alt={title || ''} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        )}
      </Link>

      <div className="mt-auto flex flex-col">
        <h2
          className={clsx(
            'block font-semibold text-neutral-900 dark:text-neutral-100',
            size === 'sm' && 'text-base sm:text-xl',
            size === 'md' && 'text-lg sm:text-2xl'
          )}
        >
          <Link href={'/blog/' + handle} className="line-clamp-1">
            {title}
          </Link>
        </h2>
        <p className="mt-4 line-clamp-2 text-neutral-500 dark:text-neutral-400">{description}</p>
        <PostCardMeta author={author} date={date || ''} className="mt-5" />
      </div>
    </div>
  )
}

export default PostCard1
