import { type FC } from 'react';

import type { TBlogPost } from '@/types';
import PostCard1 from '@/components/blog/PostCard1';
import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/components/ui/Pagination';

export interface SectionLatestPostsProps {
  className?: string;
  posts: TBlogPost[];
  heading?: string;
}

const SectionGridPosts: FC<SectionLatestPostsProps> = ({ 
  className = '', 
  posts,
  heading = 'Latest Articles 🎈' 
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* Heading */}
      <div className="container mx-auto mb-12 px-4 lg:mb-14">
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
            {heading}
          </h2>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 sm:gap-y-16 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard1 key={post.id} post={post} size="sm" />
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-16 flex justify-center md:mt-24">
          <Pagination className="mx-auto">
            <PaginationPrevious href="?page=1" />
            <PaginationList>
              <PaginationPage href="?page=1" current>
                1
              </PaginationPage>
              <PaginationPage href="?page=2">2</PaginationPage>
              <PaginationPage href="?page=3">3</PaginationPage>
              <PaginationPage href="?page=4">4</PaginationPage>
            </PaginationList>
            <PaginationNext href="?page=3" />
          </Pagination>
        </div>
      </div>
    </div>
  );
};

export default SectionGridPosts;