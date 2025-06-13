'use client';

import clsx from 'clsx';
import Image from 'next/image';
import { type FC } from 'react';

import ButtonPrimary from './shared/Button/ButtonPrimary';
import Logo from './shared/Logo/Logo';

export interface SectionPromo2Props {
  className?: string;
  'data-testid'?: string;
}

const SectionPromo2: FC<SectionPromo2Props> = ({
  className,
  'data-testid': testId = 'section-promo-2',
}) => {
  return (
    <div className={clsx(className, 'xl:pt-10 2xl:pt-24')} data-testid={testId}>
      <div className="relative flex flex-col rounded-2xl bg-yellow-50 p-4 pb-0 sm:rounded-[40px] sm:p-5 sm:pb-0 lg:flex-row lg:justify-end lg:p-14 xl:px-20 xl:py-24 2xl:py-32 dark:bg-neutral-800">
        <div className="relative max-w-lg lg:w-[45%]">
          <Logo className="w-28" />
          <h2 className="mt-6 text-3xl leading-[1.13] font-semibold tracking-tight sm:mt-10 sm:text-4xl xl:text-5xl 2xl:text-6xl">
            Special offer <br />
            in kids products
          </h2>
          <span className="mt-6 block text-neutral-500 dark:text-neutral-400">
            Fashion is a form of self-expression and autonomy at a particular period and place.
          </span>
          <div className="mt-6 flex space-x-2 sm:mt-12 sm:space-x-5">
            <ButtonPrimary className="dark:bg-neutral-200 dark:text-neutral-900" href="/search">
              Discover more
            </ButtonPrimary>
          </div>
        </div>

        <div className="relative mt-10 block max-w-xl lg:absolute lg:bottom-0 lg:left-0 lg:mt-0 lg:max-w-[calc(55%-40px)]">
          <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Promo Image Placeholder</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionPromo2;
