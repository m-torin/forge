'use client';

import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Accordion } from '@mantine/core';
import { useRouter } from 'next/navigation';
import React from 'react';

import { type TNavigationItem } from '../../../data/types';
import { Divider } from '../../Divider';
import { Link } from '../../Link';
import ButtonPrimary from '../../shared/Button/ButtonPrimary';
import SocialsList from '../../shared/SocialsList/SocialsList';

export interface SidebarNavigationProps extends Record<string, any> {
  data: TNavigationItem[];
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ data }: any) => {
  const router = useRouter();
  const handleClose = () => {
    // This would typically close the sidebar, but since we don't have access to the aside context,
    // we'll just handle navigation
  };

  const _renderMenuChild = (
    item: TNavigationItem,
    itemClass = 'pl-3 text-neutral-900 dark:text-neutral-200 font-medium',
    level = 0,
  ) => {
    if (!item.children?.length) return null;

    return (
      <Accordion
        chevron={<ChevronDownIcon className="h-4 w-4" />}
        classNames={{
          chevron: 'ml-2 h-4 w-4 text-neutral-500',
          content: 'p-0',
          control: `mt-0.5 flex rounded-lg pr-4 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 ${itemClass} p-0`,
          item: 'border-0 bg-transparent',
          root: 'nav-mobile-sub-menu pb-1 pl-6 text-base',
        }}
        variant="light"
      >
        {item.children.map((childMenu, index: any) => {
          const hasChildren = childMenu.children && childMenu.children.length > 0;

          if (!hasChildren) {
            return (
              <Link
                key={childMenu.name}
                className={`mt-0.5 flex rounded-lg pr-4 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 ${itemClass} py-2.5`}
                href={`${childMenu.href ?? '#'}` as any}
                onClick={handleClose}
              >
                {childMenu.name}
              </Link>
            );
          }

          return (
            <Accordion.Item key={childMenu.name} value={`${level}-${index}`}>
              <Accordion.Control>
                <span className="py-2.5">{childMenu.name}</span>
              </Accordion.Control>
              <Accordion.Panel>
                {_renderMenuChild(
                  childMenu,
                  'pl-3 text-neutral-600 dark:text-neutral-400',
                  level + 1,
                )}
              </Accordion.Panel>
            </Accordion.Item>
          );
        })}
      </Accordion>
    );
  };

  const _renderItem = (menu: TNavigationItem, index: number) => {
    const hasChildren = menu.children && menu.children.length > 0;

    if (!hasChildren) {
      return (
        <li key={index} className="text-neutral-900 dark:text-white">
          <Link
            className="flex w-full cursor-pointer rounded-lg px-3 py-2.5 text-start text-sm font-medium tracking-wide uppercase hover:bg-neutral-100 dark:hover:bg-neutral-800"
            href={`${menu.href ?? '#'}` as any}
            onClick={handleClose}
          >
            {menu.name}
          </Link>
        </li>
      );
    }

    return (
      <Accordion.Item key={index} value={`main-${index}`}>
        <Accordion.Control className="flex w-full cursor-pointer rounded-lg px-3 text-start text-sm font-medium tracking-wide uppercase hover:bg-neutral-100 dark:hover:bg-neutral-800">
          {menu.name}
        </Accordion.Control>
        <Accordion.Panel>{_renderMenuChild(menu)}</Accordion.Panel>
      </Accordion.Item>
    );
  };

  const renderSearchForm = () => {
    return (
      <form
        action="#"
        className="flex-1 text-neutral-900 dark:text-neutral-200"
        method="POST"
        onSubmit={(e: any) => {
          e.preventDefault();
          handleClose();
          router.push('/search');
        }}
      >
        <div className="flex h-full items-center gap-x-2.5 rounded-xl bg-neutral-50 px-3 py-3 dark:bg-neutral-800">
          <HugeiconsIcon color="currentColor" icon={Search01Icon} size={24} strokeWidth={1.5} />
          <input
            className="w-full border-none bg-transparent text-sm focus:ring-0 focus:outline-hidden"
            placeholder="Type and press enter"
            type="search"
          />
        </div>
        <input hidden type="submit" value="" />
      </form>
    );
  };

  return (
    <div>
      <span>
        Discover the most outstanding articles on all topics of life. Write your stories and share
        them
      </span>

      <div className="mt-4 flex items-center justify-between">
        <SocialsList itemClass="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xl" />
      </div>
      <div className="mt-5">{renderSearchForm()}</div>
      <Accordion
        chevron={<ChevronDownIcon className="h-4 w-4" />}
        classNames={{
          chevron: 'ml-2 h-4 w-4 self-center text-neutral-500',
          content: 'p-0',
          control: 'hover:bg-transparent p-0',
          item: 'border-0 bg-transparent text-neutral-900 dark:text-white',
          root: 'flex flex-col gap-y-1 px-2 py-6',
        }}
        variant="light"
      >
        {data.map(_renderItem)}
      </Accordion>
      <Divider className="mb-6" />

      {/* FOR OUR DEMO */}
      <ButtonPrimary
        className="px-8!"
        href="https://themeforest.net/item/ciseco-shop-ecommerce-nextjs-template/44210635"
        targetBlank
      >
        Buy this template
      </ButtonPrimary>
    </div>
  );
};

export default SidebarNavigation;
