import Image from 'next/image';
import { type FC } from 'react';

import facebook from '../../../images/socials/facebook.svg';
import telegram from '../../../images/socials/telegram.svg';
import twitter from '../../../images/socials/twitter.svg';
import youtube from '../../../images/socials/youtube.svg';

export interface SocialsListProps {
  className?: string;
  itemClass?: string;
}

const socialsDemo = [
  { name: 'Facebook', href: '#', icon: facebook },
  { name: 'Twitter', href: '#', icon: twitter },
  { name: 'Youtube', href: '#', icon: youtube },
  { name: 'Telegram', href: '#', icon: telegram },
];

const SocialsList: FC<SocialsListProps> = ({ className = '', itemClass = 'block w-6 h-6' }) => {
  return (
    <nav
      className={`nc-SocialsList flex space-x-2.5 text-2xl text-neutral-600 dark:text-neutral-300 ${className}`}
    >
      {socialsDemo.map((item, i) => (
        <a
          key={i}
          href={item.href}
          className={`${itemClass}`}
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
