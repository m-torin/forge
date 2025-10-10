import clsx from 'clsx';
import Slider from 'rc-slider';
import { useState } from 'react';

export const PriceRangeSlider = ({
  min,
  max,
  name,
  className,
  onChange,
  defaultValue,
  inputMaxName = 'price_max',
  inputMinName = 'price_min',
}: {
  min: number;
  max: number;
  name: string;
  className?: string;
  onChange?: (min: number, max: number) => void;
  defaultValue?: [number, number];
  inputMaxName?: string;
  inputMinName?: string;
}) => {
  const [rangePrices, setRangePrices] = useState([
    defaultValue?.[0] ?? min,
    defaultValue?.[1] ?? max,
  ]);

  return (
    <div className={clsx('relative flex flex-col gap-y-8', className)}>
      <div className="flex flex-col gap-y-5">
        <p className="font-medium">{name}</p>
        <div className="px-2">
          <Slider
            range
            min={min}
            max={max}
            step={1}
            defaultValue={[rangePrices?.[0] ?? 0, rangePrices?.[1] ?? 1000]}
            allowCross={false}
            onChange={input => {
              setRangePrices(input as [number, number]);
              onChange?.(min, max);
            }}
          />
        </div>
      </div>

      <div className="flex justify-between gap-x-5">
        <div className="flex-1">
          <p className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Min price
          </p>
          <div className="relative mt-1.5 w-full rounded-full bg-neutral-100 px-4 py-2 text-sm dark:bg-neutral-800">
            $ {rangePrices?.[0]}
          </div>
          <input type="hidden" name={inputMinName} value={rangePrices?.[0]} />
        </div>
        <div className="flex-1">
          <p className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Max price
          </p>
          <div className="relative mt-1.5 w-full rounded-full bg-neutral-100 px-4 py-2 text-sm dark:bg-neutral-800">
            $ {rangePrices?.[1]}
          </div>
          <input type="hidden" name={inputMaxName} value={rangePrices?.[1]} />
        </div>
      </div>
    </div>
  );
};
