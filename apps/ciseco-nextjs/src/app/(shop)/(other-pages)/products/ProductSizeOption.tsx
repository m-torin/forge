import { TProductItem } from '@repo/design-system/ciseco'
import clsx from 'clsx'

const ProductSizeOption = ({ options, className }: { options: TProductItem['options']; className?: string }) => {
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
          <div className="text-primary-600 hover:text-primary-500 cursor-pointer">See sizing chart</div>
        </div>
        <div className="mt-2.5 grid grid-cols-5 gap-2 sm:grid-cols-7">
          {sizeOptionValues.map((size, index) => {
            // for demo purpose
            const isActive = index === 0
            return (
              <div
                key={size.name}
                className={clsx(
                  'relative flex h-10 select-none items-center justify-center overflow-hidden rounded-lg text-sm font-medium uppercase text-neutral-900 ring-1 ring-neutral-200 hover:bg-neutral-50 sm:h-11 dark:text-neutral-200 dark:ring-neutral-600 dark:hover:bg-neutral-700',
                  isActive && 'ring-2 ring-neutral-900 dark:ring-neutral-200'
                )}
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

export default ProductSizeOption
