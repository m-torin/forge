'use client';

import { Button } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import clsx from 'clsx';
import Image from 'next/image';
import { type FC, useEffect, useState } from 'react';

// Demo data - replace with your own images
const heroData = [
  {
    id: 1,
    btnHref: '/collections',
    btnText: 'Shop Now',
    heading: 'Exclusive collection<br />for everyone',
    imageUrl: '/hero-right-1.png',
    subHeading: 'In this season, find the best 🔥',
  },
  {
    id: 2,
    btnHref: '/collections',
    btnText: 'Shop Now',
    heading: 'New arrivals<br />just landed',
    imageUrl: '/hero-right-2.png',
    subHeading: 'Fresh styles, trending now ✨',
  },
  {
    id: 3,
    btnHref: '/collections',
    btnText: 'Shop Now',
    heading: 'Limited edition<br />drops',
    imageUrl: '/hero-right-3.png',
    subHeading: 'Get them before they\'re gone ⚡',
  },
];

export interface SectionHero2Props {
  className?: string;
  data?: typeof heroData;
  autoSlide?: boolean;
  slideInterval?: number;
}

const SectionHero2: FC<SectionHero2Props> = ({ 
  className = '', 
  data = heroData,
  autoSlide = true,
  slideInterval = 5000
}) => {
  const [indexActive, setIndexActive] = useState(0);

  useEffect(() => {
    if (!autoSlide) return;

    const interval = setInterval(() => {
      setIndexActive((prev) => (prev + 1) % data.length);
    }, slideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, slideInterval, data.length]);

  const renderItem = (index: number) => {
    const isActive = indexActive === index;
    const item = data[index];

    return (
      <div
        key={index}
        className={clsx(
          'relative flex flex-col gap-10 overflow-hidden py-14 sm:min-h-[calc(100vh-5rem)] lg:flex-row lg:items-center transition-opacity duration-500',
          isActive ? 'opacity-100' : 'opacity-0 absolute inset-0'
        )}
      >
        {/* Background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-green-50 to-blue-50 dark:from-neutral-900 dark:to-neutral-800" />

        {/* Content */}
        <div className="container mx-auto px-4 flex flex-col lg:flex-row lg:items-center gap-10">
          <div className="flex-1 relative flex flex-col items-start">
            <span className="block text-base font-medium text-neutral-700 md:text-xl dark:text-neutral-300">
              {item.subHeading}
            </span>
            <h2
              dangerouslySetInnerHTML={{ __html: item.heading }}
              className="mt-5 text-4xl font-semibold text-neutral-900 sm:mt-6 md:text-5xl xl:text-6xl xl:leading-[1.2] 2xl:text-7xl dark:text-neutral-100"
            />

            <Button
              component="a"
              href={item.btnHref}
              size="xl"
              className="mt-10 sm:mt-20"
              leftSection={<IconSearch size={20} />}
            >
              {item.btnText}
            </Button>
          </div>

          <div className="flex-1 relative">
            <Image
              width={790}
              height={790}
              priority={isActive}
              className="select-none object-contain w-full h-auto"
              alt={item.heading}
              sizes="(max-width: 768px) 100vw, 50vw"
              src={item.imageUrl}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {data.map((_, index) => renderItem(index))}

        {/* Dots Navigation */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 justify-center space-x-2">
          {data.map((_, index) => {
            const isActive = indexActive === index;
            return (
              <button
                key={index}
                onClick={() => setIndexActive(index)}
                className="relative px-1 py-1.5 group"
                aria-label={`Go to slide ${index + 1}`}
              >
                <div className="relative h-1 w-20 rounded-md bg-white/50 shadow-sm">
                  {isActive && (
                    <div className="absolute inset-0 rounded-md bg-neutral-900 dark:bg-white transition-all duration-300" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SectionHero2;