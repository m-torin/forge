import rightLargeImgDark from '@/images/promo1-dark.png'
import rightImgDemo from '@/images/promo1.png'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonSecondary from '@/shared/Button/ButtonSecondary'
import Logo from '@/shared/Logo/Logo'
import NcImage from '@/shared/NcImage/NcImage'
import { FC } from 'react'

export interface SectionPromo1Props {
  className?: string
}

const SectionPromo1: FC<SectionPromo1Props> = ({ className = '' }) => {
  return (
    <div className={`relative flex flex-col items-center lg:flex-row ${className}`}>
      <div className="relative mb-16 shrink-0 lg:mr-10 lg:mb-0 lg:w-2/5">
        <Logo className="w-28" />
        <h2 className="mt-6 text-3xl leading-[1.2]! font-semibold tracking-tight sm:mt-10 sm:text-4xl xl:text-5xl 2xl:text-6xl">
          Earn free money <br /> with Ciseco.
        </h2>
        <span className="mt-6 block text-neutral-500 dark:text-neutral-400">
          With Ciseco you will get freeship & savings combo.
        </span>
        <div className="mt-6 flex space-x-2 sm:mt-12 sm:space-x-5">
          <ButtonPrimary href="/collection" className="">
            Savings combo
          </ButtonPrimary>
          <ButtonSecondary href="/search" className="border border-neutral-100 dark:border-neutral-700">
            Discover more
          </ButtonSecondary>
        </div>
      </div>
      <div className="relative max-w-xl flex-1 lg:max-w-none">
        <NcImage
          alt=""
          containerClassName="block dark:hidden"
          src={rightImgDemo}
          sizes="(max-width: 768px) 100vw, 50vw"
          className=""
        />
        <NcImage
          alt=""
          containerClassName="hidden dark:block"
          src={rightLargeImgDark}
          sizes="(max-width: 768px) 100vw, 50vw"
          className=""
        />
      </div>
    </div>
  )
}

export default SectionPromo1
