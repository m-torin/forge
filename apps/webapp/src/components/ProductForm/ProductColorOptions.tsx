'use client';

import { TProductItem } from '@/data/data';
import * as Headless from '@headlessui/react';
import clsx from 'clsx';
import { useState } from 'react';

const ProductColorOptions = ({
  options,
  className,
  defaultColor,
  'data-testid': testId = 'product-color-options',
}: {
  options: TProductItem['options'];
  className?: string;
  defaultColor: string;
  'data-testid'?: string;
}) => {
  const [colorSelected, setColorSelected] = useState(defaultColor);

  const colorOptionValues = options?.find(option => option.name === 'Color')?.optionValues;

  if (!colorOptionValues?.length) {
    return null;
  }

  return (
    <Headless.Field className={clsx(className)} data-testid={testId}>
      <Headless.RadioGroup
        value={colorSelected}
        name="color"
        onChange={setColorSelected}
        aria-label="Color"
      >
        <Headless.Label className="block text-sm font-medium rtl:text-right">Color</Headless.Label>
        <div className="mt-2.5 flex gap-x-2.5">
          {colorOptionValues.map((value: any) => {
            const isActive = value.name === colorSelected;

            return (
              <Headless.Radio
                key={value.name}
                value={value.name}
                as="div"
                className={clsx(
                  'relative size-9 cursor-pointer rounded-full',
                  isActive && 'ring-2 ring-neutral-900 dark:ring-neutral-300',
                )}
                aria-label={value.name}
                data-testid={`color-option-${value.name.toLowerCase()}`}
              >
                <div
                  className="absolute inset-0.5 z-0 overflow-hidden rounded-full bg-cover ring-1 ring-neutral-900/10 dark:ring-white/15"
                  style={{
                    backgroundColor: value.swatch?.color,
                    backgroundImage: value.swatch?.image ? `url(${value.swatch.image})` : undefined,
                  }}
                  data-testid={`color-swatch-${value.name.toLowerCase()}`}
                />
              </Headless.Radio>
            );
          })}
        </div>
      </Headless.RadioGroup>
    </Headless.Field>
  );
};

export default ProductColorOptions;
