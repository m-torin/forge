'use client';

import { Disclosure, DisclosureButton, DisclosurePanel, useClose } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import clsx from 'clsx';
import { redirect } from 'next/navigation';
import React from 'react';

import { type TNavigationItem } from '../../../data/navigation';
import { Divider } from '../../Divider';
import { Link } from '../../Link';
import ButtonPrimary from '../../shared/Button/ButtonPrimary';
import SocialsList from '../../shared/SocialsList/SocialsList';

export interface SidebarNavigationProps {
  data: TNavigationItem[];
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ data }) => {
  const handleClose = useClose();

  const _renderMenuChild = (
    item: TNavigationItem,
    itemClass = 'pl-3 text-neutral-900 dark:text-neutral-200 font-medium',
  ) => {
    return (
      <ul className="nav-mobile-sub-menu pb-1 pl-6 text-base">
        {item.children?.map((childMenu, index) => (
          <Disclosure key={index} as="li">
            <Link
              href={`${childMenu.href || '#'}` as any}
              onClick={handleClose}
              className={`mt-0.5 flex rounded-lg pr-4 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 ${itemClass}`}
            >
              <span className={`py-2.5 ${!childMenu.children ? 'block w-full' : ''}`}>
                {childMenu.name}
              </span>
              {childMenu.children && (
                <span onClick={(e) => e.preventDefault()} className="flex grow items-center">
                  <DisclosureButton className="flex grow justify-end" as="span">
                    <ChevronDownIcon aria-hidden="true" className="ml-2 h-4 w-4 text-neutral-500" />
                  </DisclosureButton>
                </span>
              )}
            </Link>
            {childMenu.children && (
              <DisclosurePanel>
                {_renderMenuChild(childMenu, 'pl-3 text-neutral-600 dark:text-neutral-400')}
              </DisclosurePanel>
            )}
          </Disclosure>
        ))}
      </ul>
    );
  };

  const _renderItem = (menu: TNavigationItem, index: number) => {
    return (
      <Disclosure key={index} className="text-neutral-900 dark:text-white" as="li">
        <DisclosureButton className="flex w-full cursor-pointer rounded-lg px-3 text-start text-sm font-medium tracking-wide uppercase hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <Link
            href={`${menu.href || '#'}` as any}
            onClick={handleClose}
            className={clsx(!menu.children?.length && 'flex-1', 'block py-2.5')}
          >
            {menu.name}
          </Link>
          {menu.children?.length && (
            <div className="flex flex-1 justify-end">
              <ChevronDownIcon
                aria-hidden="true"
                className="ml-2 h-4 w-4 self-center text-neutral-500"
              />
            </div>
          )}
        </DisclosureButton>
        {menu.children && <DisclosurePanel>{_renderMenuChild(menu)}</DisclosurePanel>}
      </Disclosure>
    );
  };

  const renderSearchForm = () => {
    return (
      <form
        action="#"
        method="POST"
        onSubmit={(e) => {
          e.preventDefault();
          handleClose();
          redirect('/search');
        }}
        className="flex-1 text-neutral-900 dark:text-neutral-200"
      >
        <div className="flex h-full items-center gap-x-2.5 rounded-xl bg-neutral-50 px-3 py-3 dark:bg-neutral-800">
          <HugeiconsIcon strokeWidth={1.5} color="currentColor" icon={Search01Icon} size={24} />
          <input
            placeholder="Type and press enter"
            className="w-full border-none bg-transparent text-sm focus:ring-0 focus:outline-hidden"
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
      <ul className="flex flex-col gap-y-1 px-2 py-6">{data?.map(_renderItem)}</ul>
      <Divider className="mb-6" />

      {/* FOR OUR DEMO */}
      <ButtonPrimary
        href="https://themeforest.net/item/ciseco-shop-ecommerce-nextjs-template/44210635"
        className="px-8!"
        targetBlank
      >
        Buy this template
      </ButtonPrimary>
    </div>
  );
};

export default SidebarNavigation;
