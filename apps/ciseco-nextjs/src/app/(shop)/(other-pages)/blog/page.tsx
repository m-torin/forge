import { type Metadata } from 'next';
import React from 'react';

import { BgGlassmorphism } from '@repo/design-system/ciesco2';
import { SectionAds } from '@repo/design-system/ciesco2';
import { SectionGridPosts } from '@repo/design-system/ciesco2';
import { SectionMagazine5 } from '@repo/design-system/ciesco2';
import { SectionPromo2 } from '@repo/design-system/ciesco2';
import { getBlogPosts } from '@repo/design-system/ciesco2';

export const metadata: Metadata = {
  description: 'Explore our blog for the latest news, articles, and insights on various topics.',
  title: 'Blog',
};

const BlogPage: React.FC = async () => {
  const blogPosts = await getBlogPosts();

  return (
    <div>
      <BgGlassmorphism />
      <div className="relative container">
        <div className="pt-12 pb-16 lg:pb-28">
          <SectionMagazine5 posts={blogPosts} />
        </div>
        <SectionAds />
        <SectionGridPosts posts={blogPosts} className="py-16 lg:py-28" />
        <SectionPromo2 className="pb-16 lg:pb-28" />
      </div>
    </div>
  );
};

export default BlogPage;
