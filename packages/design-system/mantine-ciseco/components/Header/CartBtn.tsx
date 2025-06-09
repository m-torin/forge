'use client';

import { ShoppingCart02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface CartBtnProps {
  'data-testid'?: string;
  numberItems?: number;
  onClick?: () => void;
}

export default function CartBtn({
  'data-testid': testId = 'cart-button',
  numberItems = 0,
  onClick,
}: CartBtnProps) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      className="relative -m-2.5 flex cursor-pointer items-center justify-center rounded-full p-2.5 hover:bg-neutral-100 focus-visible:outline-0 dark:hover:bg-neutral-800"
    >
      {numberItems > 0 && (
        <div className="absolute top-2 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] leading-none font-medium text-white dark:bg-primary-600">
          <span className="mt-px">{numberItems}</span>
        </div>
      )}
      <HugeiconsIcon strokeWidth={1.5} color="currentColor" icon={ShoppingCart02Icon} size={24} />
    </button>
  );
}
