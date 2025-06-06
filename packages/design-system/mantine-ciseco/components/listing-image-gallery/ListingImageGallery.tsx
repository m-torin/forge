'use client';

import './styles/index.css';

import { ArrowSmallLeftIcon } from '@heroicons/react/24/outline';
import { Modal as MantineModal } from '@mantine/core';
import { type Route } from 'next';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type FC, useEffect, useRef } from 'react';

import LikeSaveBtns from '../LikeSaveBtns';

import Modal from './components/Modal';
import { useLastViewedPhoto } from './utils/useLastViewedPhoto';

import type { ListingGalleryImage } from './utils/types';

export const getNewParam = ({
  paramName = 'photoId',
  value,
}: {
  paramName?: string;
  value: string | number;
}) => {
  const params = new URLSearchParams(document.location.search);
  params.set(paramName, String(value));
  return params.toString();
};

interface Props {
  images: ListingGalleryImage[];
  onClose?: () => void;
}

const ListingImageGallery: FC<Props> = ({ images, onClose }) => {
  const searchParams = useSearchParams();
  const isShowModal = searchParams?.get('modal');
  const photoId = searchParams?.get('photoId');
  const router = useRouter();
  const [lastViewedPhoto, setLastViewedPhoto] = useLastViewedPhoto();

  const lastViewedPhotoRef = useRef<HTMLDivElement>(null);
  const thisPathname = usePathname();
  useEffect(() => {
    // This effect keeps track of the last viewed photo in the modal to keep the index page in sync when the user navigates back
    if (lastViewedPhoto && !photoId) {
      lastViewedPhotoRef.current?.scrollIntoView({ block: 'center' });
      setLastViewedPhoto(null);
    }
  }, [photoId, lastViewedPhoto, setLastViewedPhoto]);

  const handleClose = () => {
    onClose && onClose();
  };

  const renderContent = () => {
    return (
      <div className=" ">
        {photoId && (
          <Modal
            onClose={() => {
              // @ts-ignore
              setLastViewedPhoto(photoId);
              const params = new URLSearchParams(document.location.search);
              params.delete('photoId');
              router.push(`${thisPathname}/?${params.toString()}` as Route);
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
                const newPathname = getNewParam({ value: id });
                router.push(`${thisPathname}/?${newPathname}` as Route);
              }}
              className="after:content group relative mb-5 block w-full cursor-zoom-in after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight focus:outline-hidden"
            >
              <Image
                width={720}
                className="transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110 focus:outline-hidden"
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
    );
  };

  return (
    <MantineModal
      onClose={handleClose}
      opened={!!isShowModal}
      transitionProps={{
        duration: 300,
        transition: 'fade',
      }}
      withCloseButton={false}
      classNames={{
        body: 'p-0',
        content: 'bg-white',
        inner: 'p-0',
        root: 'z-40',
      }}
      fullScreen
    >
      <div className="fixed inset-0 overflow-y-auto">
        <div className="sticky z-10 top-0 p-4 xl:px-10 flex items-center justify-between bg-white">
          <button
            onClick={handleClose}
            className="focus:outline-hidden focus:ring-0 w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-100"
          >
            <ArrowSmallLeftIcon className="w-6 h-6" />
          </button>
          <LikeSaveBtns />
        </div>

        <div className="flex min-h-full items-center justify-center sm:p-4 pt-0 text-center">
          <div className="w-full max-w-(--breakpoint-lg) mx-auto p-4 pt-0 text-left">
            {renderContent()}
          </div>
        </div>
      </div>
    </MantineModal>
  );
};

export { ListingImageGallery };
export default ListingImageGallery;
