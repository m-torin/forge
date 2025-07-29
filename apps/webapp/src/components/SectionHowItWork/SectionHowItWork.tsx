import HIW1img from '@/images/HIW1img.png';
import HIW2img from '@/images/HIW2img.png';
import HIW3img from '@/images/HIW3img.png';
import HIW4img from '@/images/HIW4img.png';
import VectorImg from '@/images/VectorHIW.svg';
import { Badge } from '@/shared/badge';
import NcImage from '@/shared/NcImage/NcImage';
import Image from 'next/image';
import { FC } from 'react';

export interface SectionHowItWorkProps {
  className?: string;
  data?: (typeof DEMO_DATA)[0][];
}

const DEMO_DATA = [
  {
    id: 1,
    img: HIW1img,
    imgDark: HIW1img,
    title: 'Filter & Discover',
    desc: 'Smart filtering and suggestions make it easy to find',
  },
  {
    id: 2,
    img: HIW2img,
    imgDark: HIW2img,
    title: 'Add to bag',
    desc: 'Easily select the correct items and add them to the cart',
  },
  {
    id: 3,
    img: HIW3img,
    imgDark: HIW3img,
    title: 'Fast shipping',
    desc: 'The carrier will confirm and ship quickly to you',
  },
  {
    id: 4,
    img: HIW4img,
    imgDark: HIW4img,
    title: 'Enjoy the product',
    desc: 'Have fun and enjoy your 5-star quality products',
  },
];

const SectionHowItWork: FC<SectionHowItWorkProps> = ({ className = '', data = DEMO_DATA }) => {
  return (
    <div className={`nc-SectionHowItWork ${className}`} data-testid="section-how-it-work">
      <div className="relative grid gap-10 sm:grid-cols-2 sm:gap-16 lg:grid-cols-4 xl:gap-20">
        <Image className="absolute inset-x-0 top-5 hidden md:block" src={VectorImg} alt="vector" />
        {data.map((item, index) => (
          <div key={item.id} className="relative mx-auto flex max-w-xs flex-col items-center gap-2">
            <NcImage
              containerClassName="mb-4 sm:mb-10 max-w-[140px] mx-auto"
              className="rounded-3xl"
              src={item.img}
              sizes="150px"
              alt="HIW"
            />
            <div className="mt-auto text-center">
              <Badge
                color={!index ? 'red' : index === 1 ? 'indigo' : index === 2 ? 'yellow' : 'purple'}
              >{`Step ${index + 1}`}</Badge>
              <h3 className="mt-5 text-base font-semibold">{item.title}</h3>
              <span className="mt-4 block text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionHowItWork;
