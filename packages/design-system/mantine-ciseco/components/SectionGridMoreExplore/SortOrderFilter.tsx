'use client';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { Select } from '@mantine/core';
import { type FC, useState } from 'react';

const DEMO_DATA = [
  { name: 'Sort order' },
  { name: 'Today' },
  { name: 'Last 7 days' },
  { name: 'Last 30 days' },
];

interface Props {
  className?: string;
  data?: { name: string }[];
}

const SortOrderFilter: FC<Props> = ({ className = '', data = DEMO_DATA }) => {
  const [selected, setSelected] = useState(data[0].name);

  const SortIcon = () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        strokeWidth="1.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        d="M13.8201 6.84998L16.86 9.88998"
      />
      <path
        strokeWidth="1.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        d="M13.8201 17.15V6.84998"
      />
      <path
        strokeWidth="1.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        d="M10.18 17.15L7.14001 14.11"
      />
      <path
        strokeWidth="1.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        d="M10.1799 6.84998V17.15"
      />
      <path
        strokeWidth="1.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      />
    </svg>
  );

  return (
    <div className={className}>
      <Select
        comboboxProps={{
          shadow: 'lg',
          transitionProps: { duration: 200, transition: 'pop' },
        }}
        leftSection={<SortIcon />}
        onChange={(value) => value && setSelected(value)}
        rightSection={<ChevronDownIcon className="h-5 w-5" />}
        classNames={{
          dropdown: 'rounded-2xl shadow-lg ring-1 ring-black/5',
          input:
            'rounded-full border-neutral-200 bg-white px-5 py-2 font-medium text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400',
          option: 'hover:bg-amber-100 hover:text-amber-900',
        }}
        styles={{
          input: {
            paddingLeft: '3rem',
            paddingRight: '3rem',
          },
        }}
        data={data.map((item) => ({ label: item.name, value: item.name }))}
        value={selected}
      />
    </div>
  );
};

export default SortOrderFilter;
