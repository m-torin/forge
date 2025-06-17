import { TCollection } from '@/data/data'
import NcImage from '@/shared/NcImage/NcImage'
import clsx from 'clsx'
import { FC } from 'react'
import { Link } from './Link'

interface Props {
  className?: string
  size?: 'large' | 'normal'
  collection: TCollection
}

const CollectionCard1: FC<Props> = ({ className = '', size = 'normal', collection }) => {
  if (!collection.handle) {
    return null
  }
  return (
    <Link href={'/collections/' + collection.handle} className={`flex items-center ${className}`}>
      {collection.image?.src && (
        <NcImage
          containerClassName={clsx(
            'relative mr-4 shrink-0 overflow-hidden rounded-lg',
            size === 'large' ? 'size-20' : 'size-12'
          )}
          src={collection.image}
          alt={collection.image.alt}
          sizes="(max-width: 640px) 100vw, 40vw"
          fill
        />
      )}
      <div>
        <h2
          className={clsx(
            'font-semibold nc-card-title text-neutral-900 dark:text-neutral-100',
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
          {collection.sortDescription}
        </span>
      </div>
    </Link>
  )
}

export default CollectionCard1
