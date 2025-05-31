import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function CartBtn() {
  return (
    <Link
      href="/cart"
      className="relative -m-2.5 flex cursor-pointer items-center justify-center rounded-full p-2.5 hover:bg-neutral-100 focus-visible:outline-0 dark:hover:bg-neutral-800"
    >
      <div className="absolute top-2 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] leading-none font-medium text-white dark:bg-primary-600">
        <span className="mt-px">3</span>
      </div>
      <ShoppingBagIcon className="h-6 w-6" strokeWidth={1.5} />
    </Link>
  );
}
