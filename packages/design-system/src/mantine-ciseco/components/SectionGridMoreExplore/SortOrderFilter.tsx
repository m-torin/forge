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

interface Props extends Record<string, any> {
  className?: string;
  data?: { name: string }[];
}

const SortIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24">
    <path
      d="M13.8201 6.84998L16.86 9.88998"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit="10"
      strokeWidth="1.5"
    />
    <path
      d="M13.8201 17.15V6.84998"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit="10"
      strokeWidth="1.5"
    />
    <path
      d="M10.18 17.15L7.14001 14.11"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit="10"
      strokeWidth="1.5"
    />
    <path
      d="M10.1799 6.84998V17.15"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit="10"
      strokeWidth="1.5"
    />
    <path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
);

const SortOrderFilter: FC<Props> = ({ className = '', data = DEMO_DATA }: any) => {
  const [selected, setSelected] = useState(data[0].name);

  return (
    <div className={className}>
      <Select
        classNames={{
          dropdown: 'rounded-2xl shadow-lg ring-1 ring-black/5',
          input:
            'rounded-full border-neutral-200 bg-white px-5 py-2 font-medium text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400',
          option: 'hover:bg-amber-100 hover:text-amber-900',
        }}
        comboboxProps={{
          shadow: 'lg',
          transitionProps: { duration: 200, transition: 'pop' },
        }}
        data={data.map((item: any) => ({ label: item.name, value: item.name }))}
        leftSection={<SortIcon />}
        rightSection={<ChevronDownIcon className="h-5 w-5" />}
        styles={{
          input: {
            paddingLeft: '3rem',
            paddingRight: '3rem',
          },
        }}
        value={selected}
        onChange={(value: any) => value && setSelected(value)}
      />
    </div>
  );
};

export default SortOrderFilter;
