'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { type FC } from 'react'

import { type TProductItem } from '../data/data'
import { useCarouselArrowButtons } from '../hooks/use-carousel-arrow-buttons'

import Heading from './Heading/Heading'
import ProductCard from './ProductCard'

import type { EmblaOptionsType } from 'embla-carousel'

export interface SectionSliderProductCardProps {
  className?: string
  data: TProductItem[]
  emblaOptions?: EmblaOptionsType
  heading?: string
  headingClassName?: string
  headingFontClassName?: string
  subHeading?: string
}

const SectionSliderProductCard: FC<SectionSliderProductCardProps> = ({
  className = '',
  data,
  emblaOptions = {
    slidesToScroll: 'auto',
  },
  heading,
  headingClassName,
  headingFontClassName,
  subHeading = 'REY backpacks & bags',
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions)
  const { nextBtnDisabled, onNextButtonClick, onPrevButtonClick, prevBtnDisabled } = useCarouselArrowButtons(emblaApi)

  return (
    <div className={`nc-SectionSliderProductCard ${className}`}>
      <Heading
        fontClass={headingFontClassName}
        onClickNext={onNextButtonClick}
        onClickPrev={onPrevButtonClick}
        className={headingClassName}
        hasNextPrev
        headingDim={subHeading}
        nextBtnDisabled={nextBtnDisabled}
        prevBtnDisabled={prevBtnDisabled}
      >
        {heading || 'New Arrivals'}
      </Heading>

      <div ref={emblaRef} className="embla">
        <div className="embla__container -ms-5 sm:-ms-8">
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
