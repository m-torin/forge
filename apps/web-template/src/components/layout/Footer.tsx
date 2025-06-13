'use client';

import React from 'react';

import Link from 'next/link';
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
  IconBrandYoutube,
} from '@tabler/icons-react';

export interface WidgetFooterMenu {
  id: string;
  menus: Array<{ href: string; label: string }>;
  title: string;
}

const widgetMenus: WidgetFooterMenu[] = [
  {
    id: '5',
    menus: [
      { href: '/', label: 'Release Notes' },
      { href: '/', label: 'Upgrade Guide' },
      { href: '/', label: 'Browser Support' },
      { href: '/', label: 'Dark Mode' },
    ],
    title: 'Getting started',
  },
  {
    id: '1',
    menus: [
      { href: '/', label: 'Prototyping' },
      { href: '/', label: 'Design systems' },
      { href: '/', label: 'Pricing' },
      { href: '/', label: 'Security' },
    ],
    title: 'Explore',
  },
  {
    id: '2',
    menus: [
      { href: '/', label: 'Best practices' },
      { href: '/', label: 'Support' },
      { href: '/', label: 'Developers' },
      { href: '/', label: 'Learn design' },
    ],
    title: 'Resources',
  },
  {
    id: '4',
    menus: [
      { href: '/', label: 'Discussion Forums' },
      { href: '/', label: 'Code of Conduct' },
      { href: '/', label: 'Contributing' },
      { href: '/', label: 'API Reference' },
    ],
    title: 'Community',
  },
];

function Footer() {
  const renderWidgetMenuItem = (menu: WidgetFooterMenu) => {
    return (
      <div key={menu.id} className="text-sm">
        <h2 className="font-semibold text-neutral-700 dark:text-neutral-200">{menu.title}</h2>
        <ul className="mt-5 space-y-4">
          {menu.menus.map((item: any) => (
            <li key={item.label}>
              <Link
                className="text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white"
                href={item.href}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="nc-Footer relative border-t border-neutral-200 py-20 lg: pt-28 lg:pb-24 dark:border-neutral-700">
      <div className="container grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-10">
        <div className="col-span-2 grid grid-cols-4 gap-5 md:col-span-4 lg:flex lg:flex-col lg:md:col-span-1">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl font-semibold">Web Template</h3>
          </div>
          <div className="col-span-2 flex items-center md:col-span-3">
            <div className="flex items-center space-x-2 lg:flex-col lg:items-start lg:space-y-3 lg:space-x-0">
              <a
                href="#"
                className="text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white"
              >
                <IconBrandFacebook size={20} />
              </a>
              <a
                href="#"
                className="text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white"
              >
                <IconBrandTwitter size={20} />
              </a>
              <a
                href="#"
                className="text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white"
              >
                <IconBrandInstagram size={20} />
              </a>
              <a
                href="#"
                className="text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white"
              >
                <IconBrandYoutube size={20} />
              </a>
            </div>
          </div>
        </div>
        {widgetMenus.map(renderWidgetMenuItem)}
      </div>
    </div>
  );
}

export default Footer;
export { Footer };
