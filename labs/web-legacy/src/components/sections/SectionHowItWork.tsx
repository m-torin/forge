import Image from 'next/image';
import { type FC } from 'react';

import HIW1img from '@repo/design-system/mantine-ciseco/images/HIW1img.png';
import HIW2img from '@repo/design-system/mantine-ciseco/images/HIW2img.png';
import HIW3img from '@repo/design-system/mantine-ciseco/images/HIW3img.png';
import HIW4img from '@repo/design-system/mantine-ciseco/images/HIW4img.png';
import VectorImg from '@repo/design-system/mantine-ciseco/images/VectorHIW.svg';
import Badge from '@/components/ui/Badge';

export interface SectionHowItWorkProps {
  className?: string;
  data?: (typeof DEMO_DATA)[0][];
  heading?: string;
  subHeading?: string;
  'data-testid'?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for SectionHowItWork (Tailwind-only)
function SectionHowItWorkSkeleton({
  className,
  heading,
  subHeading,
  testId,
}: {
  className?: string;
  heading?: string;
  subHeading?: string;
  testId?: string;
}) {
  return (
    <div className={`nc-SectionHowItWork ${className}`} data-testid={testId}>
      <div className="container mx-auto mb-12 px-4 lg:mb-16">
        <div className="text-center">
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3 mx-auto mb-4" />
          {subHeading && (
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2 mx-auto" />
          )}
        </div>
      </div>
      <div className="container mx-auto px-4">
        <div className="relative grid gap-10 sm:grid-cols-2 sm:gap-16 lg:grid-cols-4 xl:gap-20">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="relative mx-auto flex max-w-xs flex-col items-center gap-2">
              <div className="mb-4 sm:mb-10 max-w-[140px] mx-auto">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse" />
              </div>
              <div className="mt-auto text-center">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-16 mx-auto mb-4" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24 mx-auto mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full mb-1" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Error state for SectionHowItWork (Tailwind-only)
function SectionHowItWorkError({
  error,
  className,
  heading,
  subHeading,
  testId,
}: {
  error: string;
  className?: string;
  heading?: string;
  subHeading?: string;
  testId?: string;
}) {
  return (
    <div className={`nc-SectionHowItWork ${className}`} data-testid={testId}>
      <div className="container mx-auto mb-12 px-4 lg:mb-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
            {heading}
          </h2>
          {subHeading && (
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">{subHeading}</p>
          )}
        </div>
      </div>
      <div className="container mx-auto px-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
          <svg
            className="w-12 h-12 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
            Failed to load steps
          </h3>
          <p className="text-red-500 dark:text-red-400">
            How it works section could not be loaded.
          </p>
        </div>
      </div>
    </div>
  );
}

// Zero state for SectionHowItWork (Tailwind-only)
function SectionHowItWorkEmpty({
  className,
  heading,
  subHeading,
  testId,
}: {
  className?: string;
  heading?: string;
  subHeading?: string;
  testId?: string;
}) {
  return (
    <div className={`nc-SectionHowItWork ${className}`} data-testid={testId}>
      <div className="container mx-auto mb-12 px-4 lg:mb-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
            {heading}
          </h2>
          {subHeading && (
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">{subHeading}</p>
          )}
        </div>
      </div>
      <div className="container mx-auto px-4">
        <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-2">
            No steps available
          </h3>
          <p className="text-gray-400 dark:text-gray-500">
            Process steps will appear here when they become available.
          </p>
        </div>
      </div>
    </div>
  );
}

const DEMO_DATA = [
  {
    id: 1,
    desc: 'Smart filtering and suggestions make it easy to find',
    img: HIW1img,
    title: 'Filter & Discover',
  },
  {
    id: 2,
    desc: 'Easily select the correct items and add them to the cart',
    img: HIW2img,
    title: 'Add to bag',
  },
  {
    id: 3,
    desc: 'The carrier will confirm and ship quickly to you',
    img: HIW3img,
    title: 'Fast shipping',
  },
  {
    id: 4,
    desc: 'Have fun and enjoy your 5-star quality products',
    img: HIW4img,
    title: 'Enjoy the product',
  },
];

const SectionHowItWork: FC<SectionHowItWorkProps> = ({
  className = '',
  data = DEMO_DATA,
  heading = 'How it works',
  subHeading = 'Keep calm & travel on',
  'data-testid': testId = 'section-how-it-work',
  loading = false,
  error,
}) => {
  // Show loading state
  if (loading) {
    return (
      <SectionHowItWorkSkeleton
        className={className}
        heading={heading}
        subHeading={subHeading}
        testId={testId}
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <SectionHowItWorkError
        error={error}
        className={className}
        heading={heading}
        subHeading={subHeading}
        testId={testId}
      />
    );
  }

  // Show zero state when no data
  if (!data || data.length === 0) {
    return (
      <SectionHowItWorkEmpty
        className={className}
        heading={heading}
        subHeading={subHeading}
        testId={testId}
      />
    );
  }
  return (
    <div className={`nc-SectionHowItWork ${className}`} data-testid={testId}>
      {/* Heading */}
      <div className="container mx-auto mb-12 px-4 lg:mb-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
            {heading}
          </h2>
          {subHeading && (
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">{subHeading}</p>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="container mx-auto px-4">
        <div className="relative grid gap-10 sm:grid-cols-2 sm:gap-16 lg:grid-cols-4 xl:gap-20">
          <Image
            className="absolute inset-x-0 top-5 hidden md:block"
            alt="vector"
            src={VectorImg}
          />
          {data.map((item, index) => (
            <div
              key={item.id}
              className="relative mx-auto flex max-w-xs flex-col items-center gap-2"
            >
              <div className="mb-4 sm:mb-10 max-w-[140px] mx-auto">
                <Image
                  className="rounded-3xl w-full h-auto"
                  alt={item.title}
                  src={item.img}
                  sizes="150px"
                />
              </div>
              <div className="mt-auto text-center">
                <Badge
                  color={
                    !index ? 'red' : index === 1 ? 'indigo' : index === 2 ? 'yellow' : 'purple'
                  }
                  name={`Step ${index + 1}`}
                />
                <h3 className="mt-5 text-base font-semibold">{item.title}</h3>
                <span className="mt-4 block text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                  {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionHowItWork;
