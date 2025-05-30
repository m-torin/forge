import { type FC } from 'react';

export interface SocialsShareProps {
  className?: string;
  itemClass?: string;
}

export interface SocialType {
  href: string;
  icon: string;
  name: string;
}

const socials: SocialType[] = [
  { name: 'Facebook', href: '#', icon: 'lab la-facebook-f' },
  { name: 'Twitter', href: '#', icon: 'lab la-twitter' },
  { name: 'Linkedin', href: '#', icon: 'lab la-linkedin-in' },
  { name: 'Instagram', href: '#', icon: 'lab la-instagram' },
];

const SocialsShare: FC<SocialsShareProps> = ({
  className = 'grid gap-[6px]',
  itemClass = 'w-7 h-7 text-base hover:bg-neutral-100',
}) => {
  const renderItem = (item: SocialType, index: number) => {
    return (
      <a
        key={index}
        href={item.href}
        className={`flex items-center justify-center rounded-full bg-white leading-none text-neutral-600 ${itemClass}`}
        title={`Share on ${item.name}`}
      >
        <i className={item.icon} />
      </a>
    );
  };

  return (
    <div data-nc-id="SocialsShare" className={`nc-SocialsShare ${className}`}>
      {socials.map(renderItem)}
    </div>
  );
};

export default SocialsShare;
