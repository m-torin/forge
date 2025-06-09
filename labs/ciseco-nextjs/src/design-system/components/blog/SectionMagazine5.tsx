import clsx from 'clsx'
import { type FC } from 'react'

import { type TBlogPost } from '../../data/data'

import PostCard1 from './PostCard1'
import PostCard2 from './PostCard2'

export interface SectionMagazine5Props {
  className?: string
  posts: TBlogPost[]
}

const SectionMagazine5: FC<SectionMagazine5Props> = ({ className, posts }) => {
  const featuredPost = posts[0]
  const otherPosts = posts.slice(1, 4)

  return (
    <div className={clsx('grid gap-8 md:gap-10 lg:grid-cols-2', className)}>
      <PostCard1 post={featuredPost} />
      <div className="grid gap-6 md:gap-8">
        {otherPosts.map((post) => (
          <PostCard2 key={post.handle} post={post} />
        ))}
      </div>
    </div>
  )
}

export default SectionMagazine5
