import facebook from '@/images/socials/facebook.svg';
import telegram from '@/images/socials/telegram.svg';
import twitter from '@/images/socials/twitter.svg';
import youtube from '@/images/socials/youtube.svg';
import { type SocialType } from '@/shared/SocialsShare/SocialsShare';
import Image from 'next/image';
import React, { type FC } from 'react';

export interface SocialsList1Props {
  className?: string;
}

const socials: SocialType[] = [
  { name: 'Facebook', href: '#', icon: facebook },
  { name: 'Youtube', href: '#', icon: youtube },
  { name: 'Telegram', href: '#', icon: telegram },
  { name: 'Twitter', href: '#', icon: twitter },
];

const SocialsList1: FC<SocialsList1Props> = ({ className = 'space-y-3' }) => {
  const renderItem = (item: SocialType, index: number) => {
    return (
      <a
        key={index}
        href={item.href}
        className="flex items-center text-2xl text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white leading-none space-x-2 group"
      >
        <div className="shrink-0 w-5 ">
          <Image alt="" sizes="40px" src={item.icon} />
        </div>
        <span className="hidden lg:block text-sm">{item.name}</span>
      </a>
    );
  };

  return (
    <div data-nc-id="SocialsList1" className={`nc-SocialsList1 ${className}`}>
      {socials.map(renderItem)}
    </div>
  );
};

export default SocialsList1;
