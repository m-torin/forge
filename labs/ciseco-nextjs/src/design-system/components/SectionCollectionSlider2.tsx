'use client'

import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import useEmblaCarousel from 'embla-carousel-react'
import Link from 'next/link'
import { type FC } from 'react'

import { type TCollection } from '../data/data'
import { useCarouselArrowButtons } from '../hooks/use-carousel-arrow-buttons'

import CollectionCard2 from './CollectionCard2'
import Heading from './Heading/Heading'

import type { EmblaOptionsType } from 'embla-carousel'

export interface SectionSliderCategoriesProps {
  className?: string
  collections: TCollection[]
  emblaOptions?: EmblaOptionsType
  heading?: string
  headingDim?: string
  subHeading?: string
}

const SectionCollectionSlider2: FC<SectionSliderCategoriesProps> = ({
  className,
  collections,
  emblaOptions = {
    slidesToScroll: 'auto',
  },
  heading = 'Shop by department',
  headingDim = 'Explore the absolute',
  subHeading,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions)
  const { nextBtnDisabled, onNextButtonClick, onPrevButtonClick, prevBtnDisabled } = useCarouselArrowButtons(emblaApi)

  return (
    <div className={clsx(className)}>
      <Heading
        description={subHeading}
        onClickNext={onNextButtonClick}
        onClickPrev={onPrevButtonClick}
        hasNextPrev
        headingDim={headingDim}
        nextBtnDisabled={nextBtnDisabled}
        prevBtnDisabled={prevBtnDisabled}
      >
        {heading}
      </Heading>

      <div ref={emblaRef} className="embla">
        <div className="embla__container -ms-5 sm:-ms-8">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="embla__slide basis-[86%] ps-5 sm:ps-8 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <CollectionCard2 collection={collection} />
            </div>
          ))}

          <div className="embla__slide basis-[86%] ps-5 sm:ps-8 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
            <div className="group relative aspect-square w-full flex-1 overflow-hidden rounded-2xl bg-neutral-100">
              <div>
                <div className="absolute inset-x-10 inset-y-6 flex flex-col justify-center sm:items-center">
                  <div className="relative flex text-neutral-900">
                    <span className="text-lg font-semibold">More collections</span>
                    <HugeiconsIcon
                      strokeWidth={1.5}
                      color="currentColor"
                      icon={ArrowUpRight01Icon}
                      className="absolute left-full ms-2 size-5 group-hover:scale-110"
                      size={24}
                    />
                  </div>
                  <span className="mt-1 text-sm text-neutral-800">Show me more</span>
                </div>
              </div>
              <Link
                href="/collections/all"
                className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover:opacity-100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SectionCollectionSlider2
