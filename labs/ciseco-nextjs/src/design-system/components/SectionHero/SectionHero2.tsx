'use client'

import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import Image from 'next/image'
import { type FC, useEffect, useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { useInterval } from 'react-use'

import heroImage1 from '../../images/hero-right-1.png'
import heroImage2 from '../../images/hero-right-2.png'
import heroImage3 from '../../images/hero-right-3.png'
import backgroundLineSvg from '../../images/Moon.svg'
import ButtonPrimary from '../shared/Button/ButtonPrimary'

// DEMO DATA
const data = [
  {
    id: 1,
    btnHref: '/collections/all',
    btnText: 'Explore shop now',
    heading: 'Exclusive collection <br /> for everyone',
    imageUrl: heroImage1,
    subHeading: 'In this season, find the best 🔥',
  },
  {
    id: 2,
    btnHref: '/collections/all',
    btnText: 'Explore shop now',
    heading: 'Exclusive collection <br /> for everyone',
    imageUrl: heroImage2,
    subHeading: 'In this season, find the best 🔥',
  },
  {
    id: 3,
    btnHref: '/collections/all',
    btnText: 'Explore shop now',
    heading: 'Exclusive collection <br /> for everyone',
    imageUrl: heroImage3,
    subHeading: 'In this season, find the best 🔥',
  },
]

export interface SectionHero2Props {
  className?: string
}

let TIME_OUT: NodeJS.Timeout | null = null
const SectionHero2: FC<SectionHero2Props> = ({ className = '' }) => {
  // =================

  const [isSlided, setIsSlided] = useState(false)
  const [indexActive, setIndexActive] = useState(0)
  const [isRunning, toggleIsRunning] = useState(true)

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      handleClickNext()
    },
    onSwipedRight: () => {
      handleClickPrev()
    },
    trackMouse: true,
  })

  useEffect(() => {
    if (isSlided || !indexActive) {
      return
    }
    setIsSlided(true)
  }, [indexActive, isSlided])

  useInterval(
    () => {
      handleAutoNext()
    },
    isRunning ? 5000 : 999999
  )

  const handleAutoNext = () => {
    setIndexActive((state) => {
      if (state >= data.length - 1) {
        return 0
      }
      return state + 1
    })
  }

  const handleClickNext = () => {
    setIndexActive((state) => {
      if (state >= data.length - 1) {
        return 0
      }
      return state + 1
    })
    handleAfterClick()
  }

  const handleClickPrev = () => {
    setIndexActive((state) => {
      if (state === 0) {
        return data.length - 1
      }
      return state - 1
    })
    handleAfterClick()
  }

  const handleAfterClick = () => {
    toggleIsRunning(false)
    if (TIME_OUT) {
      clearTimeout(TIME_OUT)
    }
    TIME_OUT = setTimeout(() => {
      toggleIsRunning(true)
    }, 1000)
  }

  // ===================================================

  const renderItem = (index: number) => {
    const isActive = indexActive === index
    const item = data[index]

    return (
      <div
        key={index}
        className={clsx(
          'fade--animation pl-container relative flex flex-col gap-10 overflow-hidden py-14 sm:min-h-[calc(100vh-5rem)] lg:flex-row lg:items-center',
          isActive ? 'flex' : 'hidden'
        )}
      >
        {/* BG */}
        <div className="absolute inset-0 -z-10 bg-[#E3FFE6]">
          <Image
            className="absolute h-full w-full object-contain"
            alt="hero"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            src={backgroundLineSvg}
          />
        </div>

        {/* DOTS */}
        <div className="absolute bottom-4 start-1/2 flex -translate-x-1/2 justify-center rtl:translate-x-1/2">
          {data.map((_, index) => {
            const isActive = indexActive === index
            return (
              <div
                key={index}
                onClick={() => {
                  setIndexActive(index)
                  handleAfterClick()
                }}
                className="relative cursor-pointer px-1 py-1.5"
              >
                <div className="shadow-xs relative h-1 w-20 rounded-md bg-white">
                  {isActive && <div className="fade--animation__dot absolute inset-0 rounded-md bg-neutral-900" />}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex-1/2 fade--animation__left relative flex flex-col items-start">
          <span className="fade--animation__subheading block text-base font-medium text-neutral-700 md:text-xl">
            {item.subHeading}
          </span>
          <h2
            dangerouslySetInnerHTML={{ __html: item.heading }}
            className="fade--animation__heading mt-5 text-4xl font-semibold text-neutral-900 sm:mt-6 md:text-5xl xl:text-6xl xl:leading-[1.2] 2xl:text-7xl"
          />

          <ButtonPrimary
            href={item.btnHref || '#'}
            className="fade--animation__button mt-10 sm:mt-20 dark:bg-neutral-900 dark:text-white"
            sizeClass="py-3 px-6 sm:py-5 sm:px-9 "
          >
            <span>{item.btnText}</span>
            <HugeiconsIcon strokeWidth={1.5} color="currentColor" icon={Search01Icon} className="ms-2.5" size={20} />
          </ButtonPrimary>
        </div>

        <div className="flex-1/2 relative -z-10 lg:pr-10">
          <Image
            width={790}
            priority
            className="fade--animation__image select-none object-contain"
            alt={item.heading}
            height={790}
            sizes="(max-width: 768px) 100vw, 50vw"
            src={item.imageUrl}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={clsx('relative z-[1]', className)} {...handlers}>
      {data.map((_, index) => renderItem(index))}

      <button
        onClick={handleClickNext}
        className="absolute inset-y-px end-0 z-10 hidden items-center justify-center px-10 text-neutral-700 lg:flex"
        type="button"
      >
        <svg
          strokeWidth={0.6}
          stroke="currentColor"
          viewBox="0 0 24 24"
          className="h-12 w-12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>
      <button
        onClick={handleClickPrev}
        className="absolute inset-y-px start-0 z-10 hidden items-center justify-center px-10 text-neutral-700 lg:flex"
        type="button"
      >
        <svg
          strokeWidth={0.6}
          stroke="currentColor"
          viewBox="0 0 24 24"
          className="h-12 w-12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>
    </div>
  )
}

export default SectionHero2
