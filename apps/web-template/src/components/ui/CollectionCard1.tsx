import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { type FC } from 'react';

import type { Collection } from '@/data/types';

interface CollectionCard1Props {
  className?: string;
  collection: Collection;
  size?: 'large' | 'normal';
}

const CollectionCard1: FC<CollectionCard1Props> = ({ 
  className = '', 
  collection, 
  size = 'normal' 
}) => {
  if (!collection.handle) {
    return null;
  }

  return (
    <Link 
      href={`/collections/${collection.handle}`} 
      className={`flex items-center ${className}`}
    >
      {collection.image && (
        <div
          className={clsx(
            'relative mr-4 shrink-0 overflow-hidden rounded-lg',
            size === 'large' ? 'size-20' : 'size-12'
          )}
        >
          <Image
            alt={collection.image.altText || collection.title}
            fill
            sizes="(max-width: 640px) 100vw, 40vw"
            src={collection.image.url}
            className="object-cover"
          />
        </div>
      )}
      <div>
        <h2
          className={clsx(
            'nc-card-title font-semibold text-neutral-900 dark:text-neutral-100',
            size === 'large' ? 'text-lg' : 'text-base'
          )}
        >
          {collection.title}
        </h2>
        <span
          className={`${
            size === 'large' ? 'text-sm' : 'text-xs'
          } mt-[2px] block text-neutral-500 dark:text-neutral-400`}
        >
          {collection.description || `${collection.products?.length || 0} products`}
        </span>
      </div>
    </Link>
  );
};

export default CollectionCard1;