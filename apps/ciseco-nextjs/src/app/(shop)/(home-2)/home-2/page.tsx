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
  getBlogPosts,
  getCollections,
  getGroupCollections,
  getProducts,
} from '@repo/design-system/ciseco'

async function PageHome2() {
  const allCollections = await getCollections()
  const featuredCollections = allCollections.slice(7, 11)
  const groupCollections = await getGroupCollections()
  const products = await getProducts()
  const carouselProducts1 = products.slice(0, 5)
  const carouselProducts2 = products.slice(3, 10)
  const carouselProducts3 = products.slice(2, 6)
  const blogPosts = await getBlogPosts()

  return (
    <div className="nc-PageHome2 relative overflow-hidden">
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
  )
}

export default PageHome2
