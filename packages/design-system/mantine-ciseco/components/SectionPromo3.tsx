import { ArrowRightIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import Image from 'next/image';
import { type FC } from 'react';

import backgroundLineSvg from '../images/BackgroundLine.svg';
import rightImgDemo from '../images/promo3.png';

import Badge from './shared/Badge/Badge';
import ButtonCircle from './shared/Button/ButtonCircle';
import Input from './shared/Input/Input';
import NcImage from './shared/NcImage/NcImage';

export interface SectionPromo3Props {
  className?: string;
  'data-testid'?: string;
}

const SectionPromo3: FC<SectionPromo3Props> = ({
  'data-testid': testId = 'section-promo-3',
  className,
}) => {
  return (
    <div data-testid={testId} className={clsx(className, 'xl:pt-10 2xl:pt-24')}>
      <div className="relative flex flex-col rounded-2xl bg-neutral-50 p-4 pb-0 sm:rounded-[40px] sm:p-5 sm:pb-0 lg:flex-row lg:p-14 xl:px-20 xl:py-24 2xl:py-32 dark:bg-neutral-800">
        <div className="absolute inset-10">
          <Image
            className="absolute h-full w-full object-contain object-bottom dark:opacity-5"
            alt="backgroundLineSvg"
            fill
            src={backgroundLineSvg}
          />
        </div>

        <div className="relative max-w-lg lg:w-1/2">
          <h2 className="text-4xl leading-[1.15] font-semibold md:text-5xl">
            Don&apos;t miss out on <br /> special offers.
          </h2>
          <p className="mt-7 block text-neutral-500 dark:text-neutral-400">
            Register to receive news about the latest, <br /> savings combos, discount codes.
          </p>
          <ul className="mt-10 flex flex-col gap-y-4">
            <li className="flex items-center gap-x-4">
              <Badge color="purple" name="01" />
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Savings combos
              </span>
            </li>
            <li className="flex items-center gap-x-4">
              <Badge name="02" />
              <span className="font-medium text-neutral-700 dark:text-neutral-300">Freeship</span>
            </li>
            <li className="flex items-center gap-x-4">
              <Badge color="red" name="03" />
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Premium magazines
              </span>
            </li>
          </ul>
          <form className="relative mt-10 max-w-sm">
            <Input
              placeholder="Enter your email"
              rounded="rounded-full"
              aria-required
              required
              type="email"
            />
            <ButtonCircle
              className="absolute top-1/2 right-1 -translate-y-1/2 transform"
              type="submit"
            >
              <ArrowRightIcon className="size-4" />
            </ButtonCircle>
          </form>
        </div>

        <NcImage
          containerClassName="relative block lg:absolute lg:right-0 lg:bottom-0 mt-10 lg:mt-0 max-w-lg lg:max-w-[calc(50%-40px)]"
          className=""
          alt="right hero"
          sizes="(max-width: 768px) 100vw, 50vw"
          src={rightImgDemo}
        />
      </div>
    </div>
  );
};

export default SectionPromo3;
