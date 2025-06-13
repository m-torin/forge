import clsx from 'clsx';
import type { FC } from 'react';

export interface PricesProps {
  className?: string;
  contentClass?: string;
  price: number;
  compareAtPrice?: number;
}

const Prices: FC<PricesProps> = ({
  className,
  contentClass = 'py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium',
  price,
  compareAtPrice,
}) => {
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div className={`flex items-center rounded-lg border-2 border-green-500 ${contentClass}`}>
        <span className="!leading-none text-green-500">${price.toFixed(2)}</span>
      </div>
      {hasDiscount && (
        <span className="text-sm text-neutral-500 line-through dark:text-neutral-400">
          ${compareAtPrice.toFixed(2)}
        </span>
      )}
    </div>
  );
};

export default Prices;