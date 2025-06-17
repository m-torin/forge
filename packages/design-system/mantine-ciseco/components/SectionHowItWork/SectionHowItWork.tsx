import Image from 'next/image';
import { type FC } from 'react';

import HIW1img from '../../images/HIW1img.png';
import HIW2img from '../../images/HIW2img.png';
import HIW3img from '../../images/HIW3img.png';
import HIW4img from '../../images/HIW4img.png';
import VectorImg from '../../images/VectorHIW.svg';
import Badge from '../shared/Badge/Badge';
import NcImage from '../shared/NcImage/NcImage';

export interface SectionHowItWorkProps extends Record<string, any> {
  className?: string;
  data?: (typeof DEMO_DATA)[0][];
}

const DEMO_DATA: {
  desc: string;
  id: number;
  img: any;
  imgDark: any;
  title: string;
}[] = [
  {
    desc: 'Smart filtering and suggestions make it easy to find',
    id: 1,
    img: HIW1img,
    imgDark: HIW1img,
    title: 'Filter & Discover',
  },
  {
    desc: 'Easily select the correct items and add them to the cart',
    id: 2,
    img: HIW2img,
    imgDark: HIW2img,
    title: 'Add to bag',
  },
  {
    desc: 'The carrier will confirm and ship quickly to you',
    id: 3,
    img: HIW3img,
    imgDark: HIW3img,
    title: 'Fast shipping',
  },
  {
    desc: 'Have fun and enjoy your 5-star quality products',
    id: 4,
    img: HIW4img,
    imgDark: HIW4img,
    title: 'Enjoy the product',
  },
];

const SectionHowItWork: FC<SectionHowItWorkProps> = ({ className = '', data = DEMO_DATA }) => {
  return (
    <div className={`nc-SectionHowItWork ${className}`}>
      <div className="relative grid gap-10 sm:grid-cols-2 sm:gap-16 lg:grid-cols-4 xl:gap-20">
        <Image alt="vector" className="absolute inset-x-0 top-5 hidden md:block" src={VectorImg} />
        {data.map((item: any, index: number) => (
          <div key={item.id} className="relative mx-auto flex max-w-xs flex-col items-center gap-2">
            <NcImage
              alt="HIW"
              className="rounded-3xl"
              containerClassName="mb-4 sm:mb-10 max-w-[140px] mx-auto"
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
