'use client';

import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { Menu } from '@mantine/core';

import { type TDropdownCategory } from '../../data/types';
import { Link } from '../Link';

interface Props {
  categories: TDropdownCategory[];
  className?: string;
}

export default function CategoriesDropdown({ categories, className }: Props) {
  return (
    <div className={className}>
      <Menu
        width={320}
        offset={16}
        position="bottom-start"
        shadow="lg"
        transitionProps={{ duration: 200, transition: 'pop-top-left' }}
        classNames={{
          dropdown:
            'rounded-2xl border-0 ring-1 ring-black/5 dark:ring-white/10 p-0 overflow-hidden',
          item: 'rounded-none',
        }}
      >
        <Menu.Target>
          <button className="-m-2.5 flex items-center rounded-md p-2.5 text-sm font-medium focus:outline-hidden sm:text-base group">
            <span>Shops</span>
            <ChevronDownIcon
              aria-hidden="true"
              className="ms-2 size-5 text-neutral-700 transition-transform group-data-[expanded]:rotate-180"
            />
          </button>
        </Menu.Target>

        <Menu.Dropdown>
          <div className="relative grid grid-cols-1 gap-4 bg-white p-6 dark:bg-neutral-800">
            {categories.map((item, index) => (
              <Menu.Item
                key={index}
                href={`/collections/${item.handle}` as any}
                component={Link}
                className="!bg-transparent hover:!bg-transparent p-0"
              >
                <div className="flex items-center focus:outline-hidden focus-visible:ring-0">
                  <div
                    dangerouslySetInnerHTML={{ __html: item.icon }}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-500 sm:h-12 sm:w-12"
                  />
                  <div className="ms-4">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-300">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Menu.Item>
            ))}
          </div>
          {/* FOOTER */}
          <div className="bg-neutral-50 p-6 dark:bg-neutral-700">
            <Menu.Item
              href={`/collections/all` as any}
              component={Link}
              className="!bg-transparent hover:!bg-transparent p-0"
            >
              <div>
                <span className="block text-sm font-medium">Go to our shop </span>
                <span className="mt-0.5 block text-sm text-neutral-500 dark:text-neutral-400">
                  Look for what you need and love.
                </span>
              </div>
            </Menu.Item>
          </div>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
}
