'use client';

import { StarIcon } from '@heroicons/react/24/solid';
import { Carousel } from '@mantine/carousel';
import clsx from 'clsx';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import { type FC, useRef, useState } from 'react';

import userImage1 from '../images/users/1.png';
import userImage2 from '../images/users/2.png';
import userImage3 from '../images/users/3.png';
import userImage4 from '../images/users/4.png';
import userImage5 from '../images/users/5.png';
import userImage6 from '../images/users/6.png';
import userImage7 from '../images/users/7.png';
import qlImage from '../images/users/ql.png';
import qrImage from '../images/users/qr.png';

import Heading from './Heading/Heading';

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

export interface SectionClientSayProps extends Record<string, any> {
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
        {/* BACKGROUND USER IMAGES */}
        <div className="hidden md:block">
          <Image
            alt=""
            className="absolute top-9 -left-20"
            height={60}
            sizes="100px"
            src={userImage2}
            width={60}
          />
          <Image
            alt=""
            className="absolute right-full bottom-[100px] mr-40"
            height={60}
            sizes="100px"
            src={userImage3}
            width={60}
          />
          <Image
            alt=""
            className="absolute top-full left-[140px]"
            height={60}
            sizes="100px"
            src={userImage4}
            width={60}
          />
          <Image
            alt=""
            className="absolute right-[140px] -bottom-10"
            height={60}
            sizes="100px"
            src={userImage5}
            width={60}
          />
          <Image
            alt=""
            className="absolute bottom-[80px] left-full ml-32"
            height={60}
            sizes="100px"
            src={userImage6}
            width={60}
          />
          <Image
            alt=""
            className="absolute top-10 -right-10"
            height={60}
            sizes="100px"
            src={userImage7}
            width={60}
          />
        </div>

        {/* MAIN USER IMAGE */}
        <Image alt="" className="mx-auto" height={120} src={userImage1} width={125} />

        {/* SLIDER */}
        <div className="relative mt-12 lg:mt-16">
          <Image
            alt=""
            className="absolute top-1 right-full -mr-16 opacity-50 md:opacity-100 lg:mr-3"
            height={44}
            src={qlImage}
            width={50}
          />
          <Image
            alt=""
            className="absolute top-1 left-full -ml-16 opacity-50 md:opacity-100 lg:ml-3"
            height={44}
            src={qrImage}
            width={50}
          />
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
            {DEMO_DATA.map((item: any) => (
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
