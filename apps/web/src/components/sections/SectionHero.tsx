import Image from 'next/image';
import { type FC, type ReactNode } from 'react';

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
            <a
              href={exploreHref}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Explore
            </a>
            <a
              href={createHref}
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-colors gap-2 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Browse
            </a>
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
