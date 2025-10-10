'use client';

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { ArrangeByLettersAZIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import clsx from 'clsx';
import { FC, Fragment, useState } from 'react';

const sortByOptions = [
  { name: 'Newest', value: 'newest' },
  { name: 'Oldest', value: 'oldest' },
  { name: 'Price: low to high', value: 'price-low-to-high' },
  { name: 'Price: high to low', value: 'price-high-to-low' },
  { name: 'A to Z', value: 'a-to-z' },
  { name: 'Z to A', value: 'z-to-a' },
];

type Props = {
  className?: string;
  filterOptions?: { name: string; value: string }[];
};

export const FilterSortByMenuListBox: FC<Props> = ({
  className,
  filterOptions = sortByOptions,
}) => {
  const [selectedOption, setSelectedOption] = useState(filterOptions[0].value);

  return (
    <div className={clsx('product-sort-by-list-box flex shrink-0', className)}>
      <Listbox value={selectedOption} onChange={setSelectedOption}>
        <div className="relative">
          <ListboxButton
            className={clsx(
              'group-data-open:ring-2 group-data-open:ring-black focus:outline-hidden dark:group-data-open:ring-white flex select-none items-center justify-center rounded-full px-4 py-2.5 text-sm ring-inset hover:bg-neutral-50 dark:hover:bg-neutral-900',
              'ring-1 ring-neutral-300 dark:ring-neutral-700',
            )}
          >
            <HugeiconsIcon icon={ArrangeByLettersAZIcon} size={18} />
            <span className="ms-2">
              {filterOptions.find(item => item.value === selectedOption)?.name}
            </span>
            <ChevronDownIcon className="ml-3 size-4" aria-hidden="true" />
          </ListboxButton>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions className="focus:outline-hidden absolute right-0 z-50 mt-2 max-h-60 w-52 overflow-auto rounded-xl bg-white py-1 text-sm text-neutral-900 shadow-lg ring-1 ring-black/5 dark:bg-neutral-900 dark:text-neutral-200 dark:ring-neutral-700">
              {filterOptions.map(item => (
                <ListboxOption
                  key={item.value}
                  className={({ focus: active }) =>
                    clsx(
                      'relative flex cursor-default select-none py-2 pe-4 ps-10',
                      active &&
                        'bg-primary-50 text-primary-700 dark:bg-neutral-700 dark:text-neutral-200',
                    )
                  }
                  value={item.value}
                >
                  {({ selected }) => (
                    <>
                      <span className={clsx('block truncate', selected && 'font-medium')}>
                        {item.name}
                      </span>
                      {selected ? (
                        <span className="text-primary-700 absolute inset-y-0 start-0 flex items-center ps-3 dark:text-neutral-200">
                          <CheckIcon className="size-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};
