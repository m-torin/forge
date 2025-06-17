'use client'

import { ShoppingCart02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useAside } from '../aside'

export default function CartBtn() {
  const { open: openAside } = useAside()

  return (
    <button
      onClick={() => openAside('cart')}
      className="relative -m-2.5 flex cursor-pointer items-center justify-center rounded-full p-2.5 hover:bg-neutral-100 focus-visible:outline-0 dark:hover:bg-neutral-800"
    >
      <div className="absolute top-2 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] leading-none font-medium text-white dark:bg-primary-600">
        <span className="mt-px">3</span>
      </div>
      <HugeiconsIcon icon={ShoppingCart02Icon} size={24} color="currentColor" strokeWidth={1.5} />
    </button>
  )
}
