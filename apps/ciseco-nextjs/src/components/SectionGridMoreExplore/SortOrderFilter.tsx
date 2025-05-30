'use client'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/solid'
import { FC, Fragment, useState } from 'react'

const DEMO_DATA = [{ name: 'Sort order' }, { name: 'Today' }, { name: 'Last 7 days' }, { name: 'Last 30 days' }]

interface Props {
  data?: { name: string }[]
  className?: string
}

const SortOrderFilter: FC<Props> = ({ data = DEMO_DATA, className = '' }) => {
  const [selected, setSelected] = useState(data[0])

  return (
    <div className={className}>
      <Listbox value={selected} onChange={setSelected}>
        <div className="relative mt-1">
          <Listbox.Button as={Fragment}>
            <button className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-5 py-2 font-medium text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M13.8201 6.84998L16.86 9.88998"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.8201 17.15V6.84998"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.18 17.15L7.14001 14.11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.1799 6.84998V17.15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <span className="ml-2.5 block truncate">{selected.name}</span>
              <span className="ml-5">
                <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
              </span>
            </button>
          </Listbox.Button>
          <Transition
            enter="transition ease-out duration-100 "
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Listbox.Options className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-2xl bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-hidden sm:text-sm">
              {data.map((person, personIdx) => (
                <Listbox.Option
                  key={personIdx}
                  className={({ active }) =>
                    `${
                      active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                    } relative cursor-default py-2 pr-4 pl-10 select-none`
                  }
                  value={person}
                >
                  {({ selected, active }) => (
                    <>
                      <span className={`${selected ? 'font-medium' : 'font-normal'} block truncate`}>
                        {person.name}
                      </span>
                      {selected ? (
                        <span
                          className={`${
                            active ? 'text-amber-600' : 'text-amber-600'
                          } absolute inset-y-0 left-0 flex items-center pl-3`}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
}

export default SortOrderFilter
