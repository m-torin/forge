'use client';

import { Carousel } from '@mantine/carousel';
import { type FC, useState } from 'react';

import { type TProductItem } from '../data/types';

import Heading from './Heading/Heading';
import ProductCard from './ProductCard';

export interface SectionSliderProductCardProps extends Record<string, any> {
  className?: string;
  data: TProductItem[];
  heading?: string;
  headingClassName?: string;
  headingFontClassName?: string;
  subHeading?: string;
}

const SectionSliderProductCard: FC<SectionSliderProductCardProps> = ({
  className = '',
  data,
  heading,
  headingClassName,
  headingFontClassName,
  subHeading = 'REY backpacks & bags',
}) => {
  const [embla, setEmbla] = useState<any>(null);
  const nextBtnDisabled = !embla?.canScrollNext();
  const prevBtnDisabled = !embla?.canScrollPrev();

  const onNextButtonClick = () => embla?.scrollNext();
  const onPrevButtonClick = () => embla?.scrollPrev();

  // Data prop is guaranteed to exist and have content
  // This component should not be rendered without data

  return (
    <div className={`nc-SectionSliderProductCard ${className}`}>
      <Heading
        className={headingClassName}
        fontClass={headingFontClassName}
        hasNextPrev
        headingDim={subHeading}
        nextBtnDisabled={nextBtnDisabled}
        prevBtnDisabled={prevBtnDisabled}
        onClickNext={onNextButtonClick}
        onClickPrev={onPrevButtonClick}
      >
        {heading ?? 'New Arrivals'}
      </Heading>

      <Carousel
        classNames={{
          root: '-mx-5 sm:-mx-8',
          slide: 'px-5 sm:px-8',
        }}
        getEmblaApi={setEmbla}
        slideGap={{ base: 'xs', sm: 'md' }}
        slideSize={{ base: '86%', lg: '33.333333%', md: '50%', xl: '25%' }}
        withControls={false}
      >
        {data.map((product: any) => (
          <Carousel.Slide key={product.id}>
            <ProductCard data={product} />
          </Carousel.Slide>
        ))}
      </Carousel>
    </div>
  );
};

export default SectionSliderProductCard;
