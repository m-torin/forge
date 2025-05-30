'use client'

import { Checkbox, Disclosure, DisclosureButton, DisclosurePanel, Fieldset, Label, Legend } from '@headlessui/react'

import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import { Aside } from './aside/aside'

const filters = [
  {
    id: 'color',
    name: 'Color',
    options: [
      { value: 'white', label: 'White' },
      { value: 'beige', label: 'Beige' },
      { value: 'blue', label: 'Blue' },
      { value: 'brown', label: 'Brown' },
      { value: 'green', label: 'Green' },
      { value: 'purple', label: 'Purple' },
    ],
  },
  {
    id: 'category',
    name: 'Category',
    options: [
      { value: 'new-arrivals', label: 'All New Arrivals' },
      { value: 'tees', label: 'Tees' },
      { value: 'crewnecks', label: 'Crewnecks' },
      { value: 'sweatshirts', label: 'Sweatshirts' },
      { value: 'pants-shorts', label: 'Pants & Shorts' },
    ],
  },
  {
    id: 'sizes',
    name: 'Sizes',
    options: [
      { value: 'xs', label: 'XS' },
      { value: 's', label: 'S' },
      { value: 'm', label: 'M' },
      { value: 'l', label: 'L' },
      { value: 'xl', label: 'XL' },
      { value: '2xl', label: '2XL' },
    ],
  },
]
interface Props {
  className?: string
}

const AsideCategoryFilters = ({ className = '' }: Props) => {
  return (
    <Aside openFrom="right" type="category-filters" heading="Filters" contentMaxWidthClassName="max-w-sm">
      <div className={clsx('flex h-full flex-col', className)}>
        {/* CONTENT */}

        <div className="hidden-scrollbar flex-1 overflow-x-hidden overflow-y-auto">
          <div className="flow-root">
            {/* Filters */}
            <form className="">
              {filters.map((section) => (
                <Disclosure key={section.name} as="div" className="border-b border-neutral-200 pt-4 pb-4">
                  <Fieldset>
                    <Legend className="w-full">
                      <DisclosureButton className="group flex w-full items-center justify-between p-2 text-neutral-400 hover:text-neutral-500">
                        <p className="text-sm font-medium text-neutral-900">{section.name}</p>
                        <span className="ms-6 flex h-7 items-center">
                          <HugeiconsIcon
                            icon={ArrowDown01Icon}
                            className="size-5 shrink-0 group-data-open:-rotate-180"
                            size={16}
                            color="currentColor"
                            strokeWidth={1.5}
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
  )
}

export default AsideCategoryFilters
