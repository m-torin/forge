'use client';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/solid';
import { type FC, Fragment, useState } from 'react';

import ButtonDropdown from './ButtonDropdown';

export interface ArchiveFilterListBoxProps {
  className?: string;
}

const lists = [
  { name: 'Most Recent' },
  { name: 'Curated by Admin' },
  { name: 'Most Appreciated' },
  { name: 'Most Discussed' },
  { name: 'Most Viewed' },
];

const ArchiveFilterListBox: FC<ArchiveFilterListBoxProps> = ({ className = '' }) => {
  const [selected, setSelected] = useState(lists[0]);
  return (
    <div data-nc-id="ArchiveFilterListBox" className={`nc-ArchiveFilterListBox ${className}`}>
      <Listbox onChange={setSelected} value={selected}>
        <div className="relative md:min-w-[200px]">
          <ListboxButton as="div">
            <ButtonDropdown>{selected.name}</ButtonDropdown>
          </ListboxButton>
          <Transition
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            as={Fragment}
            leave="transition ease-in duration-100"
          >
            <ListboxOptions className="absolute right-0 z-20 mt-2 max-h-60 w-52 overflow-auto rounded-2xl bg-white py-1 text-sm text-neutral-900 shadow-lg ring-1 ring-black/5 focus:outline-hidden dark:bg-neutral-900 dark:text-neutral-200 dark:ring-neutral-700">
              {lists.map((item, index: number) => (
                <ListboxOption
                  key={index}
                  className={({ selected }) =>
                    `${
                      selected
                        ? 'bg-primary-50 text-primary-700 dark:bg-neutral-700 dark:text-neutral-200'
                        : ''
                    } relative cursor-default py-2 pr-4 pl-10 select-none`
                  }
                  value={item}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`${selected ? 'font-medium' : 'font-normal'} block truncate`}
                      >
                        {item.name}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-700 dark:text-neutral-200">
                          <CheckIcon aria-hidden="true" className="h-5 w-5" />
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

export default ArchiveFilterListBox;
