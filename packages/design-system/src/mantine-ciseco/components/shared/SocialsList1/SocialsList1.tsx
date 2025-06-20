import Image from 'next/image';
import React, { type FC } from 'react';

import facebook from '../../../images/socials/facebook.svg';
import telegram from '../../../images/socials/telegram.svg';
import twitter from '../../../images/socials/twitter.svg';
import youtube from '../../../images/socials/youtube.svg';
import { type SocialType } from '../SocialsShare/SocialsShare';

export interface SocialsList1Props extends Record<string, any> {
  className?: string;
}

const socials: SocialType[] = [
  { href: '#', icon: facebook, name: 'Facebook' },
  { href: '#', icon: youtube, name: 'Youtube' },
  { href: '#', icon: telegram, name: 'Telegram' },
  { href: '#', icon: twitter, name: 'Twitter' },
];

const SocialsList1: FC<SocialsList1Props> = ({ className = 'space-y-3' }: any) => {
  const renderItem = (item: SocialType, index: number) => {
    return (
      <a
        key={index}
        className="flex items-center text-2xl text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white leading-none space-x-2 group"
        href={item.href}
      >
        <div className="shrink-0 w-5 ">
          <Image alt="" sizes="40px" src={item.icon} />
        </div>
        <span className="hidden lg:block text-sm">{item.name}</span>
      </a>
    );
  };

  return (
    <div className={`nc-SocialsList1 ${className}`} data-nc-id="SocialsList1">
      {socials.map(renderItem)}
    </div>
  );
};

export default SocialsList1;
