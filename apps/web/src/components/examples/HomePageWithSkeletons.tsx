/**
 * Example: Home Page with Comprehensive Skeleton Loading
 * 
 * This example demonstrates how to create a complete home page
 * with skeleton loading states for all major sections.
 */

"use client";

import {
  BlogSkeleton,
  CollectionSliderSkeleton,
  HeroSkeleton,
  ProductSliderSkeleton,
  SectionHeadingSkeleton,
  TestimonialSkeleton,
} from "@/components/LoadingSkeletons";
import { SkeletonWrapper } from "@/components/SkeletonWrapper";
import { useEffect, useState } from "react";

import {
  Divider,
  SectionClientSay,
  SectionCollectionSlider,
  SectionHero2,
  SectionMagazine5,
  SectionSliderProductCard,
} from "@repo/design-system/mantine-ciseco";

import type { TBlogPost, TCardProduct, TCollection } from "@/data/data-service";

interface HomePageData {
  blogPosts: TBlogPost[];
  error: Error | null;
  featuredCollections: TCollection[];
  featuredProducts: TCardProduct[];
  isLoading: boolean;
}

export function useHomePageData(): HomePageData {
  const [data, setData] = useState<Omit<HomePageData, 'isLoading' | 'error'>>({
    blogPosts: [],
    featuredCollections: [],
    featuredProducts: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchHomePageData() {
      try {
        setIsLoading(true);
        setError(null);

        // Simulate staggered loading for different sections
        const { getBlogPosts, getCollections, getProducts } = await import("@/data/data-service");

        // Load data with realistic delays
        const [products, collections, posts] = await Promise.all([
          getProducts().then(data => {
            // Simulate delay for products
            return new Promise<typeof data>(resolve => 
              setTimeout(() => resolve(data.slice(0, 8)), 800)
            );
          }),
          getCollections().then(data => {
            // Simulate delay for collections
            return new Promise<typeof data>(resolve => 
              setTimeout(() => resolve(data.slice(0, 6)), 600)
            );
          }),
          getBlogPosts().then(data => {
            // Simulate delay for blog posts
            return new Promise<typeof data>(resolve => 
              setTimeout(() => resolve(data.slice(0, 3)), 1000)
            );
          }),
        ]);

        setData({
          blogPosts: posts,
          featuredCollections: collections,
          featuredProducts: products,
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchHomePageData();
  }, []);

  return { ...data, error, isLoading };
}

export function HomePageWithSkeletons() {
  const { blogPosts, error, featuredCollections, featuredProducts, isLoading } = useHomePageData();

  if (error) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
        <p className="mt-2 text-neutral-600">{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="nc-PageHome relative overflow-hidden">
      {/* Hero Section - Always shows, can have its own loading state */}
      <SkeletonWrapper
        isLoading={isLoading}
        skeleton={<HeroSkeleton />}
      >
        <SectionHero2 />
      </SkeletonWrapper>

      <div className="container relative my-24 flex flex-col gap-y-24 lg:my-32 lg:gap-y-32">
        
        {/* Featured Collections Section */}
        <section>
          <SkeletonWrapper
            isLoading={isLoading}
            skeleton={
              <div className="space-y-16">
                <SectionHeadingSkeleton />
                <CollectionSliderSkeleton count={4} />
              </div>
            }
          >
            <div className="space-y-16">
              <div className="text-center">
                <h2 className="text-3xl font-bold">Featured Collections</h2>
                <p className="mt-4 text-neutral-600">Discover our curated collections</p>
              </div>
              <SectionCollectionSlider collections={featuredCollections} />
            </div>
          </SkeletonWrapper>
        </section>

        <Divider />

        {/* Featured Products Section */}
        <section>
          <SkeletonWrapper
            isLoading={isLoading}
            skeleton={
              <div className="space-y-16">
                <SectionHeadingSkeleton />
                <ProductSliderSkeleton count={4} />
              </div>
            }
          >
            <div className="space-y-16">
              <div className="text-center">
                <h2 className="text-3xl font-bold">Featured Products</h2>
                <p className="mt-4 text-neutral-600">Hand-picked favorites just for you</p>
              </div>
              <SectionSliderProductCard data={featuredProducts} />
            </div>
          </SkeletonWrapper>
        </section>

        <Divider />

        {/* Blog Section */}
        <section>
          <SkeletonWrapper
            isLoading={isLoading}
            skeleton={
              <div className="space-y-16">
                <SectionHeadingSkeleton />
                <BlogSkeleton count={3} />
              </div>
            }
          >
            <div className="space-y-16">
              <div className="text-center">
                <h2 className="text-3xl font-bold">Latest from our Blog</h2>
                <p className="mt-4 text-neutral-600">Stay updated with our latest news and stories</p>
              </div>
              <SectionMagazine5 posts={blogPosts} />
            </div>
          </SkeletonWrapper>
        </section>

        <Divider />

        {/* Testimonials Section */}
        <section>
          <SkeletonWrapper
            isLoading={isLoading}
            skeleton={<TestimonialSkeleton />}
          >
            <SectionClientSay />
          </SkeletonWrapper>
        </section>
      </div>
    </div>
  );
}

/**
 * Progressive Loading Example
 * 
 * This variation shows how to load sections progressively
 * rather than waiting for all data to be ready.
 */
export function ProgressiveHomePageWithSkeletons() {
  const [sectionsLoaded, setSectionsLoaded] = useState({
    blog: false,
    collections: false,
    hero: false,
    products: false,
    testimonials: false,
  });

  const [data, setData] = useState({
    blogPosts: [] as TBlogPost[],
    featuredCollections: [] as TCollection[],
    featuredProducts: [] as TCardProduct[],
  });

  useEffect(() => {
    // Load sections progressively
    const loadSections = async () => {
      const { getBlogPosts, getCollections, getProducts } = await import("@/data/data-service");

      // Hero loads immediately
      setTimeout(() => {
        setSectionsLoaded(prev => ({ ...prev, hero: true }));
      }, 200);

      // Collections load first
      setTimeout(async () => {
        const collections = await getCollections();
        setData(prev => ({ ...prev, featuredCollections: collections.slice(0, 6) }));
        setSectionsLoaded(prev => ({ ...prev, collections: true }));
      }, 600);

      // Products load second
      setTimeout(async () => {
        const products = await getProducts();
        setData(prev => ({ ...prev, featuredProducts: products.slice(0, 8) }));
        setSectionsLoaded(prev => ({ ...prev, products: true }));
      }, 1000);

      // Blog posts load third
      setTimeout(async () => {
        const posts = await getBlogPosts();
        setData(prev => ({ ...prev, blogPosts: posts.slice(0, 3) }));
        setSectionsLoaded(prev => ({ ...prev, blog: true }));
      }, 1400);

      // Testimonials load last
      setTimeout(() => {
        setSectionsLoaded(prev => ({ ...prev, testimonials: true }));
      }, 1800);
    };

    loadSections();
  }, []);

  return (
    <div className="nc-PageHome relative overflow-hidden">
      <SkeletonWrapper
        isLoading={!sectionsLoaded.hero}
        skeleton={<HeroSkeleton />}
      >
        <SectionHero2 />
      </SkeletonWrapper>

      <div className="container relative my-24 flex flex-col gap-y-24 lg:my-32 lg:gap-y-32">
        
        <SkeletonWrapper
          isLoading={!sectionsLoaded.collections}
          skeleton={<CollectionSliderSkeleton count={4} />}
        >
          <SectionCollectionSlider collections={data.featuredCollections} />
        </SkeletonWrapper>

        <Divider />

        <SkeletonWrapper
          isLoading={!sectionsLoaded.products}
          skeleton={<ProductSliderSkeleton count={4} />}
        >
          <SectionSliderProductCard data={data.featuredProducts} />
        </SkeletonWrapper>

        <Divider />

        <SkeletonWrapper
          isLoading={!sectionsLoaded.blog}
          skeleton={<BlogSkeleton count={3} />}
        >
          <SectionMagazine5 posts={data.blogPosts} />
        </SkeletonWrapper>

        <Divider />

        <SkeletonWrapper
          isLoading={!sectionsLoaded.testimonials}
          skeleton={<TestimonialSkeleton />}
        >
          <SectionClientSay />
        </SkeletonWrapper>
      </div>
    </div>
  );
}