'use client';

import Heading from '@/components/Heading/Heading';
import { useCarouselArrowButtons } from '@/hooks/use-carousel-arrow-buttons';
import { useCarouselDotButton } from '@/hooks/use-carousel-dot-buttons';
import userImage1 from '@/images/users/1.png';
import userImage2 from '@/images/users/2.png';
import userImage3 from '@/images/users/3.png';
import userImage4 from '@/images/users/4.png';
import userImage5 from '@/images/users/5.png';
import userImage6 from '@/images/users/6.png';
import userImage7 from '@/images/users/7.png';
import qlImage from '@/images/users/ql.png';
import qrImage from '@/images/users/qr.png';
import { StarIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { type FC } from 'react';

import type { EmblaOptionsType } from 'embla-carousel';

export const DEMO_DATA = [
  {
    id: 1,
    clientName: 'Tiana Abie',
    content:
      'Great quality products, affordable prices, fast and friendly delivery. I very recommend.',
  },
  {
    id: 2,
    clientName: 'Lennie Swiffan',
    content:
      'Great quality products, affordable prices, fast and friendly delivery. I very recommend.',
  },
  {
    id: 3,
    clientName: 'Berta Emili',
    content:
      'Great quality products, affordable prices, fast and friendly delivery. I very recommend.',
  },
];

export interface SectionClientSayProps {
  className?: string;
  emblaOptions?: EmblaOptionsType;
  heading?: string;
  subHeading?: string;
}

const SectionClientSay: FC<SectionClientSayProps> = ({
  className,
  emblaOptions = {
    slidesToScroll: 1,
    loop: true,
  },
  heading = 'Good news from far away 🥇',
  subHeading = "Let's see what people think of Ciseco",
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, [
    Autoplay({ delay: 2000, playOnInit: true }),
  ]);
  const { nextBtnDisabled, onNextButtonClick, onPrevButtonClick, prevBtnDisabled } =
    useCarouselArrowButtons(emblaApi);
  const { onDotButtonClick, scrollSnaps, selectedIndex } = useCarouselDotButton(emblaApi);

  return (
    <div className={clsx('relative flow-root', className)}>
      <Heading
        description={subHeading}
        onClickNext={onNextButtonClick}
        onClickPrev={onPrevButtonClick}
        isCenter
        nextBtnDisabled={nextBtnDisabled}
        prevBtnDisabled={prevBtnDisabled}
      >
        {heading}
      </Heading>
      <div className="relative mx-auto max-w-2xl md:mb-16">
        {/* BACKGROUND USER IMAGES */}
        <div className="hidden md:block">
          <Image
            width={60}
            className="absolute top-9 -left-20"
            alt=""
            height={60}
            sizes="100px"
            src={userImage2}
          />
          <Image
            width={60}
            className="absolute right-full bottom-[100px] mr-40"
            alt=""
            height={60}
            sizes="100px"
            src={userImage3}
          />
          <Image
            width={60}
            className="absolute top-full left-[140px]"
            alt=""
            height={60}
            sizes="100px"
            src={userImage4}
          />
          <Image
            width={60}
            className="absolute right-[140px] -bottom-10"
            alt=""
            height={60}
            sizes="100px"
            src={userImage5}
          />
          <Image
            width={60}
            className="absolute bottom-[80px] left-full ml-32"
            alt=""
            height={60}
            sizes="100px"
            src={userImage6}
          />
          <Image
            width={60}
            className="absolute top-10 -right-10"
            alt=""
            height={60}
            sizes="100px"
            src={userImage7}
          />
        </div>

        {/* MAIN USER IMAGE */}
        <Image width={125} className="mx-auto" alt="" height={120} src={userImage1} />

        {/* SLIDER */}
        <div className="relative mt-12 lg:mt-16">
          <Image
            width={50}
            className="absolute top-1 right-full -mr-16 opacity-50 md:opacity-100 lg:mr-3"
            alt=""
            height={44}
            src={qlImage}
          />
          <Image
            width={50}
            className="absolute top-1 left-full -ml-16 opacity-50 md:opacity-100 lg:ml-3"
            alt=""
            height={44}
            src={qrImage}
          />
          <div ref={emblaRef} className="embla">
            <ul className="embla__container">
              {DEMO_DATA.map((item) => (
                <li
                  key={item.id}
                  className="flex embla__slide basis-full flex-col items-center text-center"
                >
                  <span className="block text-2xl">{item.content}</span>
                  <span className="mt-8 block text-2xl font-semibold">{item.clientName}</span>
                  <div className="mt-3.5 flex items-center space-x-0.5 text-yellow-500">
                    <StarIcon className="h-6 w-6" />
                    <StarIcon className="h-6 w-6" />
                    <StarIcon className="h-6 w-6" />
                    <StarIcon className="h-6 w-6" />
                    <StarIcon className="h-6 w-6" />
                  </div>
                </li>
              ))}
            </ul>

            <div className="embla__dots flex items-center justify-center pt-10">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => onDotButtonClick(index)}
                  className={clsx(
                    index === selectedIndex ? 'bg-neutral-700' : 'bg-neutral-300',
                    'mx-1 size-2 rounded-full focus:outline-none',
                  )}
                  type="button"
                 />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionClientSay;
