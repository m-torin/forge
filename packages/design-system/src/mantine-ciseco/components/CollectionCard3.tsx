'use client';

import Image from 'next/image';
import { type FC } from 'react';

import { type TCollection } from '../data/types';
import { useLocalizeHref } from '../hooks/useLocale';

import { Link } from './Link';
import ButtonSecondary from './shared/Button/ButtonSecondary';

interface Props extends Record<string, any> {
  className?: string;
  collection: TCollection;
  'data-testid'?: string;
}

const CollectionCard3: FC<Props> = ({
  className = '',
  collection,
  'data-testid': testId = 'collection-card-3',
}) => {
  const localizeHref = useLocalizeHref();

  if (!collection.handle) {
    return null;
  }

  return (
    <Link
      className={`block ${className}`}
      data-testid={testId}
      href={localizeHref(`/collections/${collection.handle}`) as any}
    >
      <div
        className={`group aspect-[16/11] sm:aspect-[16/9] relative w-full overflow-hidden rounded-2xl ${collection.color}`}
      >
        <div>
          <div className="absolute inset-5 sm:inset-8">
            {collection.image && (
              <div className="absolute end-0 h-full w-full max-w-52">
                <Image
                  alt={collection.image.alt ?? ''}
                  className="object-contain object-center drop-shadow-xl"
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
                  className="text-xl font-semibold text-neutral-900 md:text-2xl"
                  dangerouslySetInnerHTML={{ __html: collection.sortDescription ?? '' }}
                />
              )}
            </div>
            <div className="mt-auto">
              <ButtonSecondary
                className="nc-shadow-lg"
                fontSize="text-sm font-medium"
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
