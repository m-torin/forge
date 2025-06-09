import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { type FC } from 'react'

import backgroundLineSvg from '../../images/BackgroundLine.svg'
import heroImage from '../../images/hero-right-4.png'
import ButtonPrimary from '../shared/Button/ButtonPrimary'

export interface SectionHero3Props {
  className?: string
}

const SectionHero3: FC<SectionHero3Props> = ({ className = '' }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#F7F0EA] ${className}`}>
      <div className="top-1/10 z-1 sm:top-1/5 relative inset-x-0 px-8 pt-8 lg:absolute lg:pt-0">
        <div className="flex max-w-lg flex-col items-start gap-y-5 xl:max-w-2xl xl:gap-y-8">
          <span className="font-semibold text-neutral-600 sm:text-lg md:text-xl">In this season, find the best 🔥</span>
          <h2 className="text-3xl font-bold leading-[1.15] text-neutral-950 sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl">
            Sports equipment collection.
          </h2>
          <div className="sm:pt-5">
            <ButtonPrimary fontSize="text-sm sm:text-base" sizeClass="px-6 py-3 lg:px-8 lg:py-4">
              Start your search
              <HugeiconsIcon strokeWidth={1.5} color="currentColor" icon={Search01Icon} className="ms-4" size={24} />
            </ButtonPrimary>
          </div>
        </div>
      </div>

      <div className="relative lg:aspect-[16/8] 2xl:aspect-[16/7]">
        <div>
          <div className="bottom-0 end-0 top-0 ml-auto mt-5 w-full max-w-md sm:max-w-xl lg:absolute lg:mt-0 lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl">
            <Image
              width={800}
              priority
              className="object-bottom-right inset-0 w-full object-contain sm:h-full lg:absolute"
              alt="hero"
              height={600}
              sizes="(max-width: 768px) 100vw, 50vw"
              src={heroImage}
            />
          </div>
        </div>
      </div>

      {/* BG */}
      <div className="absolute inset-10">
        <Image
          className="object-contain"
          alt="hero"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          src={backgroundLineSvg}
        />
      </div>
    </div>
  )
}

export default SectionHero3
