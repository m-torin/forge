import { TCollection } from '@/data/data'
import NcImage from '@/shared/NcImage/NcImage'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'
import { FC } from 'react'

interface CollectionCard6Props {
  className?: string
  bgSvgUrl?: string
  collection: TCollection
}

const CollectionCard6: FC<CollectionCard6Props> = ({ className = '', bgSvgUrl, collection }) => {
  if (!collection.handle) {
    return null
  }

  return (
    <div
      className={`group aspect-w-1 relative h-0 w-full overflow-hidden rounded-3xl bg-white transition-shadow aspect-h-1 hover:nc-shadow-lg dark:bg-neutral-900 ${className}`}
    >
      <div>
        <div className="absolute inset-0 opacity-10">{bgSvgUrl && <Image src={bgSvgUrl} alt="svgbg" fill />}</div>

        <div className="absolute inset-5 flex flex-col items-center justify-between">
          <div className="flex items-center justify-center">
            {collection.image?.src && (
              <NcImage
                alt={collection.image?.alt}
                fill
                src={collection.image}
                containerClassName={`size-20 rounded-full relative overflow-hidden z-0 ${collection.color}`}
              />
            )}
          </div>

          <div className="text-center">
            <span className={`mb-1 block text-sm text-neutral-500 dark:text-neutral-400`}>
              {collection.sortDescription}
            </span>
            <h2 className={`text-lg font-semibold sm:text-xl`}>{collection.title}</h2>
          </div>

          <Link
            href={'/collections/' + collection.handle}
            className="flex items-center text-sm font-medium transition-colors group-hover:text-primary-500"
          >
            <span>See Collection</span>
            <ArrowRightIcon className="ml-2.5 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CollectionCard6
