import { type FC } from 'react';

export interface SocialsShareProps extends Record<string, any> {
  className?: string;
  itemClass?: string;
}

export interface SocialType {
  href: string;
  icon: string;
  name: string;
}

const socials: SocialType[] = [
  { href: '#', icon: 'lab la-facebook-f', name: 'Facebook' },
  { href: '#', icon: 'lab la-twitter', name: 'Twitter' },
  { href: '#', icon: 'lab la-linkedin-in', name: 'Linkedin' },
  { href: '#', icon: 'lab la-instagram', name: 'Instagram' },
];

const SocialsShare: FC<SocialsShareProps> = ({
  className = 'grid gap-[6px]',
  itemClass = 'w-7 h-7 text-base hover:bg-neutral-100',
}) => {
  const renderItem = (item: SocialType, index: number) => {
    return (
      <a
        key={index}
        className={`flex items-center justify-center rounded-full bg-white leading-none text-neutral-600 ${itemClass}`}
        href={item.href}
        title={`Share on ${item.name}`}
      >
        <i className={item.icon} />
      </a>
    );
  };

  return (
    <div className={`nc-SocialsShare ${className}`} data-nc-id="SocialsShare">
      {socials.map(renderItem)}
    </div>
  );
};

export default SocialsShare;
