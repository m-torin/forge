'use client';
import { CheckIcon } from '@heroicons/react/24/solid';
import { type ComboboxItem, Select } from '@mantine/core';
import { type FC, useState } from 'react';

export interface ArchiveFilterListBoxProps extends Record<string, any> {
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
    children?: {
      label: string;
      value: string;
    }[];
    count?: number;
    description?: string;
    icon?: string;
    label: string;
    value: string;
  }[];
  searchable?: boolean;
  showCounts?: boolean;
  showDescriptions?: boolean;
  showSummary?: boolean;
  value?: string | string[];
}

const ArchiveFilterListBox: FC<ArchiveFilterListBoxProps> = ({
  className = '',
  clearable = false,
  'data-testid': testId = 'filter-select',
  disabled = false,
  groupedOptions,
  hierarchical = false,
  loading: loading = false,
  multiple = false,
  onChange,
  options,
  searchable = false,
  showCounts = false,
  showDescriptions = false,
  showSummary = false,
  value,
}) => {
  const [selected, setSelected] = useState<string | string[]>(value ?? (multiple ? [] : ''));

  const handleChange = (newValue: null | string) => {
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
      setSelected(newValue ?? '');
      onChange?.(newValue ?? '');
    }
  };

  const data = groupedOptions
    ? groupedOptions.map((group: any) => ({
        group: group.group,
        items: group.options.map((opt: any) => ({
          label: opt.label,
          value: opt.value,
        })),
      }))
    : options.map((opt: any) => ({
        label: opt.label,
        value: opt.value,
        ...(showCounts && opt.count ? { rightSection: `(${opt.count})` } : {}),
        ...(opt.icon ? { leftSection: opt.icon } : {}),
        ...(showDescriptions && opt.description ? { description: opt.description } : {}),
        ...(hierarchical && opt.children
          ? {
              children: opt.children.map((child: any) => ({
                label: child.label,
                value: child.value,
              })),
            }
          : {}),
      }));

  return (
    <div
      className={`nc-ArchiveFilterListBox ${className}`}
      data-nc-id="ArchiveFilterListBox"
      data-testid={testId}
    >
      <Select
        classNames={{
          dropdown:
            'rounded-2xl shadow-lg ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-neutral-700',
          input:
            'border-neutral-300 rounded-full pl-4 pr-12 py-2.5 text-sm font-medium focus:border-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200',
          option:
            'hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200',
        }}
        clearable={clearable}
        comboboxProps={{
          shadow: 'lg',
          transitionProps: { duration: 200, transition: 'pop' },
        }}
        data={data}
        disabled={disabled}
        multiple={multiple}
        renderOption={
          showSummary && multiple
            ? ({ option }: { option: ComboboxItem & { count?: number } }) => (
                <div className="flex items-center gap-1" data-testid="filter-option">
                  <span>{option.label}</span>
                  {showCounts && 'count' in option && option.count && (
                    <span className="text-neutral-500">({option.count})</span>
                  )}
                </div>
              )
            : undefined
        }
        rightSection={<CheckIcon className="h-4 w-4" />}
        searchable={searchable}
        styles={{
          input: {
            minWidth: '200px',
          },
        }}
        value={multiple ? undefined : (selected as string)}
        onChange={handleChange}
      />
    </div>
  );
};

export default ArchiveFilterListBox;
