import { TBlogPost } from '@/data/data';
import clsx from 'clsx';
import { FC } from 'react';
import PostCard1 from './PostCard1';
import PostCard2 from './PostCard2';

interface SectionMagazine5Props {
  posts: TBlogPost[];
  className?: string;
}

const SectionMagazine5: FC<SectionMagazine5Props> = ({ posts, className }) => {
  const featuredPost = posts[0];
  const otherPosts = posts.slice(1, 4);

  return (
    <div className={clsx('grid gap-8 md:gap-10 lg:grid-cols-2', className)}>
      <PostCard1 post={featuredPost} />
      <div className="grid gap-6 md:gap-8">
        {otherPosts.map(post => (
          <PostCard2 key={post.handle} post={post} />
        ))}
      </div>
    </div>
  );
};

export default SectionMagazine5;
