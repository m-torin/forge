import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { type FC } from 'react';

import type { Collection } from '@/data/types';

interface CollectionCard2Props {
  className?: string;
  collection: Collection;
  ratioClass?: string;
}

const CollectionCard2: FC<CollectionCard2Props> = ({ 
  className, 
  collection, 
  ratioClass = 'aspect-square' 
}) => {
  if (!collection.handle) {
    return null;
  }

  // Get background color from collection metadata or use default
  const bgColor = collection.metafields?.find(m => m.key === 'background_color')?.value || 'bg-slate-100';

  return (
    <Link href={`/collections/${collection.handle}`} className={clsx(className, 'block')}>
      <div className={clsx('group relative w-full overflow-hidden rounded-2xl', ratioClass, bgColor)}>
        {collection.image && (
          <div className="absolute inset-5 xl:inset-14">
            <Image
              className="rounded-2xl object-cover object-center"
              alt={collection.image.altText || collection.title}
              fill
              sizes="(max-width: 640px) 100vw, 40vw"
              src={collection.image.url}
            />
          </div>
        )}
        <span className="absolute inset-0 rounded-2xl bg-black/10 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="mt-5 flex-1 text-center">
        <h2 className="text-base font-semibold text-neutral-900 sm:text-lg dark:text-neutral-100">
          {collection.title}
        </h2>
        <span className="mt-0.5 block text-sm text-neutral-500 sm:mt-1.5 dark:text-neutral-400">
          {collection.description || `${collection.products?.length || 0} products`}
        </span>
      </div>
    </Link>
  );
};

export default CollectionCard2;