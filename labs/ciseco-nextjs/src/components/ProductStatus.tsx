import { ClockIcon, NoSymbolIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { FC } from 'react'
import IconDiscount from './IconDiscount'

interface Props {
  status?: string
  className?: string
}

const ProductStatus: FC<Props> = ({
  status = 'New in',
  className = 'absolute top-3 start-3 px-2.5 py-1.5 text-xs bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300',
}) => {
  const renderStatus = () => {
    if (!status) {
      return null
    }
    const classes = `nc-shadow-lg rounded-full flex items-center justify-center ${className}`
    if (status === 'New in') {
      return (
        <div className={classes}>
          <SparklesIcon className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      )
    }
    if (status === '50% Discount') {
      return (
        <div className={classes}>
          <IconDiscount className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      )
    }
    if (status === 'Sold Out') {
      return (
        <div className={classes}>
          <NoSymbolIcon className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      )
    }
    if (status === 'limited edition') {
      return (
        <div className={classes}>
          <ClockIcon className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      )
    }
    return null
  }

  return renderStatus()
}

export default ProductStatus
