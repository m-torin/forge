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
  subHeading = 'Keep calm & travel on'
}) => {
  return (
    <div className={`nc-SectionHowItWork ${className}`}>
      {/* Heading */}
      <div className="container mx-auto mb-12 px-4 lg:mb-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
            {heading}
          </h2>
          {subHeading && (
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">
              {subHeading}
            </p>
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
            <div key={item.id} className="relative mx-auto flex max-w-xs flex-col items-center gap-2">
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
                  color={!index ? 'red' : index === 1 ? 'indigo' : index === 2 ? 'yellow' : 'purple'}
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