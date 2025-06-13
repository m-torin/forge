'use client';

import { StarIcon } from '@heroicons/react/24/solid';
import { Carousel } from '@mantine/carousel';
import clsx from 'clsx';
import Autoplay from 'embla-carousel-autoplay';
import { type FC, useRef, useState } from 'react';

import Heading from './shared/Heading/Heading';

export const DEMO_DATA = [
  {
    clientName: 'Tiana Abie',
    content:
      'Great quality products, affordable prices, fast and friendly delivery. I very recommend.',
    id: 1,
  },
  {
    clientName: 'Lennie Swiffan',
    content:
      'Great quality products, affordable prices, fast and friendly delivery. I very recommend.',
    id: 2,
  },
  {
    clientName: 'Berta Emili',
    content:
      'Great quality products, affordable prices, fast and friendly delivery. I very recommend.',
    id: 3,
  },
];

export interface SectionClientSayProps {
  className?: string;
  heading?: string;
  subHeading?: string;
}

const SectionClientSay: FC<SectionClientSayProps> = ({
  className,
  heading = 'Good news from far away 🥇',
  subHeading = "Let's see what people think of Ciseco",
}) => {
  const autoplay = useRef(Autoplay({ delay: 2000 }));
  const [embla, setEmbla] = useState<any>(null);
  const nextBtnDisabled = !embla?.canScrollNext();
  const prevBtnDisabled = !embla?.canScrollPrev();

  const onNextButtonClick = () => embla?.scrollNext();
  const onPrevButtonClick = () => embla?.scrollPrev();

  return (
    <div className={clsx('relative flow-root', className)}>
      <Heading
        description={subHeading}
        isCenter
        nextBtnDisabled={nextBtnDisabled}
        prevBtnDisabled={prevBtnDisabled}
        onClickNext={onNextButtonClick}
        onClickPrev={onPrevButtonClick}
      >
        {heading}
      </Heading>
      <div className="relative mx-auto max-w-2xl md:mb-16">
        {/* MAIN USER IMAGE */}
        <div className="mx-auto w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <span className="text-2xl">👤</span>
        </div>

        {/* SLIDER */}
        <div className="relative mt-12 lg:mt-16">
          <Carousel
            classNames={{
              indicator: 'size-2 data-[active]:bg-neutral-700 bg-neutral-300',
              indicators: 'gap-1 pt-10',
            }}
            getEmblaApi={setEmbla}
            plugins={[autoplay.current]}
            slideSize="100%"
            withControls={false}
            withIndicators
            onMouseEnter={autoplay.current.stop}
            onMouseLeave={autoplay.current.reset}
          >
            {DEMO_DATA.map((item) => (
              <Carousel.Slide key={item.id}>
                <div className="flex flex-col items-center text-center">
                  <span className="block text-2xl">{item.content}</span>
                  <span className="mt-8 block text-2xl font-semibold">{item.clientName}</span>
                  <div className="mt-3.5 flex items-center space-x-0.5 text-yellow-500">
                    <StarIcon className="h-6 w-6" />
                    <StarIcon className="h-6 w-6" />
                    <StarIcon className="h-6 w-6" />
                    <StarIcon className="h-6 w-6" />
                    <StarIcon className="h-6 w-6" />
                  </div>
                </div>
              </Carousel.Slide>
            ))}
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default SectionClientSay;
