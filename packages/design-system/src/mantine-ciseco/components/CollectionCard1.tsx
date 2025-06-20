'use client';

import clsx from 'clsx';
import { type FC } from 'react';

import { type TCollection } from '../data/types';
import { useLocalizeHref } from '../hooks/useLocale';

import { Link } from './Link';
import NcImage from './shared/NcImage/NcImage';

interface Props extends Record<string, any> {
  className?: string;
  collection: TCollection;
  'data-testid'?: string;
  size?: 'large' | 'normal';
}

const CollectionCard1: FC<Props> = ({
  className = '',
  collection,
  'data-testid': testId = 'collection-card',
  size = 'normal',
}) => {
  const localizeHref = useLocalizeHref();

  if (!collection.handle) {
    return null;
  }
  return (
    <Link
      className={`flex items-center ${className}`}
      data-testid={testId}
      href={localizeHref(`/collections/${collection.handle}`) as any}
    >
      {collection.image?.src && (
        <NcImage
          alt={collection.image.alt}
          containerClassName={clsx(
            'relative mr-4 shrink-0 overflow-hidden rounded-lg',
            size === 'large' ? 'size-20' : 'size-12',
          )}
          data-testid="collection-image"
          fill
          sizes="(max-width: 640px) 100vw, 40vw"
          src={collection.image}
        />
      )}
      <div>
        <h2
          className={clsx(
            'font-semibold nc-card-title text-neutral-900 dark:text-neutral-100',
            size === 'large' ? 'text-lg' : 'text-base',
          )}
          data-testid="collection-title"
        >
          {collection.title}
        </h2>
        <span
          className={`${
            size === 'large' ? 'text-sm' : 'text-xs'
          } mt-[2px] block text-neutral-500 dark:text-neutral-400`}
        >
          {collection.sortDescription}
        </span>
      </div>
    </Link>
  );
};

export default CollectionCard1;
