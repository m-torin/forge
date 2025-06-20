import clsx from 'clsx';
import { type FC } from 'react';

export interface PricesProps extends Record<string, any> {
  className?: string;
  contentClass?: string;
  'data-testid'?: string;
  price: number;
  priceFormatter?: (price: number) => string;
  salePrice?: number;
}

const Prices: FC<PricesProps> = ({
  className,
  contentClass = 'py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium',
  'data-testid': testId,
  price,
  priceFormatter,
  salePrice,
}) => {
  const formatPrice = priceFormatter ?? ((p: number) => `$${p.toFixed(2)}`);

  return (
    <div className={clsx(className)} data-testid={testId}>
      {salePrice ? (
        <div className="flex items-center gap-2">
          <div className={`flex items-center rounded-lg border-2 border-green-500 ${contentClass}`}>
            <span className="leading-none! text-green-500">{formatPrice(salePrice)}</span>
          </div>
          <span className="text-sm text-gray-500 line-through">{formatPrice(price)}</span>
        </div>
      ) : (
        <div className={`flex items-center rounded-lg border-2 border-green-500 ${contentClass}`}>
          <span className="leading-none! text-green-500">{formatPrice(price)}</span>
        </div>
      )}
    </div>
  );
};

export default Prices;
