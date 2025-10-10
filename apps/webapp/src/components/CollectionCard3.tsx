import { TCollection } from '@/data/data';
import { routes } from '@/lib/routes';
import { Button } from '@/shared/Button/Button';
import Image from 'next/image';
import { FC } from 'react';
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
    <div className={`group/CollectionCard3 relative block ${className}`}>
      <div
        className={`aspect-w-16 aspect-h-11 sm:aspect-h-9 relative h-0 w-full overflow-hidden rounded-2xl ${collection.color}`}
      >
        <div>
          <div className="absolute inset-5 sm:inset-8">
            {collection.image && (
              <div className="absolute end-0 h-full w-full max-w-52">
                <Image
                  alt={collection.image.alt || ''}
                  src={collection.image}
                  fill
                  className="object-contain object-center drop-shadow-xl"
                  sizes="300px"
                />
              </div>
            )}
          </div>
        </div>
        <span className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover/CollectionCard3:opacity-40" />

        <div>
          <div className="absolute inset-5 flex flex-col sm:inset-8">
            <div className="max-w-xs">
              <span className="mb-2 block text-sm text-neutral-700">{collection.title}</span>
              {collection.description && (
                <h2
                  className="text-xl font-semibold text-neutral-900 md:text-2xl"
                  dangerouslySetInnerHTML={{ __html: collection.sortDescription || '' }}
                />
              )}
            </div>
            <div className="mt-auto">
              <Button color="light" className="[--btn-border:white]/0">
                Show me all
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Link href={routes.collections.detail(collection.handle)} className="absolute inset-0">
        <span className="sr-only">View {collection.title} collection</span>
      </Link>
    </div>
  );
};

export default CollectionCard3;
