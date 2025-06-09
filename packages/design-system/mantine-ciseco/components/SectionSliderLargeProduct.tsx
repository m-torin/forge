'use client';

import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import useEmblaCarousel from 'embla-carousel-react';
import Link from 'next/link';
import { type FC } from 'react';

import { type TProductItem } from '../data/data';
import { useCarouselArrowButtons } from '../hooks/use-carousel-arrow-buttons';

import Heading from './Heading/Heading';
import ProductCardLarge from './ProductCardLarge';

import type { EmblaOptionsType } from 'embla-carousel';

export interface SectionSliderLargeProductProps {
  className?: string;
  emblaOptions?: EmblaOptionsType;
  heading?: string;
  headingDim?: string;
  itemClassName?: string;
  products: TProductItem[];
}

const SectionSliderLargeProduct: FC<SectionSliderLargeProductProps> = ({
  className = '',
  emblaOptions = {
    slidesToScroll: 'auto',
  },
  heading = 'Chosen by experts',
  headingDim = 'Featured of the week',
  products,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions);
  const { nextBtnDisabled, onNextButtonClick, onPrevButtonClick, prevBtnDisabled } =
    useCarouselArrowButtons(emblaApi);

  // Don't render anything if no products
  if (!products || products.length === 0) {
    return null;
  }
  return (
    <div className={`nc-SectionSliderLargeProduct ${className}`}>
      <Heading
        onClickNext={onNextButtonClick}
        onClickPrev={onPrevButtonClick}
        hasNextPrev
        headingDim={headingDim}
        isCenter={false}
        nextBtnDisabled={nextBtnDisabled}
        prevBtnDisabled={prevBtnDisabled}
      >
        {heading}
      </Heading>

      <div ref={emblaRef} className="embla">
        <div className="-ms-5 embla__container sm:-ms-8">
          {products?.map((product) => (
            <div
              key={product.id}
              className="embla__slide basis-full ps-5 sm:basis-2/3 sm:ps-8 lg:basis-1/2 xl:basis-2/5 2xl:basis-1/3"
            >
              <ProductCardLarge product={product} />
            </div>
          ))}

          <Link
            href="/collections/all"
            className="group relative block embla__slide basis-full ps-5 sm:basis-2/3 sm:ps-8 lg:basis-1/2 xl:basis-2/5 2xl:basis-1/3"
          >
            <div className="relative h-[410px] overflow-hidden rounded-2xl">
              <div className="h-[410px] bg-black/5 dark:bg-neutral-800" />
              <div className="absolute inset-x-10 inset-y-6 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <span className="text-xl font-semibold">More items</span>
                  <HugeiconsIcon
                    strokeWidth={1.5}
                    color="currentColor"
                    icon={ArrowUpRight01Icon}
                    className="absolute left-full ms-2 group-hover:scale-110"
                    size={24}
                  />
                </div>
                <span className="mt-1 text-sm">Show me more</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SectionSliderLargeProduct;
