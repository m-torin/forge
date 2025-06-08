'use client';

import { MinusIcon, PlusIcon } from '@heroicons/react/24/solid';
import React, { type FC, useEffect, useState } from 'react';

export interface NcInputNumberProps {
  className?: string;
  'data-testid'?: string;
  defaultValue?: number;
  desc?: string;
  label?: string;
  max?: number;
  min?: number;
  onChange?: (value: number) => void;
}

const NcInputNumber: FC<NcInputNumberProps> = ({
  className = 'w-full',
  'data-testid': testId = 'number-input',
  defaultValue = 1,
  desc,
  label,
  max = 99,
  min = 1,
  onChange,
}) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleClickDecrement = () => {
    if (min >= value) return;
    setValue((state) => {
      return state - 1;
    });
    onChange && onChange(value - 1);
  };
  const handleClickIncrement = () => {
    if (max && max <= value) return;
    setValue((state) => {
      return state + 1;
    });
    onChange && onChange(value + 1);
  };

  const renderLabel = () => {
    return (
      <div className="flex flex-col">
        <span className="font-medium text-neutral-800 dark:text-neutral-200">{label}</span>
        {desc && (
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">{desc}</span>
        )}
      </div>
    );
  };

  return (
    <div data-testid={testId} className={`nc-NcInputNumber flex items-center justify-between space-x-5 ${className}`}>
      {label && renderLabel()}

      <div className="nc-NcInputNumber__content flex items-center justify-between w-[104px] sm:w-28">
        <button
          data-testid="decrement-button"
          onClick={handleClickDecrement}
          className="w-8 h-8 rounded-full flex items-center justify-center border border-neutral-400 dark:border-neutral-500 bg-white dark:bg-neutral-900 focus:outline-hidden hover:border-neutral-700 dark:hover:border-neutral-400 disabled:hover:border-neutral-400 dark:disabled:hover:border-neutral-500 disabled:opacity-50 disabled:cursor-default"
          disabled={min >= value}
          type="button"
        >
          <MinusIcon className="w-4 h-4" />
        </button>
        <span className="select-none block flex-1 text-center leading-none">{value}</span>
        <button
          data-testid="increment-button"
          onClick={handleClickIncrement}
          className="w-8 h-8 rounded-full flex items-center justify-center border border-neutral-400 dark:border-neutral-500 bg-white dark:bg-neutral-900 focus:outline-hidden hover:border-neutral-700 dark:hover:border-neutral-400 disabled:hover:border-neutral-400 dark:disabled:hover:border-neutral-500 disabled:opacity-50 disabled:cursor-default"
          disabled={max ? max <= value : false}
          type="button"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NcInputNumber;
