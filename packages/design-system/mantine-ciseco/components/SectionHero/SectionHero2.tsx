'use client';

import { Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useDocumentVisibility, useInterval } from '@mantine/hooks';
import clsx from 'clsx';
import Image from 'next/image';
import { type FC, useEffect, useState } from 'react';
import { useSwipeable } from 'react-swipeable';

import heroImage1 from '../../images/hero-right-1.png';
import heroImage2 from '../../images/hero-right-2.png';
import heroImage3 from '../../images/hero-right-3.png';
import backgroundLineSvg from '../../images/Moon.svg';
import ButtonPrimary from '../shared/Button/ButtonPrimary';

// DEMO DATA
const data = [
  {
    btnHref: '/collections/all',
    btnText: 'Explore shop now',
    heading: 'Exclusive collection <br /> for everyone',
    id: 1,
    imageUrl: heroImage1,
    subHeading: 'In this season, find the best 🔥',
  },
  {
    btnHref: '/collections/all',
    btnText: 'Explore shop now',
    heading: 'Exclusive collection <br /> for everyone',
    id: 2,
    imageUrl: heroImage2,
    subHeading: 'In this season, find the best 🔥',
  },
  {
    btnHref: '/collections/all',
    btnText: 'Explore shop now',
    heading: 'Exclusive collection <br /> for everyone',
    id: 3,
    imageUrl: heroImage3,
    subHeading: 'In this season, find the best 🔥',
  },
];

export interface SectionHero2Props extends Record<string, any> {
  className?: string;
}

let TIME_OUT: NodeJS.Timeout | null = null;
const SectionHero2: FC<SectionHero2Props> = ({ className = '' }) => {
  // =================

  const [isSlided, setIsSlided] = useState(false);
  const [indexActive, setIndexActive] = useState(0);
  const [isRunning, toggleIsRunning] = useState(true);

  // ✅ Use Mantine's useDocumentVisibility for better performance
  const documentVisibility = useDocumentVisibility();

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      handleClickNext();
    },
    onSwipedRight: () => {
      handleClickPrev();
    },
    trackMouse: true,
  });

  useEffect(() => {
    if (isSlided || !indexActive) {
      return;
    }
    setIsSlided(true);
  }, [indexActive, isSlided]);

  // ✅ Use Mantine's useInterval with document visibility check
  const intervalDelay = isRunning && documentVisibility === 'visible' ? 5000 : 999999; // Large number instead of null

  useInterval(() => {
    handleAutoNext();
  }, intervalDelay);

  const handleAutoNext = () => {
    setIndexActive((state) => {
      if (state >= data.length - 1) {
        return 0;
      }
      return state + 1;
    });
  };

  const handleClickNext = () => {
    setIndexActive((state) => {
      if (state >= data.length - 1) {
        return 0;
      }
      return state + 1;
    });
    handleAfterClick();
  };

  const handleClickPrev = () => {
    setIndexActive((state) => {
      if (state === 0) {
        return data.length - 1;
      }
      return state - 1;
    });
    handleAfterClick();
  };

  const handleAfterClick = () => {
    toggleIsRunning(false);
    if (TIME_OUT) {
      clearTimeout(TIME_OUT);
    }
    TIME_OUT = setTimeout(() => {
      toggleIsRunning(true);
    }, 1000);
  };

  // ===================================================

  const renderItem = (index: number) => {
    const isActive = indexActive === index;
    const item = data[index];

    // Item is guaranteed to exist for valid indices

    return (
      <div
        key={index}
        className={clsx(
          'fade--animation relative flex flex-col gap-10 overflow-hidden py-14 pl-container sm:min-h-[calc(100vh-5rem)] lg:flex-row lg:items-center',
          isActive ? 'flex' : 'hidden',
        )}
      >
        {/* BG */}
        <div className="absolute inset-0 -z-10 bg-[#E3FFE6]">
          <Image
            alt="hero"
            className="absolute h-full w-full object-contain"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            src={backgroundLineSvg}
          />
        </div>

        {/* DOTS */}
        <div className="absolute start-1/2 bottom-4 flex -translate-x-1/2 justify-center rtl:translate-x-1/2">
          {data.map((item, index) => {
            const isActive = indexActive === index;
            return (
              <button
                key={item.id}
                aria-label={`Go to slide ${index + 1}`}
                className="relative cursor-pointer px-1 py-1.5"
                type="button"
                onClick={() => {
                  setIndexActive(index);
                  handleAfterClick();
                }}
              >
                <div className="relative h-1 w-20 rounded-md bg-white shadow-xs">
                  {isActive && (
                    <div className="absolute inset-0 rounded-md bg-neutral-900 fade--animation__dot" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="relative flex flex-1/2 flex-col items-start fade--animation__left">
          <span className="block text-base font-medium text-neutral-700 fade--animation__subheading md:text-xl">
            {item.subHeading}
          </span>
          <h2
            className="mt-5 text-4xl font-semibold text-neutral-900 fade--animation__heading sm:mt-6 md:text-5xl xl:text-6xl xl:leading-[1.2] 2xl:text-7xl"
            dangerouslySetInnerHTML={{ __html: item.heading }}
          />

          <ButtonPrimary
            className="mt-10 fade--animation__button sm:mt-20 dark:bg-neutral-900 dark:text-white"
            href={item.btnHref || '#'}
            sizeClass="py-3 px-6 sm:py-5 sm:px-9 "
          >
            <span>{item.btnText}</span>
            <HugeiconsIcon
              className="ms-2.5"
              color="currentColor"
              icon={Search01Icon}
              size={20}
              strokeWidth={1.5}
            />
          </ButtonPrimary>
        </div>

        <div className="relative -z-10 flex-1/2 lg:pr-10">
          <Image
            alt={item.heading}
            className="object-contain fade--animation__image select-none"
            height={790}
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            src={item.imageUrl}
            width={790}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={clsx('relative z-[1]', className)} {...handlers}>
      {data.map((_, index) => renderItem(index))}

      <button
        className="absolute inset-y-px end-0 z-10 hidden items-center justify-center px-10 text-neutral-700 lg:flex"
        type="button"
        onClick={handleClickNext}
      >
        <svg
          className="h-12 w-12"
          fill="none"
          stroke="currentColor"
          strokeWidth={0.6}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="m8.25 4.5 7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        className="absolute inset-y-px start-0 z-10 hidden items-center justify-center px-10 text-neutral-700 lg:flex"
        type="button"
        onClick={handleClickPrev}
      >
        <svg
          className="h-12 w-12"
          fill="none"
          stroke="currentColor"
          strokeWidth={0.6}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M15.75 19.5 8.25 12l7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};

export default SectionHero2;
