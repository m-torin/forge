import { type FC } from 'react';

import { type TBlogPost } from '../../data/data';
import Heading from '../Heading/Heading';
import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '../shared/Pagination/Pagination';

import PostCard1 from './PostCard1';

//
export interface SectionLatestPostsProps {
  className?: string;
  posts: TBlogPost[];
}

const SectionGridPosts: FC<SectionLatestPostsProps> = ({ className = '', posts }) => {
  return (
    <div className={`relative ${className}`}>
      <Heading>Latest Articles 🎈</Heading>
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 sm:gap-y-16 lg:grid-cols-3">
        {posts?.map((post) => (
          <PostCard1 key={post.id} post={post} size="sm" />
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
