'use client';

import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Accordion, Checkbox } from '@mantine/core';
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
            <form>
              <Accordion
                chevron={
                  <HugeiconsIcon
                    strokeWidth={1.5}
                    color="currentColor"
                    icon={ArrowDown01Icon}
                    className="size-5 shrink-0"
                    size={16}
                  />
                }
                classNames={{
                  chevron: 'ms-6',
                  content: 'px-4 pt-4 pb-2',
                  control: 'p-2 text-neutral-400 hover:text-neutral-500',
                  item: 'border-b border-neutral-200',
                  root: 'space-y-0',
                }}
                defaultValue={filters.map((f) => f.id)}
                multiple
              >
                {filters.map((section) => (
                  <Accordion.Item key={section.id} value={section.id}>
                    <Accordion.Control>
                      <p className="text-sm font-medium text-neutral-900">{section.name}</p>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <div className="space-y-2">
                        {section.options.map((option) => (
                          <Checkbox
                            key={option.value}
                            classNames={{
                              body: 'flex items-center',
                              label: 'ml-2 cursor-pointer',
                              root: 'group',
                            }}
                            label={<span className="text-neutral-600">{option.label}</span>}
                            name={`${section.id}[]`}
                            value={option.value}
                          />
                        ))}
                      </div>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            </form>
          </div>
        </div>
      </div>
    </Aside>
  );
};

export default AsideCategoryFilters;
