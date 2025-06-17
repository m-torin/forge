'use client'

import Heading from '@/components/Heading/Heading'
import { TCollection } from '@/data/data'
import { useCarouselArrowButtons } from '@/hooks/use-carousel-arrow-buttons'
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import type { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import Link from 'next/link'
import { FC } from 'react'
import CollectionCard2 from './CollectionCard2'

export interface SectionSliderCategoriesProps {
  className?: string
  collections: TCollection[]
  subHeading?: string
  heading?: string
  headingDim?: string
  emblaOptions?: EmblaOptionsType
}

const SectionCollectionSlider2: FC<SectionSliderCategoriesProps> = ({
  heading = 'Shop by department',
  headingDim = 'Explore the absolute',
  subHeading,
  className,
  collections,
  emblaOptions = {
    slidesToScroll: 'auto',
  },
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions)
  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = useCarouselArrowButtons(emblaApi)

  return (
    <div className={clsx(className)}>
      <Heading
        description={subHeading}
        hasNextPrev
        headingDim={headingDim}
        prevBtnDisabled={prevBtnDisabled}
        nextBtnDisabled={nextBtnDisabled}
        onClickPrev={onPrevButtonClick}
        onClickNext={onNextButtonClick}
      >
        {heading}
      </Heading>

      <div className={'embla'} ref={emblaRef}>
        <div className="-ms-5 embla__container sm:-ms-8">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="embla__slide basis-[86%] ps-5 sm:ps-8 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <CollectionCard2 collection={collection} />
            </div>
          ))}

          <div className="embla__slide basis-[86%] ps-5 sm:ps-8 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
            <div className="group aspect-w-1 relative h-0 w-full flex-1 overflow-hidden rounded-2xl bg-neutral-100 aspect-h-1">
              <div>
                <div className="absolute inset-x-10 inset-y-6 flex flex-col justify-center sm:items-center">
                  <div className="relative flex text-neutral-900">
                    <span className="text-lg font-semibold">More collections</span>
                    <HugeiconsIcon
                      icon={ArrowUpRight01Icon}
                      size={24}
                      className="absolute left-full ms-2 size-5 group-hover:scale-110"
                      color="currentColor"
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className="mt-1 text-sm text-neutral-800">Show me more</span>
                </div>
              </div>
              <Link
                href={'/collections/all'}
                className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover:opacity-100"
              ></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SectionCollectionSlider2
