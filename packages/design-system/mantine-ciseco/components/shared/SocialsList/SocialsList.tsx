import Image from 'next/image';
import { type FC } from 'react';

import facebook from '../../../images/socials/facebook.svg';
import telegram from '../../../images/socials/telegram.svg';
import twitter from '../../../images/socials/twitter.svg';
import youtube from '../../../images/socials/youtube.svg';

export interface SocialsListProps extends Record<string, any> {
  className?: string;
  itemClass?: string;
}

const socialsDemo = [
  { href: '#', icon: facebook, name: 'Facebook' },
  { href: '#', icon: twitter, name: 'Twitter' },
  { href: '#', icon: youtube, name: 'Youtube' },
  { href: '#', icon: telegram, name: 'Telegram' },
];

const SocialsList: FC<SocialsListProps> = ({
  className = '',
  itemClass = 'block w-6 h-6',
}: any) => {
  return (
    <nav
      className={`nc-SocialsList flex space-x-2.5 text-2xl text-neutral-600 dark:text-neutral-300 ${className}`}
    >
      {socialsDemo.map((item: any) => (
        <a
          key={item.name}
          className={`${itemClass}`}
          href={item.href}
          rel="noopener noreferrer"
          target="_blank"
          title={item.name}
        >
          <Image alt="" sizes="40px" src={item.icon} />
        </a>
      ))}
    </nav>
  );
};

export default SocialsList;
