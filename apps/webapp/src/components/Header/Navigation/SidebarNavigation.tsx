'use client';

import { Divider } from '@/components/Divider';
import { TNavigationItem } from '@/data/navigation';
import ButtonPrimary from '@/shared/Button/ButtonPrimary';
import SocialsList from '@/shared/SocialsList/SocialsList';
import { Link } from '@/shared/link';
import { Disclosure, DisclosureButton, DisclosurePanel, useClose } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import clsx from 'clsx';
import { redirect } from 'next/navigation';
import React from 'react';

interface SidebarNavigationProps {
  data: TNavigationItem[];
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ data }) => {
  const handleClose = useClose();

  const renderMenuChild = (
    item: TNavigationItem,
    itemClass = 'pl-3 text-neutral-900 dark:text-neutral-200 font-medium',
  ) => {
    return (
      <ul className="nav-mobile-sub-menu pb-1 pl-6 text-base">
        {item.children?.map(childMenu => (
          <Disclosure key={`sidebar-child-${childMenu.id}`} as="li">
            <Link
              href={childMenu.href || '#'}
              className={`mt-0.5 flex rounded-lg pr-4 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 ${itemClass}`}
            >
              <span className={`py-2.5 ${!childMenu.children ? 'block w-full' : ''}`}>
                {childMenu.name}
              </span>
              {childMenu.children && (
                <span
                  className="flex grow items-center"
                  onClick={e => e.preventDefault()}
                  role="button"
                  tabIndex={0}
                  aria-label="Expand submenu"
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                    }
                  }}
                >
                  <DisclosureButton as="span" className="flex grow justify-end">
                    <ChevronDownIcon className="ml-2 h-4 w-4 text-neutral-500" aria-hidden="true" />
                  </DisclosureButton>
                </span>
              )}
            </Link>
            {childMenu.children && (
              <DisclosurePanel>
                {renderMenuChild(childMenu, 'pl-3 text-neutral-600 dark:text-neutral-400')}
              </DisclosurePanel>
            )}
          </Disclosure>
        ))}
      </ul>
    );
  };

  const renderItem = (menu: TNavigationItem, index: number) => {
    return (
      <Disclosure
        key={`sidebar-menu-${menu.name}-${index}`}
        as="li"
        className="text-neutral-900 dark:text-white"
      >
        <DisclosureButton className="flex w-full cursor-pointer rounded-lg px-3 text-start text-sm font-medium uppercase tracking-wide hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <Link
            href={menu.href || '#'}
            className={clsx(!menu.children?.length && 'flex-1', 'block py-2.5')}
            onClick={handleClose}
          >
            {menu.name}
          </Link>
          {menu.children?.length && (
            <div className="flex flex-1 justify-end">
              <ChevronDownIcon
                className="ml-2 h-4 w-4 self-center text-neutral-500"
                aria-hidden="true"
              />
            </div>
          )}
        </DisclosureButton>
        {menu.children && <DisclosurePanel>{renderMenuChild(menu)}</DisclosurePanel>}
      </Disclosure>
    );
  };

  const renderSearchForm = () => {
    return (
      <form
        action="#"
        method="POST"
        className="flex-1 text-neutral-900 dark:text-neutral-200"
        onSubmit={e => {
          e.preventDefault();
          handleClose();
          redirect('/search');
        }}
      >
        <div className="flex h-full items-center gap-x-2.5 rounded-xl bg-neutral-50 px-3 py-3 dark:bg-neutral-800">
          <HugeiconsIcon icon={Search01Icon} size={24} color="currentColor" strokeWidth={1.5} />
          <input
            type="search"
            placeholder="Type and press enter"
            className="focus:outline-hidden w-full border-none bg-transparent text-sm focus:ring-0"
          />
        </div>
        <input type="submit" hidden value="" />
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
        <SocialsList />
      </div>
      <div className="mt-5">{renderSearchForm()}</div>
      <ul className="flex flex-col gap-y-1 px-2 py-6">{data?.map(renderItem)}</ul>
      <Divider className="mb-6" />

      {/* FOR OUR DEMO */}
      <ButtonPrimary
        href="https://themeforest.net/item/ecommerce-nextjs-template/44210635"
        target="_blank"
        rel="noopener noreferrer"
        className="px-8!"
      >
        Buy this template
      </ButtonPrimary>
    </div>
  );
};

export default SidebarNavigation;
