import facebook from '@/images/socials/facebook.svg';
import telegram from '@/images/socials/telegram.svg';
import twitter from '@/images/socials/twitter.svg';
import youtube from '@/images/socials/youtube.svg';
import clsx from 'clsx';
import Image from 'next/image';
import { FC } from 'react';
import { Link } from '../link';

interface SocialsList1Props {
  className?: string;
}

const socials = [
  { name: 'Facebook', icon: facebook, href: '#' },
  { name: 'Youtube', icon: youtube, href: '#' },
  { name: 'Telegram', icon: telegram, href: '#' },
  { name: 'Twitter', icon: twitter, href: '#' },
];

const SocialsList1: FC<SocialsList1Props> = ({ className }) => {
  return (
    <div className={clsx('flex flex-col gap-y-3', className)}>
      {socials.map(item => (
        <Link
          target="_blank"
          href={item.href}
          className="flex items-center gap-x-2 text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white"
          key={item.name}
        >
          <Image
            sizes="40px"
            className="h-auto w-5 shrink-0"
            width={40}
            height={40}
            src={item.icon}
            alt={item.name}
          />
          <span className="text-sm/6">{item.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default SocialsList1;
