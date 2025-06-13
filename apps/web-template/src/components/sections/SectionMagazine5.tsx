import clsx from 'clsx';
import { type FC } from 'react';

import type { TBlogPost } from '@/types';
import PostCard1 from '@/components/blog/PostCard1';
import PostCard2 from '@/components/blog/PostCard2';

export interface SectionMagazine5Props {
  className?: string;
  posts: TBlogPost[];
  heading?: string;
  subHeading?: string;
}

const SectionMagazine5: FC<SectionMagazine5Props> = ({ 
  className, 
  posts,
  heading = 'Featured Articles',
  subHeading = 'Discover our latest insights and stories'
}) => {
  const featuredPost = posts[0];
  const otherPosts = posts.slice(1, 4);

  if (!featuredPost) {
    return null;
  }

  return (
    <div className={`container mx-auto px-4 ${className || ''}`}>
      {/* Heading */}
      <div className="mb-12 text-center lg:mb-16">
        <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
          {heading}
        </h2>
        {subHeading && (
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            {subHeading}
          </p>
        )}
      </div>

      {/* Content */}
      <div className={clsx('grid gap-8 md:gap-10 lg:grid-cols-2')}>
        <PostCard1 post={featuredPost} size="md" />
        <div className="grid gap-6 md:gap-8">
          {otherPosts.map((post) => (
            <PostCard2 key={post.handle} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionMagazine5;