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
import { ListingGalleryImage } from './utils/types';
import { getNewParam } from './utils/urlUtils';
import { useLastViewedPhoto } from './utils/useLastViewedPhoto';

interface Props extends Record<string, any> {
  images: ListingGalleryImage[];
  onClose?: () => void;
  testId?: string;
}

const ListingImageGallery: FC<Props> = ({
  images,
  onClose,
  testId = 'listing-image-gallery',
}: any) => {
  const searchParams = useSearchParams();
  const isShowModal = searchParams.get('modal');
  const photoId = searchParams.get('photoId');
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
      <div className=" " data-testid={`${testId}-content`}>
        {photoId && (
          <Modal
            images={images}
            onClose={() => {
              // @ts-ignore - photoId is string from searchParams, but setLastViewedPhoto expects string | null
              setLastViewedPhoto(photoId);
              const params = new URLSearchParams(document.location.search);
              params.delete('photoId');
              router.push(`${thisPathname}/?${params.toString()}` as Route);
            }}
          />
        )}

        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3" data-testid={`${testId}-grid`}>
          {images.map(({ id, url }: any) => (
            <div
              key={id}
              className="after:content group relative mb-5 block w-full cursor-zoom-in after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight focus:outline-hidden"
              data-testid={`${testId}-image-${id}`}
              ref={id === Number(lastViewedPhoto) ? lastViewedPhotoRef : null}
              role="button"
              tabIndex={0}
              onClick={() => {
                const newUrl = getNewParam({
                  pathname: thisPathname,
                  searchParams: new URLSearchParams(searchParams.toString()),
                  value: id,
                });
                router.push(newUrl);
              }}
              onKeyDown={(e: any) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  const newUrl = getNewParam({
                    pathname: thisPathname,
                    searchParams: new URLSearchParams(searchParams.toString()),
                    value: id,
                  });
                  router.push(newUrl);
                }
              }}
            >
              <Image
                alt="chisfis listing gallery"
                className="transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110 focus:outline-hidden"
                height={480}
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 350px"
                src={url}
                style={{
                  transform: 'translate3d(0, 0, 0)',
                }}
                width={720}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <MantineModal
      classNames={{
        body: 'p-0',
        content: 'bg-white',
        inner: 'p-0',
        root: 'z-40',
      }}
      fullScreen
      opened={!!isShowModal}
      transitionProps={{
        duration: 300,
        transition: 'fade',
      }}
      withCloseButton={false}
      onClose={handleClose}
    >
      <div className="fixed inset-0 overflow-y-auto">
        <div className="sticky z-10 top-0 p-4 xl:px-10 flex items-center justify-between bg-white">
          <button
            className="focus:outline-hidden focus:ring-0 w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-100"
            onClick={handleClose}
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
