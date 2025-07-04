import { variants } from '@/utils/animationVariants'
import {
  ArrowTopRightOnSquareIcon,
  ArrowUturnLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { range } from '../utils/range'
import type { ListingGalleryImage } from '../utils/types'
import Twitter from './Icons/Twitter'

interface SharedModalProps {
  index: number
  images: ListingGalleryImage[]
  currentPhoto?: ListingGalleryImage
  changePhotoId: (newVal: number) => void
  closeModal: () => void
  navigation: boolean
  direction?: number
}

export default function SharedModal({
  index,
  images,
  changePhotoId,
  closeModal,
  navigation,
  currentPhoto,
  direction,
}: SharedModalProps) {
  const [loaded, setLoaded] = useState(false)

  let filteredImages = images?.filter((img: ListingGalleryImage) => range(index - 15, index + 15).includes(img.id))

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (index < images?.length - 1) {
        changePhotoId(index + 1)
      }
    },
    onSwipedRight: () => {
      if (index > 0) {
        changePhotoId(index - 1)
      }
    },
    trackMouse: true,
  })

  let currentImage = images ? images[index] : currentPhoto

  return (
    <MotionConfig
      transition={{
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
    >
      <div
        className="wide:h-full xl:taller-than-854:h-auto relative z-50 flex aspect-3/2 w-full max-w-7xl items-center"
        {...handlers}
      >
        {/* Main image */}
        <div className="w-full overflow-hidden">
          <div className="relative flex aspect-3/2 items-center justify-center">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={index}
                custom={direction}
                variants={variants()}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute"
              >
                <Image
                  src={currentImage?.url || ''}
                  width={navigation ? 1280 : 1920}
                  height={navigation ? 853 : 1280}
                  priority
                  alt="Chisfis listing gallery"
                  onLoadingComplete={() => setLoaded(true)}
                  sizes="(max-width: 1025px) 100vw, 1280px"
                  className="object-contain"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Buttons + bottom nav bar */}
        <div className="absolute inset-0 mx-auto flex max-w-7xl items-center justify-center">
          {/* Buttons */}
          {loaded && (
            <div className="relative aspect-3/2 max-h-full w-full">
              {navigation && (
                <>
                  {index > 0 && (
                    <button
                      className="absolute top-[calc(50%-16px)] left-3 rounded-full bg-black/50 p-3 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white focus:outline-hidden"
                      style={{ transform: 'translate3d(0, 0, 0)' }}
                      onClick={() => changePhotoId(index - 1)}
                    >
                      <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                  )}
                  {index + 1 < images.length && (
                    <button
                      className="absolute top-[calc(50%-16px)] right-3 rounded-full bg-black/50 p-3 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white focus:outline-hidden"
                      style={{ transform: 'translate3d(0, 0, 0)' }}
                      onClick={() => changePhotoId(index + 1)}
                    >
                      <ChevronRightIcon className="h-6 w-6" />
                    </button>
                  )}
                </>
              )}
              <div className="absolute top-0 right-0 flex items-center gap-2 p-3 text-white">
                {navigation ? (
                  <a
                    href={'#'}
                    className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
                    target="_blank"
                    title="Open fullsize version"
                    rel="noreferrer"
                  >
                    <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                  </a>
                ) : (
                  <a
                    href={`https://twitter.com/intent/tweet?text=Check%20out%20this%20pic%20from%20Chisfis%20!%0A%0A${location.href}`}
                    className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
                    target="_blank"
                    title="Open fullsize version"
                    rel="noreferrer"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
              </div>
              <div className="absolute top-0 left-0 flex items-center gap-2 p-3 text-white">
                <button
                  onClick={() => closeModal()}
                  className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
                >
                  {navigation ? <XMarkIcon className="h-5 w-5" /> : <ArrowUturnLeftIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}
          {/* Bottom Nav bar */}
          {navigation && (
            <div className="fixed inset-x-0 bottom-0 z-40 overflow-hidden bg-linear-to-b from-black/0 to-black/60">
              <motion.div initial={false} className="mx-auto mt-6 mb-6 flex aspect-3/2 h-14">
                <AnimatePresence initial={false}>
                  {filteredImages.map(({ id, url }) => (
                    <motion.button
                      initial={{
                        width: '0%',
                        x: `${Math.max((index - 1) * -100, 15 * -100)}%`,
                      }}
                      animate={{
                        scale: id === index ? 1.25 : 1,
                        width: '100%',
                        x: `${Math.max(index * -100, 15 * -100)}%`,
                      }}
                      exit={{ width: '0%' }}
                      onClick={() => changePhotoId(id)}
                      key={id}
                      className={`${
                        id === index ? 'z-20 rounded-md shadow-sm shadow-black/50' : 'z-10'
                      } ${id === 0 ? 'rounded-l-md' : ''} ${
                        id === images.length - 1 ? 'rounded-r-md' : ''
                      } relative inline-block w-full shrink-0 transform-gpu overflow-hidden focus:outline-hidden`}
                    >
                      <Image
                        alt="small photos on the bottom"
                        width={180}
                        height={120}
                        className={`${
                          id === index
                            ? 'brightness-110 hover:brightness-110'
                            : 'brightness-50 contrast-125 hover:brightness-75'
                        } h-full transform object-cover transition`}
                        src={url || ''}
                      />
                    </motion.button>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </MotionConfig>
  )
}
