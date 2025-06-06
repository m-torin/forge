import { type Metadata } from "next";
import React from "react";

import {
  BgGlassmorphism,
  getBlogPosts,
  SectionAds,
  SectionGridPosts,
  SectionMagazine5,
  SectionPromo2,
} from "@repo/design-system/mantine-ciseco";

export const metadata: Metadata = {
  description:
    "Explore our blog for the latest news, articles, and insights on various topics.",
  title: "Blog",
};

async function BlogPage() {
  const blogPosts = await getBlogPosts();

  return (
    <div>
      <BgGlassmorphism />
      <div className="container relative">
        <div className="pb-16 pt-12 lg:pb-28">
          <SectionMagazine5 posts={blogPosts} />
        </div>
        <SectionAds />
        <SectionGridPosts posts={blogPosts} className="py-16 lg:py-28" />
        <SectionPromo2 className="pb-16 lg:pb-28" />
      </div>
    </div>
  );
}

export default BlogPage;
