import HIW1img from '@/images/HIW1img.png';
import HIW2img from '@/images/HIW2img.png';
import HIW3img from '@/images/HIW3img.png';
import HIW4img from '@/images/HIW4img.png';
import VectorImg from '@/images/VectorHIW.svg';
import Badge from '@/shared/Badge/Badge';
import NcImage from '@/shared/NcImage/NcImage';
import Image from 'next/image';
import { type FC } from 'react';

export interface SectionHowItWorkProps {
  className?: string;
  data?: (typeof DEMO_DATA)[0][];
}

const DEMO_DATA = [
  {
    id: 1,
    desc: 'Smart filtering and suggestions make it easy to find',
    img: HIW1img,
    imgDark: HIW1img,
    title: 'Filter & Discover',
  },
  {
    id: 2,
    desc: 'Easily select the correct items and add them to the cart',
    img: HIW2img,
    imgDark: HIW2img,
    title: 'Add to bag',
  },
  {
    id: 3,
    desc: 'The carrier will confirm and ship quickly to you',
    img: HIW3img,
    imgDark: HIW3img,
    title: 'Fast shipping',
  },
  {
    id: 4,
    desc: 'Have fun and enjoy your 5-star quality products',
    img: HIW4img,
    imgDark: HIW4img,
    title: 'Enjoy the product',
  },
];

const SectionHowItWork: FC<SectionHowItWorkProps> = ({ className = '', data = DEMO_DATA }) => {
  return (
    <div className={`nc-SectionHowItWork ${className}`}>
      <div className="relative grid gap-10 sm:grid-cols-2 sm:gap-16 lg:grid-cols-4 xl:gap-20">
        <Image className="absolute inset-x-0 top-5 hidden md:block" alt="vector" src={VectorImg} />
        {data.map((item, index) => (
          <div key={item.id} className="relative mx-auto flex max-w-xs flex-col items-center gap-2">
            <NcImage
              containerClassName="mb-4 sm:mb-10 max-w-[140px] mx-auto"
              className="rounded-3xl"
              alt="HIW"
              sizes="150px"
              src={item.img}
            />
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
  );
};

export default SectionHowItWork;
