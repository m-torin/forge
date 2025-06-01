import Image, { type StaticImageData } from 'next/image';
import { type FC, type ReactNode } from 'react';

import { ButtonPrimary } from '@repo/design-system/ciesco2';

export interface SectionHeroProps {
  btnText?: string;
  className?: string;
  heading: ReactNode;
  rightImg: string | StaticImageData;
  subHeading: string;
}

const SectionHero: FC<SectionHeroProps> = ({
  btnText,
  className = '',
  heading,
  rightImg,
  subHeading,
}) => {
  return (
    <div className={`nc-SectionHero relative ${className}`}>
      <div className="relative flex flex-col items-center gap-y-14 text-center lg:flex-row lg:gap-x-20 lg:gap-y-0 lg:text-left">
        <div className="flex flex-1 flex-col gap-y-5 lg:gap-y-7">
          <h2 className="text-3xl leading-tight font-semibold text-neutral-900 md:text-4xl xl:text-5xl dark:text-neutral-100">
            {heading}
          </h2>
          <p className="block max-w-xl text-base text-neutral-600 dark:text-neutral-400">
            {subHeading}
          </p>
          {btnText && <ButtonPrimary href="/login">{btnText}</ButtonPrimary>}
        </div>

        <div className="flex-1">
          <Image priority className="w-full" alt="" src={rightImg} />
        </div>
      </div>
    </div>
  );
};

export default SectionHero;
