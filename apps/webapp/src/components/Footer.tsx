import Logo from '@/components/Logo';
import { CustomLink } from '@/data/types';
import SocialsList1 from '@/shared/SocialsList1/SocialsList1';
import React from 'react';

interface WidgetFooterMenu {
  id: string;
  title: string;
  menus: CustomLink[];
}

const widgetMenus: WidgetFooterMenu[] = [
  {
    id: '5',
    title: 'Getting started',
    menus: [
      { href: '/', label: 'Release Notes' },
      { href: '/', label: 'Upgrade Guide' },
      { href: '/', label: 'Browser Support' },
      { href: '/', label: 'Dark Mode' },
    ],
  },
  {
    id: '1',
    title: 'Explore',
    menus: [
      { href: '/', label: 'Prototyping' },
      { href: '/', label: 'Design systems' },
      { href: '/', label: 'Pricing' },
      { href: '/', label: 'Security' },
    ],
  },
  {
    id: '2',
    title: 'Resources',
    menus: [
      { href: '/', label: 'Best practices' },
      { href: '/', label: 'Support' },
      { href: '/', label: 'Developers' },
      { href: '/', label: 'Learn design' },
    ],
  },
  {
    id: '4',
    title: 'Community',
    menus: [
      { href: '/', label: 'Discussion Forums' },
      { href: '/', label: 'Code of Conduct' },
      { href: '/', label: 'Contributing' },
      { href: '/', label: 'API Reference' },
    ],
  },
];

interface Props {
  'data-testid'?: string;
}

const Footer: React.FC<Props> = ({ 'data-testid': testId = 'footer' } = {}) => {
  const renderWidgetMenuItem = (menu: WidgetFooterMenu, index: number) => {
    return (
      <div key={`footer-widget-${menu.id}-${index}`} className="text-sm">
        <h2 className="font-semibold text-neutral-700 dark:text-neutral-200">{menu.title}</h2>
        <ul className="mt-5 space-y-4">
          {menu.menus.map((item, _index) => (
            <li key={`footer-menu-${item.label}`}>
              <a
                key={`footer-link-${item.label}`}
                className="text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="relative border-t py-20 lg:pb-24 lg:pt-28" data-testid={testId}>
      <div className="container grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-10">
        <div className="col-span-2 grid grid-cols-4 gap-5 md:col-span-4 lg:md:col-span-1 lg:flex lg:flex-col">
          <div className="col-span-2 md:col-span-1">
            <Logo />
          </div>
          <div className="col-span-2 flex items-center md:col-span-3">
            <SocialsList1 />
          </div>
        </div>
        {widgetMenus.map(renderWidgetMenuItem)}
      </div>
    </div>
  );
};

export default Footer;
