'use client';

import { type TCollection } from './types';
import Link from 'next/link';

interface Props {
  collection: TCollection;
}

const CollectionCard3 = ({ collection }: Props) => {
  return (
    <div className="relative block group">
      <Link href={`/collections/${collection.handle}`}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
          {collection.image ? (
            <img
              alt={collection.image.alt || collection.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              height={collection.image.height}
              src={collection.image.src}
              width={collection.image.width}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-400">No Image</div>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-base font-medium text-neutral-900 dark:text-white group-hover:text-primary-600">
            {collection.title}
          </h3>
          {collection.description && (
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {collection.description}
            </p>
          )}
          {collection.count && (
            <p className="mt-1 text-xs text-neutral-500">
              {collection.count} {collection.count === 1 ? 'item' : 'items'}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default CollectionCard3;
