import facebook from '@/images/socials/facebook.svg';
import telegram from '@/images/socials/telegram.svg';
import twitter from '@/images/socials/twitter.svg';
import youtube from '@/images/socials/youtube.svg';
import clsx from 'clsx';
import Image from 'next/image';
import { FC } from 'react';
import { Link } from '../link';

interface SocialsListProps {
  className?: string;
  itemClass?: string;
}

const socialsDemo = [
  { name: 'Facebook', icon: facebook, href: '#' },
  { name: 'Twitter', icon: twitter, href: '#' },
  { name: 'Youtube', icon: youtube, href: '#' },
  { name: 'Telegram', icon: telegram, href: '#' },
];

const SocialsList: FC<SocialsListProps> = ({ className = '', itemClass = 'w-6 h-6' }) => {
  return (
    <nav
      className={`flex items-center gap-x-4 gap-y-2 text-2xl text-neutral-600 dark:text-neutral-300 ${className}`}
    >
      <ul role="list" data-testid="social-links" className="flex gap-x-4 gap-y-2">
        {socialsDemo.map(item => (
          <li key={item.name} className="list-none">
            <Link
              className={clsx(itemClass, 'relative block')}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              title={item.name}
              aria-label={item.name}
              data-testid={`social-link-${item.name.toLowerCase()}`}
            >
              <Image fill sizes="40px" src={item.icon} alt={item.name} />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SocialsList;
