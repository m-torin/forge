import { TBlogPost } from '@/data/data'
import Avatar from '@/shared/Avatar/Avatar'
import Link from 'next/link'
import { FC } from 'react'

export interface PostCardMetaProps {
  className?: string
  hiddenAvatar?: boolean
  author: TBlogPost['author']
  date: string
}

const PostCardMeta: FC<PostCardMetaProps> = ({ className = 'leading-none', hiddenAvatar = false, author, date }) => {
  return (
    <div className={`inline-flex flex-wrap items-center text-sm text-neutral-800 dark:text-neutral-200 ${className}`}>
      <Link href={'/blog'} className="relative flex shrink-0 items-center space-x-2">
        {!hiddenAvatar && (
          <Avatar
            userName={author?.name}
            imgUrl={author?.avatar.src}
            radius="rounded-full"
            sizeClass="h-7 w-7 text-sm"
          />
        )}
        <span className="block font-medium text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white">
          {author?.name}
        </span>
      </Link>
      <>
        <span className="mx-[6px] font-medium text-neutral-500 dark:text-neutral-400">·</span>
        <span className="line-clamp-1 font-normal text-neutral-500 dark:text-neutral-400">{date}</span>
      </>
    </div>
  )
}

export default PostCardMeta
