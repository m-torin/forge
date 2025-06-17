import backgroundLineSvg from '@/images/BackgroundLine.svg'
import heroImage from '@/images/hero-right-4.png'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { FC } from 'react'

export interface SectionHero3Props {
  className?: string
}

const SectionHero3: FC<SectionHero3Props> = ({ className = '' }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#F7F0EA] ${className}`}>
      <div className="relative inset-x-0 top-1/10 z-1 px-8 pt-8 sm:top-1/5 lg:absolute lg:pt-0">
        <div className="flex max-w-lg flex-col items-start gap-y-5 xl:max-w-2xl xl:gap-y-8">
          <span className="font-semibold text-neutral-600 sm:text-lg md:text-xl">In this season, find the best 🔥</span>
          <h2 className="text-3xl leading-[1.15] font-bold text-neutral-950 sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl">
            Sports equipment collection.
          </h2>
          <div className="sm:pt-5">
            <ButtonPrimary sizeClass="px-6 py-3 lg:px-8 lg:py-4" fontSize="text-sm sm:text-base">
              Start your search
              <HugeiconsIcon icon={Search01Icon} size={24} color="currentColor" className="ms-4" strokeWidth={1.5} />
            </ButtonPrimary>
          </div>
        </div>
      </div>

      <div className="relative lg:aspect-w-16 lg:aspect-h-8 2xl:aspect-h-7">
        <div>
          <div className="end-0 top-0 bottom-0 mt-5 ml-auto w-full max-w-md sm:max-w-xl lg:absolute lg:mt-0 lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl">
            <Image
              sizes="(max-width: 768px) 100vw, 50vw"
              className="inset-0 w-full object-contain object-bottom-right sm:h-full lg:absolute"
              src={heroImage}
              width={heroImage.width}
              height={heroImage.height}
              alt="hero"
              priority
            />
          </div>
        </div>
      </div>

      {/* BG */}
      <div className="absolute inset-10">
        <Image
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain"
          src={backgroundLineSvg}
          alt="hero"
        />
      </div>
    </div>
  )
}

export default SectionHero3
