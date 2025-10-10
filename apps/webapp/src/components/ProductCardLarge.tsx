import { TProductItem } from '@/data/data';
import { routes } from '@/lib/routes';
import NcImage from '@/shared/NcImage/NcImage';
import { Link } from '@/shared/link';
import { StarIcon } from '@heroicons/react/24/solid';
import { FC } from 'react';
import Prices from './Prices';

export interface Props {
  className?: string;
  product: TProductItem;
}

const ProductCardLarge: FC<Props> = ({ className, product }) => {
  const { images, title, price, rating, reviewNumber, handle, selectedOptions } = product;

  const color = selectedOptions?.find(option => option.name === 'Color')?.value;

  return (
    <div className={`CollectionCard2 group relative ${className}`}>
      <div className="relative flex flex-col">
        {images?.[0] && (
          <NcImage
            containerClassName="aspect-8/5 bg-neutral-100 rounded-2xl overflow-hidden relative"
            className="rounded-2xl object-contain"
            fill
            src={images?.[0]}
            alt=""
            sizes="400px"
          />
        )}
        <div className="mt-2.5 grid grid-cols-3 gap-x-2.5">
          {images?.[1] && (
            <NcImage
              containerClassName="w-full h-24 sm:h-28 relative"
              className="rounded-2xl object-cover"
              src={images[1]}
              alt={images[1].alt}
              fill
              sizes="150px"
            />
          )}
          {images?.[2] && (
            <NcImage
              containerClassName="w-full h-24 sm:h-28 relative"
              className="rounded-2xl object-cover"
              src={images[2]}
              alt={images[2].alt}
              sizes="150px"
              fill
            />
          )}
          {images?.[3] && (
            <NcImage
              containerClassName="w-full h-24 sm:h-28 relative"
              className="h-full w-full rounded-2xl object-cover"
              src={images[3]}
              alt={images[3].alt}
              fill
              sizes="150px"
            />
          )}
        </div>
      </div>

      <div className="relative mt-5 flex justify-between gap-4">
        {/* TITLE */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold sm:text-xl">{title}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-1 text-neutral-500 dark:text-neutral-400">
            <span className="text-sm">
              <span className="line-clamp-1">{color}</span>
            </span>
            <span className="h-5 border-l border-neutral-200 sm:mx-2 dark:border-neutral-700" />
            <StarIcon className="h-4 w-4 text-orange-400" />
            <span className="text-sm">
              <span className="line-clamp-1">
                {rating} ({reviewNumber} reviews)
              </span>
            </span>
          </div>
        </div>
        <Prices className="mt-0.5" price={price || 1} />
      </div>
      <Link href={routes.products.detail(handle || '')} className="absolute inset-0">
        <span className="sr-only">View {title} product details</span>
      </Link>
    </div>
  );
};

export default ProductCardLarge;
