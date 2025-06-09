'use client';
import { CheckIcon } from '@heroicons/react/24/solid';
import { type ComboboxItem, Select } from '@mantine/core';
import { type FC, useState } from 'react';

export interface ArchiveFilterListBoxProps {
  className?: string;
  clearable?: boolean;
  'data-testid'?: string;
  disabled?: boolean;
  groupedOptions?: {
    group: string;
    options: {
      label: string;
      value: string;
    }[];
  }[];
  hierarchical?: boolean;
  loading?: boolean;
  multiple?: boolean;
  onChange?: (value: string | string[]) => void;
  options: {
    label: string;
    value: string;
    count?: number;
    icon?: string;
    description?: string;
    children?: {
      label: string;
      value: string;
    }[];
  }[];
  searchable?: boolean;
  showCounts?: boolean;
  showDescriptions?: boolean;
  showSummary?: boolean;
  value?: string | string[];
}

const ArchiveFilterListBox: FC<ArchiveFilterListBoxProps> = ({
  'data-testid': testId = 'filter-select',
  className = '',
  clearable = false,
  disabled = false,
  groupedOptions,
  hierarchical = false,
  loading = false,
  multiple = false,
  onChange,
  options,
  searchable = false,
  showCounts = false,
  showDescriptions = false,
  showSummary = false,
  value,
}) => {
  const [selected, setSelected] = useState<string | string[]>(value || (multiple ? [] : ''));

  const handleChange = (newValue: string | null) => {
    if (multiple) {
      const newSelected = Array.isArray(selected) ? selected : [];
      if (newValue) {
        if (!newSelected.includes(newValue)) {
          newSelected.push(newValue);
        }
      }
      setSelected(newSelected);
      onChange?.(newSelected);
    } else {
      setSelected(newValue || '');
      onChange?.(newValue || '');
    }
  };

  const data = groupedOptions
    ? groupedOptions.map((group) => ({
        group: group.group,
        items: group.options.map((opt) => ({
          label: opt.label,
          value: opt.value,
        })),
      }))
    : options.map((opt) => ({
        label: opt.label,
        value: opt.value,
        ...(showCounts && opt.count ? { rightSection: `(${opt.count})` } : {}),
        ...(opt.icon ? { leftSection: opt.icon } : {}),
        ...(showDescriptions && opt.description ? { description: opt.description } : {}),
        ...(hierarchical && opt.children
          ? {
              children: opt.children.map((child) => ({
                label: child.label,
                value: child.value,
              })),
            }
          : {}),
      }));

  return (
    <div
      data-nc-id="ArchiveFilterListBox"
      data-testid={testId}
      className={`nc-ArchiveFilterListBox ${className}`}
    >
      <Select
        comboboxProps={{
          shadow: 'lg',
          transitionProps: { duration: 200, transition: 'pop' },
        }}
        onChange={handleChange}
        renderOption={
          showSummary && multiple
            ? ({ option }: { option: ComboboxItem & { count?: number } }) => (
                <div data-testid="filter-option" className="flex items-center gap-1">
                  <span>{option.label}</span>
                  {showCounts && 'count' in option && option.count && (
                    <span className="text-neutral-500">({option.count})</span>
                  )}
                </div>
              )
            : undefined
        }
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
        clearable={clearable}
        data={data}
        disabled={disabled}
        multiple={multiple}
        searchable={searchable}
        value={multiple ? undefined : (selected as string)}
      />
    </div>
  );
};

export default ArchiveFilterListBox;
