'use client';

import {
  Checkbox,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Fieldset,
  Label,
  Legend,
} from '@headlessui/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import clsx from 'clsx';

import { Aside } from './aside/aside';

const filters = [
  {
    id: 'color',
    name: 'Color',
    options: [
      { label: 'White', value: 'white' },
      { label: 'Beige', value: 'beige' },
      { label: 'Blue', value: 'blue' },
      { label: 'Brown', value: 'brown' },
      { label: 'Green', value: 'green' },
      { label: 'Purple', value: 'purple' },
    ],
  },
  {
    id: 'category',
    name: 'Category',
    options: [
      { label: 'All New Arrivals', value: 'new-arrivals' },
      { label: 'Tees', value: 'tees' },
      { label: 'Crewnecks', value: 'crewnecks' },
      { label: 'Sweatshirts', value: 'sweatshirts' },
      { label: 'Pants & Shorts', value: 'pants-shorts' },
    ],
  },
  {
    id: 'sizes',
    name: 'Sizes',
    options: [
      { label: 'XS', value: 'xs' },
      { label: 'S', value: 's' },
      { label: 'M', value: 'm' },
      { label: 'L', value: 'l' },
      { label: 'XL', value: 'xl' },
      { label: '2XL', value: '2xl' },
    ],
  },
];
interface Props {
  className?: string;
}

const AsideCategoryFilters = ({ className = '' }: Props) => {
  return (
    <Aside openFrom="right" heading="Filters" size="sm" type="category-filters">
      <div className={clsx('flex h-full flex-col', className)}>
        {/* CONTENT */}

        <div className="hidden-scrollbar flex-1 overflow-x-hidden overflow-y-auto">
          <div className="flow-root">
            {/* Filters */}
            <form className="">
              {filters.map((section) => (
                <Disclosure
                  key={section.name}
                  className="border-b border-neutral-200 pt-4 pb-4"
                  as="div"
                >
                  <Fieldset>
                    <Legend className="w-full">
                      <DisclosureButton className="group flex w-full items-center justify-between p-2 text-neutral-400 hover:text-neutral-500">
                        <p className="text-sm font-medium text-neutral-900">{section.name}</p>
                        <span className="ms-6 flex h-7 items-center">
                          <HugeiconsIcon
                            strokeWidth={1.5}
                            color="currentColor"
                            icon={ArrowDown01Icon}
                            className="size-5 shrink-0 group-data-open:-rotate-180"
                            size={16}
                          />
                        </span>
                      </DisclosureButton>
                    </Legend>
                    <DisclosurePanel className="px-4 pt-4 pb-2">
                      <div>
                        {section.options.map((option, optionIdx) => (
                          <div key={option.value}>
                            <Checkbox name={`${section.id}[]`} value={option.value} />
                            <Label>
                              <p className="text-neutral-600">{option.label}</p>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </DisclosurePanel>
                  </Fieldset>
                </Disclosure>
              ))}
            </form>
          </div>
        </div>
      </div>
    </Aside>
  );
};

export default AsideCategoryFilters;
