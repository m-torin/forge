import rightImg from '@/images/about-hero-right.png';
import ButtonPrimary from '@/shared/Button/ButtonPrimary';
import ButtonSecondary from '@/shared/Button/ButtonSecondary';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { FC, ReactNode } from 'react';

interface Props {
  className?: string;
  heading?: ReactNode;
  subHeading?: string;
  'data-testid'?: string;
}

const SectionHero: FC<Props> = ({
  className = '',
  heading = 'Discover, collect, and sell extraordinary NFTs ',
  subHeading = 'Discover the most outstanding NTFs in all topics of life. Creative your NTFs and sell them',
  'data-testid': testId = 'section-hero',
}) => {
  return (
    <div className={`relative ${className}`} data-testid={testId}>
      <div className="relative flex flex-col space-y-14 lg:flex-row lg:items-center lg:space-x-10 lg:space-y-0">
        <div className="w-screen max-w-full space-y-5 lg:space-y-7 xl:max-w-xl">
          <h2 className="leading-tight! text-3xl font-semibold text-neutral-900 md:text-4xl xl:text-5xl dark:text-neutral-100">
            {heading}
          </h2>
          <span className="block max-w-lg text-base text-neutral-600 xl:text-lg dark:text-neutral-400">
            {subHeading}
          </span>
          <div className="flex space-x-4 pt-7">
            <ButtonPrimary href="/search">
              <span>Explore</span>
              <MagnifyingGlassIcon className="ml-2.5 h-5 w-5" />
            </ButtonPrimary>
            <ButtonSecondary href="/search">
              <span>Create</span>
              <svg className="ml-2.5 h-5 w-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M13.26 3.59997L5.04997 12.29C4.73997 12.62 4.43997 13.27 4.37997 13.72L4.00997 16.96C3.87997 18.13 4.71997 18.93 5.87997 18.73L9.09997 18.18C9.54997 18.1 10.18 17.77 10.49 17.43L18.7 8.73997C20.12 7.23997 20.76 5.52997 18.55 3.43997C16.35 1.36997 14.68 2.09997 13.26 3.59997Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.89 5.05005C12.32 7.81005 14.56 9.92005 17.34 10.2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 22H21"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </ButtonSecondary>
          </div>
        </div>
        <div className="grow">
          <Image
            className="w-full"
            src={rightImg}
            alt=""
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default SectionHero;
