'use client'

import { getHeaderDropdownCategories } from '@/data/navigation'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { Link } from '../Link'

interface Props {
  className?: string
  categories: Awaited<ReturnType<typeof getHeaderDropdownCategories>>
}

export default function CategoriesDropdown({ className, categories }: Props) {
  return (
    <div className={className}>
      <Popover className="group">
        <PopoverButton className="-m-2.5 flex items-center rounded-md p-2.5 text-sm font-medium focus:outline-hidden sm:text-base">
          <span>Shops</span>
          <ChevronDownIcon className="ms-2 size-5 text-neutral-700 group-data-open:-rotate-180" aria-hidden="true" />
        </PopoverButton>

        <PopoverPanel
          anchor="bottom start"
          transition
          className="z-10 mt-4 w-80 rounded-2xl shadow-lg ring-1 ring-black/5 transition duration-200 ease-in-out data-closed:translate-y-1 data-closed:opacity-0 sm:px-0 dark:ring-white/10"
        >
          <div className="relative grid grid-cols-1 gap-4 bg-white p-6 dark:bg-neutral-800">
            {categories.map((item, index) => (
              <Link
                key={index}
                href={'/collections/' + item.handle}
                className="flex items-center focus:outline-hidden focus-visible:ring-0"
              >
                <div
                  dangerouslySetInnerHTML={{ __html: item.icon }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-500 sm:h-12 sm:w-12"
                />
                <div className="ms-4">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-300">{item.description}</p>
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
  )
}
