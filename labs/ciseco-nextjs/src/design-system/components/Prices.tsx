import clsx from 'clsx'
import { type FC } from 'react'

export interface PricesProps {
  className?: string
  contentClass?: string
  price: number
}

const Prices: FC<PricesProps> = ({
  className,
  contentClass = 'py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium',
  price,
}) => {
  return (
    <div className={clsx(className)}>
      <div className={`flex items-center rounded-lg border-2 border-green-500 ${contentClass}`}>
        <span className="leading-none! text-green-500">${price.toFixed(2)}</span>
      </div>
    </div>
  )
}

export default Prices
