'use client'

import Heading from '@/components/Heading/Heading'
import { TProductItem } from '@/data/data'
import { useCarouselArrowButtons } from '@/hooks/use-carousel-arrow-buttons'
import type { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import { FC } from 'react'
import ProductCard from './ProductCard'

export interface SectionSliderProductCardProps {
  className?: string
  heading?: string
  headingFontClassName?: string
  headingClassName?: string
  subHeading?: string
  data: TProductItem[]
  emblaOptions?: EmblaOptionsType
}

const SectionSliderProductCard: FC<SectionSliderProductCardProps> = ({
  className = '',
  headingFontClassName,
  headingClassName,
  heading,
  subHeading = 'REY backpacks & bags',
  data,
  emblaOptions = {
    slidesToScroll: 'auto',
  },
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions)
  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = useCarouselArrowButtons(emblaApi)

  return (
    <div className={`nc-SectionSliderProductCard ${className}`}>
      <Heading
        className={headingClassName}
        fontClass={headingFontClassName}
        headingDim={subHeading}
        hasNextPrev
        prevBtnDisabled={prevBtnDisabled}
        nextBtnDisabled={nextBtnDisabled}
        onClickPrev={onPrevButtonClick}
        onClickNext={onNextButtonClick}
      >
        {heading || 'New Arrivals'}
      </Heading>

      <div className="embla" ref={emblaRef}>
        <div className="-ms-5 embla__container sm:-ms-8">
          {data.map((product) => (
            <div
              key={product.id}
              className="embla__slide basis-[86%] ps-5 sm:ps-8 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <ProductCard data={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SectionSliderProductCard
