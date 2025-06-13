import { IconSearch, IconEdit } from '@tabler/icons-react';
import Image from 'next/image';
import { type FC, type ReactNode } from 'react';

import { Button } from '@mantine/core';

export interface SectionHeroProps {
  className?: string;
  heading?: ReactNode;
  subHeading?: string;
  exploreHref?: string;
  createHref?: string;
  heroImage?: string;
}

const SectionHero: FC<SectionHeroProps> = ({
  className = '',
  heading = 'Discover, collect, and sell extraordinary products',
  subHeading = 'Discover the most outstanding products in all categories. Find what you love and make it yours.',
  exploreHref = '/search',
  createHref = '/products',
  heroImage = '/hero-right-1.png',
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="relative flex flex-col space-y-14 lg:flex-row lg:items-center lg:space-x-10 lg:space-y-0">
        <div className="w-screen max-w-full space-y-5 lg:space-y-7 xl:max-w-xl">
          <h2 className="!leading-tight text-3xl font-semibold text-neutral-900 md:text-4xl xl:text-5xl dark:text-neutral-100">
            {heading}
          </h2>
          <span className="block max-w-lg text-base text-neutral-600 xl:text-lg dark:text-neutral-400">
            {subHeading}
          </span>
          <div className="flex space-x-4 pt-7">
            <Button
              component="a"
              href={exploreHref}
              size="lg"
              leftSection={<IconSearch size={20} />}
            >
              Explore
            </Button>
            <Button
              component="a"
              href={createHref}
              size="lg"
              variant="light"
              leftSection={<IconEdit size={20} />}
            >
              Browse
            </Button>
          </div>
        </div>
        <div className="grow">
          {heroImage && (
            <Image 
              priority 
              className="w-full" 
              alt="Hero illustration" 
              width={600}
              height={500}
              sizes="(max-width: 768px) 100vw, 50vw" 
              src={heroImage} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionHero;