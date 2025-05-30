import { CheckIcon, ClockIcon, NoSymbolIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { PercentCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'

const ProductStatus = ({ status, className }: { status: string; className?: string }) => {
  const renderStatus = () => {
    if (status === 'In Stock') {
      return (
        <>
          <CheckIcon className="size-5" />
          <span className="ml-1 leading-none">{status}</span>
        </>
      )
    }
    if (status === 'New in') {
      return (
        <>
          <SparklesIcon className="size-5" />
          <span className="ml-1 leading-none">{status}</span>
        </>
      )
    }
    if (status === '50% Discount') {
      return (
        <>
          <HugeiconsIcon icon={PercentCircleIcon} size={14} color="currentColor" strokeWidth={1.5} />
          <span className="ml-1 leading-none">{status}</span>
        </>
      )
    }
    if (status === 'Sold Out') {
      return (
        <>
          <NoSymbolIcon className="size-5" />
          <span className="ml-1 leading-none">{status}</span>
        </>
      )
    }
    if (status === 'limited edition') {
      return (
        <>
          <ClockIcon className="size-5" />
          <span className="ml-1 leading-none">{status}</span>
        </>
      )
    }
    return null
  }

  return (
    <div
      className={clsx(
        className,
        'flex items-center justify-center text-sm/normal text-neutral-900 dark:bg-neutral-900 dark:text-neutral-200'
      )}
    >
      {renderStatus()}
    </div>
  )
}

export default ProductStatus
