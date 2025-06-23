import {
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandInstagram,
  IconBrandLinkedin,
} from '@tabler/icons-react';
import Link from 'next/link';
import clsx from 'clsx';

interface SocialsListProps {
  itemClass?: string;
  'data-testid'?: string;
}

const SocialsList = ({ itemClass, 'data-testid': testId = 'socials-list' }: SocialsListProps) => {
  const socials = [
    {
      name: 'Facebook',
      href: '#',
      icon: IconBrandFacebook,
    },
    {
      name: 'Twitter',
      href: '#',
      icon: IconBrandTwitter,
    },
    {
      name: 'Instagram',
      href: '#',
      icon: IconBrandInstagram,
    },
    {
      name: 'LinkedIn',
      href: '#',
      icon: IconBrandLinkedin,
    },
  ];

  return (
    <div className="flex space-x-2" data-testid={testId}>
      {socials.map((social) => {
        const Icon = social.icon;
        return (
          <Link
            key={social.name}
            className={clsx(
              'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
              itemClass,
            )}
            href={social.href}
          >
            <span className="sr-only">{social.name}</span>
            <Icon size={20} stroke={1.5} />
          </Link>
        );
      })}
    </div>
  );
};

export default SocialsList;
