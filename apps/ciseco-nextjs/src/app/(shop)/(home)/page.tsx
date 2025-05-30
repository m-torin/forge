import BackgroundSection from '@/components/BackgroundSection/BackgroundSection';
import SectionMagazine5 from '@/components/blog/SectionMagazine5';
import { Divider } from '@/components/Divider';
import Heading from '@/components/Heading/Heading';
import SectionClientSay from '@/components/SectionClientSay';
import SectionCollectionSlider from '@/components/SectionCollectionSlider';
import SectionCollectionSlider2 from '@/components/SectionCollectionSlider2';
import SectionGridFeatureItems from '@/components/SectionGridFeatureItems';
import SectionGridMoreExplore from '@/components/SectionGridMoreExplore/SectionGridMoreExplore';
import SectionHero2 from '@/components/SectionHero/SectionHero2';
import SectionHowItWork from '@/components/SectionHowItWork/SectionHowItWork';
import SectionPromo1 from '@/components/SectionPromo1';
import SectionPromo2 from '@/components/SectionPromo2';
import SectionSliderLargeProduct from '@/components/SectionSliderLargeProduct';
import SectionSliderProductCard from '@/components/SectionSliderProductCard';
import { getBlogPosts, getCollections, getGroupCollections, getProducts } from '@/data/data';
import ButtonSecondary from '@/shared/Button/ButtonSecondary';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  description: 'Discover the latest products and trends in our online store.',
  title: 'Home',
};

async function PageHome() {
  const allCollections = await getCollections();
  const departmentCollections = allCollections.slice(11, 15);
  const featuredCollections = allCollections.slice(7, 11);
  const groupCollections = await getGroupCollections();
  const products = await getProducts();
  const carouselProducts1 = products.slice(0, 5);
  const carouselProducts2 = products.slice(3, 10);
  const carouselProducts3 = products.slice(1, 5);
  const blogPosts = await getBlogPosts();

  return (
    <div className="nc-PageHome relative overflow-hidden">
      <SectionHero2 />
      <SectionCollectionSlider collections={featuredCollections} className="mt-24 lg:mt-32" />

      <div className="relative container my-24 flex flex-col gap-y-24 lg:my-32 lg:gap-y-32">
        <SectionSliderProductCard data={carouselProducts1} />
        <Divider />
        <div className="pb-16">
          <SectionHowItWork />
        </div>
        <SectionPromo1 />
        <div className="relative pt-24 pb-20 lg:pt-28">
          <BackgroundSection />
          <SectionGridMoreExplore groupCollections={groupCollections} />
        </div>
        <SectionSliderProductCard
          data={carouselProducts2}
          heading="Best Sellers"
          subHeading="Best selling of the month"
        />
        <SectionPromo2 />
        <SectionSliderLargeProduct products={carouselProducts3} />
        <SectionGridFeatureItems data={products} />
        <Divider />
        <SectionCollectionSlider2 collections={departmentCollections} />
        <Divider />
        <div>
          <Heading headingDim="From the Ciseco blog">The latest news</Heading>
          <SectionMagazine5 posts={blogPosts} />
          <div className="mt-20 flex justify-center">
            <ButtonSecondary href="/blog">Show all blog articles</ButtonSecondary>
          </div>
        </div>

        <Divider />
        <SectionClientSay />
      </div>
    </div>
  );
}

export default PageHome;
