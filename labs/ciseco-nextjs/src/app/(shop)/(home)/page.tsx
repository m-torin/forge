import {
  BackgroundSection,
  ButtonSecondary,
  Divider,
  Heading,
  SectionClientSay,
  SectionCollectionSlider,
  SectionCollectionSlider2,
  SectionGridFeatureItems,
  SectionGridMoreExplore,
  SectionHero2,
  SectionHowItWork,
  SectionMagazine5,
  SectionPromo1,
  SectionPromo2,
  SectionSliderLargeProduct,
  SectionSliderProductCard,
  getBlogPosts,
  getCollections,
  getGroupCollections,
  getProducts,
} from '@repo/design-system/ciseco'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Discover the latest products and trends in our online store.',
}

async function PageHome() {
  const allCollections = await getCollections()
  const departmentCollections = allCollections.slice(11, 15)
  const featuredCollections = allCollections.slice(7, 11)
  const groupCollections = await getGroupCollections()
  const products = await getProducts()
  const carouselProducts1 = products.slice(0, 5)
  const carouselProducts2 = products.slice(3, 10)
  const carouselProducts3 = products.slice(1, 5)
  const blogPosts = await getBlogPosts()

  return (
    <div className="nc-PageHome relative overflow-hidden">
      <SectionHero2 />
      <SectionCollectionSlider className="mt-24 lg:mt-32" collections={featuredCollections} />

      <div className="container relative my-24 flex flex-col gap-y-24 lg:my-32 lg:gap-y-32">
        <SectionSliderProductCard data={carouselProducts1} />
        <Divider />
        <div className="pb-16">
          <SectionHowItWork />
        </div>
        <SectionPromo1 />
        <div className="relative pb-20 pt-24 lg:pt-28">
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
  )
}

export default PageHome
