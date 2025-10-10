import Heading from '@/components/Heading/Heading';
import { TBlogPost } from '@/data/data';
import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/shared/Pagination/Pagination';
import { FC } from 'react';
import PostCard1 from './PostCard1';

//
interface SectionLatestPostsProps {
  className?: string;
  posts: TBlogPost[];
  heading?: string;
}

const SectionGridPosts: FC<SectionLatestPostsProps> = ({
  className = '',
  posts,
  heading = 'Latest articles 🎈',
}) => {
  return (
    <div className={`relative ${className}`}>
      <Heading>{heading}</Heading>
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 sm:gap-y-16 lg:grid-cols-3">
        {posts.map(post => (
          <PostCard1 size="sm" key={post.id} post={post} />
        ))}
      </div>
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
  );
};

export default SectionGridPosts;
