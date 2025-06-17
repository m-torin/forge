import HeaderFilterSection from '@/components/HeaderFilterSection'
import ProductCard from '@/components/ProductCard'
import { TProductItem } from '@/data/data'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { ArrowRightIcon } from '@heroicons/react/24/solid'
import { FC } from 'react'

//
export interface SectionGridFeatureItemsProps {
  data: TProductItem[]
}

const SectionGridFeatureItems: FC<SectionGridFeatureItemsProps> = ({ data }) => {
  return (
    <div className="nc-SectionGridFeatureItems relative">
      <HeaderFilterSection heading="Find your favorite products." />
      <div className={`grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}>
        {data.map((item) => (
          <ProductCard data={item} key={item.id} />
        ))}
      </div>
      <div className="mt-16 flex items-center justify-center">
        <ButtonPrimary href="/collections/all">
          Show me more
          <ArrowRightIcon className="ms-2 h-5 w-5" />
        </ButtonPrimary>
      </div>
    </div>
  )
}

export default SectionGridFeatureItems
