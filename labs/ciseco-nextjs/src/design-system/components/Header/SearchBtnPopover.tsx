'use client'

import { CloseButton, Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { Cancel01Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { redirect } from 'next/navigation'

import { Divider } from '../Divider'
import { Link } from '../Link'

const SearchBtnPopover = () => {
  return (
    <Popover>
      <PopoverButton className="-m-2.5 flex cursor-pointer items-center justify-center rounded-full p-2.5 hover:bg-neutral-100 focus-visible:outline-0 dark:hover:bg-neutral-800">
        <HugeiconsIcon strokeWidth={1.5} color="currentColor" icon={Search01Icon} size={24} />
      </PopoverButton>

      <PopoverPanel
        transition
        className="header-popover-full-panel data-closed:translate-y-1 data-closed:opacity-0 absolute inset-x-0 top-0 -z-10 bg-white pt-20 text-neutral-950 shadow-xl transition duration-200 ease-in-out dark:border-b dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100"
      >
        <div className="container">
          <div className="mx-auto flex w-full max-w-xl flex-col py-4">
            <form
              action="#"
              onSubmit={(e) => {
                e.preventDefault()
                redirect('/search')
              }}
              className="flex w-full items-center"
            >
              <HugeiconsIcon strokeWidth={1} color="currentColor" icon={Search01Icon} size={26} />
              <input
                aria-autocomplete="list"
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                autoFocus
                data-autofocus
                className="w-full !border-none px-4 py-2 text-sm/6 uppercase !ring-0 focus-visible:outline-none"
                aria-label="Search for products"
                name="q"
                spellCheck="false"
                type="text"
              />
              <CloseButton className="-m-2.5 inline-flex cursor-pointer items-center justify-center rounded-md p-2.5 transition-transform duration-300 hover:rotate-90">
                <HugeiconsIcon strokeWidth={1} color="currentColor" icon={Cancel01Icon} size={24} />
              </CloseButton>

              <input hidden type="submit" value="" />
            </form>
            <Divider className="my-4 block md:hidden" />
            <div className="block text-xs/6 uppercase text-neutral-500 md:hidden">
              Press{' '}
              <Link
                href="/search"
                className="rounded-sm bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-900"
              >
                <kbd className="text-xs font-medium">Enter</kbd>
              </Link>{' '}
              to search or{' '}
              <kbd className="rounded-sm bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-900">
                <span className="text-xs font-medium">Esc</span>
              </kbd>{' '}
              to cancel
            </div>
          </div>
        </div>
      </PopoverPanel>
    </Popover>
  )
}

export default SearchBtnPopover
