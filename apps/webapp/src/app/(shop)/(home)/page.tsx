import BackgroundSection from '@/components/BackgroundSection/BackgroundSection';
import { Divider } from '@/components/Divider';
import Heading from '@/components/Heading/Heading';
import SectionCollectionSlider from '@/components/SectionCollectionSlider';
import SectionGridFeatureItems from '@/components/SectionGridFeatureItems';
import SectionGridMoreExplore from '@/components/SectionGridMoreExplore/SectionGridMoreExplore';
import SectionHero3 from '@/components/SectionHero/SectionHero3';
import SectionHowItWork from '@/components/SectionHowItWork/SectionHowItWork';
import SectionPromo1 from '@/components/SectionPromo1';
import SectionPromo3 from '@/components/SectionPromo3';
import SectionSliderLargeProduct from '@/components/SectionSliderLargeProduct';
import SectionSliderProductCard from '@/components/SectionSliderProductCard';
import SectionMagazine5 from '@/components/blog/SectionMagazine5';
import { getBlogPosts, getCollections, getGroupCollections, getProducts } from '@/data/data';
import ButtonSecondary from '@/shared/Button/ButtonSecondary';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home 2',
  description:
    'Ciseco is a modern and elegant template for Next.js, Tailwind CSS, and TypeScript. It is designed to be simple and easy to use, with a focus on performance and accessibility.',
  keywords: [
    'Next.js',
    'Tailwind CSS',
    'TypeScript',
    'Ciseco',
    'Headless UI',
    'Fashion',
    'E-commerce',
  ],
};

async function PageHome2() {
  const allCollections = await getCollections();
  const featuredCollections = allCollections.slice(7, 11);
  const groupCollections = await getGroupCollections();
  const products = await getProducts();
  const _carouselProducts1 = products.slice(0, 5);
  const carouselProducts2 = products.slice(3, 10);
  const carouselProducts3 = products.slice(2, 6);
  const blogPosts = await getBlogPosts();

  return (
    <div className="nc-PageHome2 relative">
      <div className="container">
        <SectionHero3 />
      </div>

      <div className="container relative my-24 flex flex-col gap-y-24 lg:my-36 lg:gap-y-36">
        <SectionHowItWork />
        <SectionSliderProductCard data={carouselProducts2} subHeading="New Sports equipment" />
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
            <ButtonSecondary href="/blog">Show all blog articles</ButtonSecondary>
          </div>
        </div>
        <Divider />
        <SectionPromo1 />
      </div>
    </div>
  );
}

export default PageHome2;
