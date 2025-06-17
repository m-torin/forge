'use client';

import { TextInput } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import clsx from 'clsx';
import Image from 'next/image';
import { type FC } from 'react';

import backgroundLineSvg from '@repo/design-system/mantine-ciseco/images/BackgroundLine.svg';
import rightImgDemo from '@repo/design-system/mantine-ciseco/images/promo3.png';
import Badge from '@/components/ui/Badge';
import ButtonCircle from '@/components/ui/ButtonCircle';

export interface SectionPromo3Props {
  className?: string;
  heading?: string;
  subHeading?: string;
}

const SectionPromo3: FC<SectionPromo3Props> = ({
  className,
  heading = "Don't miss out on special offers.",
  subHeading = 'Register to receive news about the latest, savings combos, discount codes.',
}) => {
  return (
    <div className={clsx(className, 'xl:pt-10 2xl:pt-24')}>
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
          <h2 className="text-4xl font-semibold leading-[1.15] md:text-5xl">{heading}</h2>
          <p className="mt-7 block text-neutral-500 dark:text-neutral-400">{subHeading}</p>
          <ul className="mt-10 flex flex-col gap-y-4">
            <li className="flex items-center gap-x-4">
              <Badge color="purple" name="01" />
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Savings combos
              </span>
            </li>
            <li className="flex items-center gap-x-4">
              <Badge color="blue" name="02" />
              <span className="font-medium text-neutral-700 dark:text-neutral-300">Freeship</span>
            </li>
            <li className="flex items-center gap-x-4">
              <Badge color="red" name="03" />
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Premium magazines
              </span>
            </li>
          </ul>

          {/* Email signup form */}
          <form className="relative mt-10 max-w-sm">
            <TextInput
              placeholder="Enter your email"
              type="email"
              required
              radius="xl"
              rightSection={
                <ButtonCircle type="submit" size="sm">
                  <IconArrowRight size={16} />
                </ButtonCircle>
              }
              rightSectionWidth={42}
              className="pr-12"
            />
          </form>
        </div>

        <div className="relative block lg:absolute lg:right-0 lg:bottom-0 mt-10 lg:mt-0 max-w-lg lg:max-w-[calc(50%-40px)]">
          <Image
            className="w-full h-auto"
            alt="Special offers"
            sizes="(max-width: 768px) 100vw, 50vw"
            src={rightImgDemo}
          />
        </div>
      </div>
    </div>
  );
};

export default SectionPromo3;
