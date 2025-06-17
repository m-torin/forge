import BgGlassmorphism from '@/components/BgGlassmorphism/BgGlassmorphism'
import SectionPromo2 from '@/components/SectionPromo2'
import SectionAds from '@/components/blog/SectionAds'
import SectionGridPosts from '@/components/blog/SectionGridPosts'
import SectionMagazine5 from '@/components/blog/SectionMagazine5'
import { getBlogPosts } from '@/data/data'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Explore our blog for the latest news, articles, and insights on various topics.',
}

const BlogPage: React.FC = async () => {
  const blogPosts = await getBlogPosts()

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
  )
}

export default BlogPage
