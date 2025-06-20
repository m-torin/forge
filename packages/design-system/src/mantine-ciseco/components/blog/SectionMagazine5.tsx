import clsx from 'clsx';
import { type FC } from 'react';

import { type TBlogPost } from '../../data/types';

import PostCard1 from './PostCard1';
import PostCard2 from './PostCard2';

export interface SectionMagazine5Props extends Record<string, any> {
  className?: string;
  posts: TBlogPost[];
}

const SectionMagazine5: FC<SectionMagazine5Props> = ({ className, posts }: any) => {
  // Posts prop is guaranteed to exist and have content
  // This component should not be rendered without posts

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1, 4);

  return (
    <div className={clsx('grid gap-8 md:gap-10 lg:grid-cols-2', className)}>
      <PostCard1 post={featuredPost} />
      <div className="grid gap-6 md:gap-8">
        {otherPosts.map((post: any) => (
          <PostCard2 key={post.handle} post={post} />
        ))}
      </div>
    </div>
  );
};

export default SectionMagazine5;
