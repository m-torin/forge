import {
  getBlogPosts,
  getCollections,
  getGroupCollections,
  getProducts,
} from "@/lib/data-service";
import { type Metadata } from "next";

import {
  BackgroundSection,
  ButtonSecondary,
  Divider,
  Heading,
  SectionCollectionSlider,
  SectionGridFeatureItems,
  SectionGridMoreExplore,
  SectionHero3,
  SectionHowItWork,
  SectionMagazine5,
  SectionPromo1,
  SectionPromo3,
  SectionSliderLargeProduct,
  SectionSliderProductCard,
} from "@repo/design-system/mantine-ciseco";

export const metadata: Metadata = {
  description: "Discover the latest products and trends in our online store.",
  title: "Home",
};

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: _locale } = await params;

  const allCollections = await getCollections();
  const featuredCollections = allCollections.slice(7, 11);
  const groupCollections = await getGroupCollections();
  const products = await getProducts();
  const carouselProducts2 = products.slice(3, 10);
  const carouselProducts3 = products.slice(2, 6);
  const blogPosts = await getBlogPosts();

  return (
    <div className="nc-PageHome2 relative overflow-hidden">
      <div className="container">
        <SectionHero3 />
      </div>

      <div className="container relative my-24 flex flex-col gap-y-24 lg:my-36 lg:gap-y-36">
        <SectionHowItWork />
        <SectionSliderProductCard
          data={carouselProducts2}
          subHeading="New Sports equipment"
        />
        <SectionPromo3 />
        <SectionSliderLargeProduct products={carouselProducts3} />
        <div className="relative pb-20 pt-24 lg:pt-28">
          <BackgroundSection />
          <SectionGridMoreExplore groupCollections={groupCollections} />
        </div>
      </div>

      <SectionCollectionSlider collections={featuredCollections} />

      <div className="container relative my-24 flex flex-col gap-y-24 lg:my-36 lg:gap-y-36">
        <SectionGridFeatureItems data={products} />
        <Divider />
        <div>
          <Heading headingDim="From the Ciseco blog">The latest news</Heading>
          <SectionMagazine5 posts={blogPosts} />
          <div className="mt-20 flex justify-center">
            <ButtonSecondary href="/blog">
              Show all blog articles
            </ButtonSecondary>
          </div>
        </div>
        <Divider />
        <SectionPromo1 />
      </div>
    </div>
  );
}
