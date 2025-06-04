'use client';
import { CheckIcon } from '@heroicons/react/24/solid';
import { Select } from '@mantine/core';
import { type FC, useState } from 'react';

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
  const [selected, setSelected] = useState(lists[0].name);

  return (
    <div data-nc-id="ArchiveFilterListBox" className={`nc-ArchiveFilterListBox ${className}`}>
      <Select
        comboboxProps={{
          shadow: 'lg',
          transitionProps: { duration: 200, transition: 'pop' },
        }}
        onChange={(value) => value && setSelected(value)}
        rightSection={<CheckIcon className="h-4 w-4" />}
        classNames={{
          dropdown:
            'rounded-2xl shadow-lg ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-neutral-700',
          input:
            'border-neutral-300 rounded-full pl-4 pr-12 py-2.5 text-sm font-medium focus:border-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200',
          option:
            'hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200',
        }}
        styles={{
          input: {
            minWidth: '200px',
          },
        }}
        data={lists.map((item) => ({ label: item.name, value: item.name }))}
        value={selected}
      />
    </div>
  );
};

export default ArchiveFilterListBox;
