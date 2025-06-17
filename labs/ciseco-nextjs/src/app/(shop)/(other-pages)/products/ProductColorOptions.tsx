'use client'

import { TProductItem } from '@/data/data'
import clsx from 'clsx'
import { useState } from 'react'

const ProductColorOptions = ({
  options,
  className,
  defaultColor,
}: {
  options: TProductItem['options']
  className?: string
  defaultColor: string
}) => {
  const [colorSelected, setColorSelected] = useState(defaultColor)

  const renderOptions = () => {
    const colorOptions = options?.filter((option) => option.name === 'Color')
    if (!colorOptions?.length) {
      return null
    }

    return colorOptions.map((option) => {
      return (
        <div key={option.name}>
          <label className="block rtl:text-right" htmlFor="">
            <span className="text-sm font-medium">{option.name}</span>
          </label>
          <div className="mt-2.5 flex gap-x-2.5">
            {option.optionValues.map((value) => {
              const isActive = value.name === colorSelected

              return (
                <div
                  key={value.name}
                  className={clsx(
                    'relative size-9 cursor-pointer rounded-full',
                    isActive && 'ring-2 ring-neutral-900 ring-offset-1'
                  )}
                  onClick={() => {
                    setColorSelected(value.name)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setColorSelected(value.name)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select color ${value.name}`}
                >
                  <div
                    className="absolute inset-0.5 z-0 overflow-hidden rounded-full bg-cover"
                    style={{
                      backgroundColor: value.swatch?.color,
                      backgroundImage: value.swatch?.image ? `url(${value.swatch.image})` : undefined,
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )
    })
  }

  return <div className={clsx(className)}>{renderOptions()}</div>
}

export default ProductColorOptions
