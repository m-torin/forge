'use client'

import './styles/index.css'

import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { ArrowSmallLeftIcon } from '@heroicons/react/24/outline'
import { type Route } from 'next'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { type FC, Fragment, useEffect, useRef } from 'react'

import LikeSaveBtns from '../LikeSaveBtns'

import Modal from './components/Modal'
import { useLastViewedPhoto } from './utils/useLastViewedPhoto'

import type { ListingGalleryImage } from './utils/types'

export const getNewParam = ({ paramName = 'photoId', value }: { paramName?: string; value: string | number }) => {
  const params = new URLSearchParams(document.location.search)
  params.set(paramName, String(value))
  return params.toString()
}

interface Props {
  images: ListingGalleryImage[]
  onClose?: () => void
}

const ListingImageGallery: FC<Props> = ({ images, onClose }) => {
  const searchParams = useSearchParams()
  const isShowModal = searchParams?.get('modal')
  const photoId = searchParams?.get('photoId')
  const router = useRouter()
  const [lastViewedPhoto, setLastViewedPhoto] = useLastViewedPhoto()

  const lastViewedPhotoRef = useRef<HTMLDivElement>(null)
  const thisPathname = usePathname()
  useEffect(() => {
    // This effect keeps track of the last viewed photo in the modal to keep the index page in sync when the user navigates back
    if (lastViewedPhoto && !photoId) {
      lastViewedPhotoRef.current?.scrollIntoView({ block: 'center' })
      setLastViewedPhoto(null)
    }
  }, [photoId, lastViewedPhoto, setLastViewedPhoto])

  const handleClose = () => {
    onClose && onClose()
  }

  const renderContent = () => {
    return (
      <div className=" ">
        {photoId && (
          <Modal
            onClose={() => {
              // @ts-ignore
              setLastViewedPhoto(photoId)
              const params = new URLSearchParams(document.location.search)
              params.delete('photoId')
              router.push(`${thisPathname}/?${params.toString()}` as Route)
            }}
            images={images}
          />
        )}

        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
          {images.map(({ id, url }) => (
            <div
              key={id}
              ref={id === Number(lastViewedPhoto) ? lastViewedPhotoRef : null}
              onClick={() => {
                const newPathname = getNewParam({ value: id })
                router.push(`${thisPathname}/?${newPathname}` as Route)
              }}
              className="after:content after:shadow-highlight focus:outline-hidden group relative mb-5 block w-full cursor-zoom-in after:pointer-events-none after:absolute after:inset-0 after:rounded-lg"
            >
              <Image
                width={720}
                className="focus:outline-hidden transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110"
                style={{
                  transform: 'translate3d(0, 0, 0)',
                }}
                alt="chisfis listing gallery "
                height={480}
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 350px"
                src={url}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Transition show={!!isShowModal} appear as={Fragment}>
      <Dialog onClose={handleClose} className="relative z-40" as="div">
        <TransitionChild
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          enter="ease-out duration-300"
          leave="ease-in duration-200"
        >
          <div className="fixed inset-0 bg-white" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between bg-white p-4 xl:px-10">
            <button
              onClick={handleClose}
              className="focus:outline-hidden flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100 focus:ring-0"
            >
              <ArrowSmallLeftIcon className="h-6 w-6" />
            </button>
            <LikeSaveBtns />
          </div>

          <div className="flex min-h-full items-center justify-center pt-0 text-center sm:p-4">
            <TransitionChild
              enterFrom="opacity-0 translate-y-5"
              enterTo="opacity-100 translate-y-0"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-5"
              enter="ease-out duration-300"
              leave="ease-in duration-200"
            >
              <DialogPanel className="max-w-(--breakpoint-lg) mx-auto w-full transform p-4 pt-0 text-left transition-all">
                {renderContent()}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default ListingImageGallery
