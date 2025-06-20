'use client';

import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Carousel } from '@mantine/carousel';
import Link from 'next/link';
import { type FC, useState } from 'react';

import { type TProductItem } from '../data/types';

import Heading from './Heading/Heading';
import ProductCardLarge from './ProductCardLarge';

export interface SectionSliderLargeProductProps extends Record<string, any> {
  className?: string;
  heading?: string;
  headingDim?: string;
  itemClassName?: string;
  products: TProductItem[];
}

const SectionSliderLargeProduct: FC<SectionSliderLargeProductProps> = ({
  className = '',
  heading = 'Chosen by experts',
  headingDim = 'Featured of the week',
  products,
}) => {
  const [embla, setEmbla] = useState<any>(null);
  const nextBtnDisabled = !embla?.canScrollNext();
  const prevBtnDisabled = !embla?.canScrollPrev();

  const onNextButtonClick = () => embla?.scrollNext();
  const onPrevButtonClick = () => embla?.scrollPrev();

  // Products prop is guaranteed to exist and have content
  // This component should not be rendered without products
  return (
    <div className={`nc-SectionSliderLargeProduct ${className}`}>
      <Heading
        hasNextPrev
        headingDim={headingDim}
        isCenter={false}
        nextBtnDisabled={nextBtnDisabled}
        prevBtnDisabled={prevBtnDisabled}
        onClickNext={onNextButtonClick}
        onClickPrev={onPrevButtonClick}
      >
        {heading}
      </Heading>

      <Carousel
        classNames={{
          root: '-mx-5 sm:-mx-8',
          slide: 'px-5 sm:px-8',
        }}
        getEmblaApi={setEmbla}
        slideGap={{ base: 'xs', sm: 'md' }}
        slideSize={{ '2xl': '33.333333%', base: '100%', lg: '50%', sm: '66.666667%', xl: '40%' }}
        withControls={false}
      >
        {products.map((product) => (
          <Carousel.Slide key={product.id}>
            <ProductCardLarge product={product} />
          </Carousel.Slide>
        ))}

        <Carousel.Slide>
          <Link className="group relative block h-full" href="/collections/all">
            <div className="relative h-[410px] overflow-hidden rounded-2xl">
              <div className="h-[410px] bg-black/5 dark:bg-neutral-800" />
              <div className="absolute inset-x-10 inset-y-6 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <span className="text-xl font-semibold">More items</span>
                  <HugeiconsIcon
                    className="absolute left-full ms-2 group-hover:scale-110"
                    color="currentColor"
                    icon={ArrowUpRight01Icon}
                    size={24}
                    strokeWidth={1.5}
                  />
                </div>
                <span className="mt-1 text-sm">Show me more</span>
              </div>
            </div>
          </Link>
        </Carousel.Slide>
      </Carousel>
    </div>
  );
};

export default SectionSliderLargeProduct;
