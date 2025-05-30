'use client'

import Heading from '@/components/Heading/Heading'
import { useCarouselArrowButtons } from '@/hooks/use-carousel-arrow-buttons'
import { useCarouselDotButton } from '@/hooks/use-carousel-dot-buttons'
import userImage1 from '@/images/users/1.png'
import userImage2 from '@/images/users/2.png'
import userImage3 from '@/images/users/3.png'
import userImage4 from '@/images/users/4.png'
import userImage5 from '@/images/users/5.png'
import userImage6 from '@/images/users/6.png'
import userImage7 from '@/images/users/7.png'
import qlImage from '@/images/users/ql.png'
import qrImage from '@/images/users/qr.png'
import { StarIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import type { EmblaOptionsType } from 'embla-carousel'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { FC } from 'react'

export const DEMO_DATA = [
  {
    id: 1,
    clientName: 'Tiana Abie',
    content: 'Great quality products, affordable prices, fast and friendly delivery. I very recommend.',
  },
  {
    id: 2,
    clientName: 'Lennie Swiffan',
    content: 'Great quality products, affordable prices, fast and friendly delivery. I very recommend.',
  },
  {
    id: 3,
    clientName: 'Berta Emili',
    content: 'Great quality products, affordable prices, fast and friendly delivery. I very recommend.',
  },
]

export interface SectionClientSayProps {
  className?: string
  emblaOptions?: EmblaOptionsType
  heading?: string
  subHeading?: string
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
  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, [Autoplay({ playOnInit: true, delay: 2000 })])
  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = useCarouselArrowButtons(emblaApi)
  const { selectedIndex, scrollSnaps, onDotButtonClick } = useCarouselDotButton(emblaApi)

  return (
    <div className={clsx('relative flow-root', className)}>
      <Heading
        description={subHeading}
        isCenter
        prevBtnDisabled={prevBtnDisabled}
        nextBtnDisabled={nextBtnDisabled}
        onClickPrev={onPrevButtonClick}
        onClickNext={onNextButtonClick}
      >
        {heading}
      </Heading>
      <div className="relative mx-auto max-w-2xl md:mb-16">
        {/* BACKGROUND USER IMAGES */}
        <div className="hidden md:block">
          <Image sizes="100px" width={60} height={60} className="absolute top-9 -left-20" src={userImage2} alt="" />
          <Image
            sizes="100px"
            width={60}
            height={60}
            className="absolute right-full bottom-[100px] mr-40"
            src={userImage3}
            alt=""
          />
          <Image
            sizes="100px"
            width={60}
            height={60}
            className="absolute top-full left-[140px]"
            src={userImage4}
            alt=""
          />
          <Image
            sizes="100px"
            width={60}
            height={60}
            className="absolute right-[140px] -bottom-10"
            src={userImage5}
            alt=""
          />
          <Image
            sizes="100px"
            width={60}
            height={60}
            className="absolute bottom-[80px] left-full ml-32"
            src={userImage6}
            alt=""
          />
          <Image sizes="100px" width={60} height={60} className="absolute top-10 -right-10" src={userImage7} alt="" />
        </div>

        {/* MAIN USER IMAGE */}
        <Image className="mx-auto" src={userImage1} width={125} height={120} alt="" />

        {/* SLIDER */}
        <div className="relative mt-12 lg:mt-16">
          <Image
            className="absolute top-1 right-full -mr-16 opacity-50 md:opacity-100 lg:mr-3"
            src={qlImage}
            width={50}
            height={44}
            alt=""
          />
          <Image
            className="absolute top-1 left-full -ml-16 opacity-50 md:opacity-100 lg:ml-3"
            src={qrImage}
            width={50}
            height={44}
            alt=""
          />
          <div className={'embla'} ref={emblaRef}>
            <ul className="embla__container">
              {DEMO_DATA.map((item) => (
                <li key={item.id} className="flex embla__slide basis-full flex-col items-center text-center">
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
                  type="button"
                  key={index}
                  onClick={() => onDotButtonClick(index)}
                  className={clsx(
                    index === selectedIndex ? 'bg-neutral-700' : 'bg-neutral-300',
                    'mx-1 size-2 rounded-full focus:outline-none'
                  )}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SectionClientSay
