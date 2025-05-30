import { CustomLink } from '@/data/types'
import Logo from '@/shared/Logo/Logo'
import SocialsList1 from '@/shared/SocialsList1/SocialsList1'
import React from 'react'

export interface WidgetFooterMenu {
  id: string
  title: string
  menus: CustomLink[]
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
]

const Footer: React.FC = () => {
  const renderWidgetMenuItem = (menu: WidgetFooterMenu, index: number) => {
    return (
      <div key={index} className="text-sm">
        <h2 className="font-semibold text-neutral-700 dark:text-neutral-200">{menu.title}</h2>
        <ul className="mt-5 space-y-4">
          {menu.menus.map((item, index) => (
            <li key={index}>
              <a
                key={index}
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
    )
  }

  return (
    <div className="nc-Footer relative border-t border-neutral-200 py-20 lg:pt-28 lg:pb-24 dark:border-neutral-700">
      <div className="container grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-10">
        <div className="col-span-2 grid grid-cols-4 gap-5 md:col-span-4 lg:flex lg:flex-col lg:md:col-span-1">
          <div className="col-span-2 md:col-span-1">
            <Logo />
          </div>
          <div className="col-span-2 flex items-center md:col-span-3">
            <SocialsList1 className="flex items-center space-x-2 lg:flex-col lg:items-start lg:space-y-3 lg:space-x-0" />
          </div>
        </div>
        {widgetMenus.map(renderWidgetMenuItem)}
      </div>
    </div>
  )
}

export default Footer
