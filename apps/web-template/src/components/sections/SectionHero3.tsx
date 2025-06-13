import { Button } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import Image from 'next/image';
import { type FC } from 'react';

export interface SectionHero3Props {
  className?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonHref?: string;
  heroImage?: string;
  backgroundImage?: string;
  backgroundColor?: string;
}

const SectionHero3: FC<SectionHero3Props> = ({ 
  className = '',
  title = 'Sports equipment collection.',
  subtitle = 'In this season, find the best 🔥',
  buttonText = 'Start your search',
  buttonHref = '/search',
  heroImage = '/hero-right-4.png',
  backgroundImage = '/background-line.svg',
  backgroundColor = 'bg-orange-50'
}) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${backgroundColor} ${className}`}>
      <div className="relative inset-x-0 px-8 pt-8 lg:absolute lg:top-1/5 lg:pt-0 z-10">
        <div className="flex max-w-lg flex-col items-start gap-y-5 xl:max-w-2xl xl:gap-y-8">
          <span className="font-semibold text-neutral-600 sm:text-lg md:text-xl">
            {subtitle}
          </span>
          <h2 className="text-3xl font-bold leading-[1.15] text-neutral-950 sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl">
            {title}
          </h2>
          <div className="sm:pt-5">
            <Button
              component="a"
              href={buttonHref}
              size="lg"
              leftSection={<IconSearch size={24} />}
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </div>

      <div className="relative lg:aspect-[16/8] 2xl:aspect-[16/7]">
        <div>
          <div className="bottom-0 end-0 top-0 ml-auto mt-5 w-full max-w-md sm:max-w-xl lg:absolute lg:mt-0 lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl">
            <Image
              width={800}
              height={600}
              priority
              className="object-bottom-right inset-0 w-full object-contain sm:h-full lg:absolute"
              alt="hero"
              sizes="(max-width: 768px) 100vw, 50vw"
              src={heroImage}
            />
          </div>
        </div>
      </div>

      {/* Background decoration */}
      {backgroundImage && (
        <div className="absolute inset-10 -z-10">
          <Image
            className="object-contain opacity-10"
            alt="background decoration"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            src={backgroundImage}
          />
        </div>
      )}
    </div>
  );
};

export default SectionHero3;