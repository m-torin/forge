import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import Image, { StaticImageData } from 'next/image'
import { FC, ReactNode } from 'react'

export interface SectionHeroProps {
  className?: string
  rightImg: string | StaticImageData
  heading: ReactNode
  subHeading: string
  btnText?: string
}

const SectionHero: FC<SectionHeroProps> = ({ className = '', rightImg, heading, subHeading, btnText }) => {
  return (
    <div className={`nc-SectionHero relative ${className}`}>
      <div className="relative flex flex-col items-center gap-y-14 text-center lg:flex-row lg:gap-x-20 lg:gap-y-0 lg:text-left">
        <div className="flex flex-1 flex-col gap-y-5 lg:gap-y-7">
          <h2 className="text-3xl leading-tight font-semibold text-neutral-900 md:text-4xl xl:text-5xl dark:text-neutral-100">
            {heading}
          </h2>
          <p className="block max-w-xl text-base text-neutral-600 dark:text-neutral-400">{subHeading}</p>
          {btnText && <ButtonPrimary href="/login">{btnText}</ButtonPrimary>}
        </div>

        <div className="flex-1">
          <Image className="w-full" src={rightImg} alt="" priority />
        </div>
      </div>
    </div>
  )
}

export default SectionHero
