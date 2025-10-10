'use client';

import { ShoppingCart02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useAside } from '../aside';

interface Props {
  'data-testid'?: string;
}

export default function CartBtn({ 'data-testid': testId = 'cart-btn' }: Props = {}) {
  const { open: openAside } = useAside();

  return (
    <button
      onClick={() => openAside('cart')}
      className="relative -m-2.5 flex cursor-pointer items-center justify-center rounded-full p-2.5 hover:bg-neutral-100 focus-visible:outline-0 dark:hover:bg-neutral-800"
      data-testid={testId}
    >
      <div className="bg-primary-500 dark:bg-primary-600 absolute right-1.5 top-2 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium leading-none text-white">
        <span className="mt-px">3</span>
      </div>
      <HugeiconsIcon icon={ShoppingCart02Icon} size={24} color="currentColor" strokeWidth={1.5} />
    </button>
  );
}
