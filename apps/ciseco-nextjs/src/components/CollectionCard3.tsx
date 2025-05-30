import { type TCollection } from '@/data/data';
import ButtonSecondary from '@/shared/Button/ButtonSecondary';
import Image from 'next/image';
import { type FC } from 'react';

import { Link } from './Link';

interface Props {
  className?: string;
  collection: TCollection;
}

const CollectionCard3: FC<Props> = ({ className = '', collection }) => {
  if (!collection.handle) {
    return null;
  }

  return (
    <Link href={`/collections/${collection.handle}` as const} className={`block ${className}`}>
      <div
        className={`group aspect-w-16 relative h-0 w-full overflow-hidden rounded-2xl aspect-h-11 sm:aspect-h-9 ${collection.color}`}
      >
        <div>
          <div className="absolute inset-5 sm:inset-8">
            {collection.image && (
              <div className="absolute end-0 h-full w-full max-w-52">
                <Image
                  className="object-contain object-center drop-shadow-xl"
                  alt={collection.image.alt || ''}
                  fill
                  src={collection.image}
                />
              </div>
            )}
          </div>
        </div>
        <span className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover:opacity-40" />

        <div>
          <div className="absolute inset-5 flex flex-col sm:inset-8">
            <div className="max-w-xs">
              <span className="mb-2 block text-sm text-neutral-700">{collection.title}</span>
              {collection.description && (
                <h2
                  dangerouslySetInnerHTML={{ __html: collection.sortDescription || '' }}
                  className="text-xl font-semibold text-neutral-900 md:text-2xl"
                 />
              )}
            </div>
            <div className="mt-auto">
              <ButtonSecondary
                fontSize="text-sm font-medium"
                className="nc-shadow-lg"
                sizeClass="py-3 px-4 sm:py-3.5 sm:px-6"
              >
                Show me all
              </ButtonSecondary>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CollectionCard3;
