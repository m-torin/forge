'use client';

import { getHeaderDropdownCategories } from '@/data/navigation';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { Link } from '../Link';

interface Props {
  className?: string;
  categories: Awaited<ReturnType<typeof getHeaderDropdownCategories>>;
  'data-testid'?: string;
}

export default function CategoriesDropdown({
  className,
  categories,
  'data-testid': testId = 'categories-dropdown',
}: Props) {
  return (
    <div className={className} data-testid={testId}>
      <Popover className="group">
        <PopoverButton className="focus:outline-hidden -m-2.5 flex items-center rounded-md p-2.5 text-sm font-medium sm:text-base">
          <span>Shops</span>
          <ChevronDownIcon
            className="group-data-open:-rotate-180 ms-2 size-5 text-neutral-700"
            aria-hidden="true"
          />
        </PopoverButton>

        <PopoverPanel
          anchor="bottom start"
          transition
          className="data-closed:translate-y-1 data-closed:opacity-0 z-10 mt-4 w-80 rounded-2xl shadow-lg ring-1 ring-black/5 transition duration-200 ease-in-out sm:px-0 dark:ring-white/10"
        >
          <div className="relative grid grid-cols-1 gap-4 bg-white p-6 dark:bg-neutral-800">
            {categories.map((item, _index) => (
              <Link
                key={`category-${item.handle}`}
                href={'/collections/' + item.handle}
                className="focus:outline-hidden flex items-center focus-visible:ring-0"
              >
                <div
                  dangerouslySetInnerHTML={{ __html: item.icon }}
                  className="bg-primary-500/5 text-primary-500 dark:text-primary-200 flex h-10 w-10 shrink-0 items-center justify-center rounded-md sm:h-12 sm:w-12"
                />
                <div className="ms-4">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-300">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          {/* FOOTER */}
          <div className="bg-neutral-50 p-6 dark:bg-neutral-700">
            <Link href="/collections/all">
              <span className="block text-sm font-medium">Go to our shop </span>
              <span className="mt-0.5 block text-sm text-neutral-500 dark:text-neutral-400">
                Look for what you need and love.
              </span>
            </Link>
          </div>
        </PopoverPanel>
      </Popover>
    </div>
  );
}
