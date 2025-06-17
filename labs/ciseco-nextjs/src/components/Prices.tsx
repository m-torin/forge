import clsx from 'clsx'
import { FC } from 'react'

export interface PricesProps {
  className?: string
  price: number
  contentClass?: string
}

const Prices: FC<PricesProps> = ({
  className,
  price,
  contentClass = 'py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium',
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
