'use client'

import { TProductItem } from '@/data/data'
import clsx from 'clsx'
import { useState } from 'react'

const ProductSizeOptions = ({
  options,
  className,
  defaultSize,
}: {
  options: TProductItem['options']
  className?: string
  defaultSize: string
}) => {
  const [sizeSelected, setSizeSelected] = useState(defaultSize)

  const renderSizeOptions = () => {
    const sizeOptionValues = options?.find((option) => option.name === 'Size')?.optionValues

    if (!sizeOptionValues?.length) {
      return null
    }

    return (
      <div>
        <div className="flex justify-between text-sm font-medium">
          <label>
            <span>Size</span>
          </label>
          <div className="cursor-pointer text-primary-600 hover:text-primary-500">See sizing chart</div>
        </div>
        <div className="mt-2.5 grid grid-cols-5 gap-2 sm:grid-cols-7">
          {sizeOptionValues.map((size) => {
            const isActive = size.name === sizeSelected
            return (
              <div
                key={size.name}
                className={clsx(
                  'relative flex h-10 items-center justify-center overflow-hidden rounded-lg text-sm font-medium text-neutral-900 uppercase ring-1 ring-neutral-200 select-none hover:bg-neutral-50 sm:h-11 dark:text-neutral-200 dark:ring-neutral-600 dark:hover:bg-neutral-700',
                  isActive && 'ring-2 ring-neutral-900 dark:ring-neutral-200'
                )}
                onClick={() => {
                  setSizeSelected(size.name)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSizeSelected(size.name)
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Select size ${size.name}`}
              >
                {size.name}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return <div className={clsx(className)}>{renderSizeOptions()}</div>
}

export default ProductSizeOptions
