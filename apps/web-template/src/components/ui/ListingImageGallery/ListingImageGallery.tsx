'use client';

import './styles/index.css';

import { ArrowSmallLeftIcon } from '@heroicons/react/24/outline';
import { Modal as MantineModal, Skeleton } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { type Route } from 'next';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type FC, useEffect, useRef, useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import LikeSaveBtns from '../LikeSaveBtns';

import Modal from './components/Modal';
import { getNewParam } from './utils/urlUtils';
import { useLastViewedPhoto } from './utils/useLastViewedPhoto';

import { ListingGalleryImage } from './utils/types';

interface Props {
  images: ListingGalleryImage[];
  onClose?: () => void;
  testId?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for ListingImageGallery
function ListingImageGallerySkeleton({ testId }: { testId?: string }) {
  return (
    <div className=" " data-testid={`${testId}-skeleton`}>
      <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="mb-5 block w-full">
            <Skeleton height={Math.random() * 200 + 200} className="rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Error state for ListingImageGallery
function ListingImageGalleryError({ error, testId }: { error: string; testId?: string }) {
  return (
    <div
      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center"
      data-testid={`${testId}-error`}
    >
      <IconAlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
        Gallery failed to load
      </h3>
      <p className="text-red-500 dark:text-red-400">
        Image gallery could not be loaded. Please try again later.
      </p>
    </div>
  );
}

// Zero state for ListingImageGallery
function ListingImageGalleryEmpty({ testId }: { testId?: string }) {
  return (
    <div
      className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center"
      data-testid={`${testId}-empty`}
    >
      <svg
        className="w-16 h-16 text-gray-400 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-2">
        No images available
      </h3>
      <p className="text-gray-400 dark:text-gray-500">
        Images will appear here when they become available.
      </p>
    </div>
  );
}

const ListingImageGallery: FC<Props> = ({
  images,
  onClose,
  testId = 'listing-image-gallery',
  loading = false,
  error,
}) => {
  const searchParams = useSearchParams();
  const isShowModal = searchParams.get('modal');
  const photoId = searchParams.get('photoId');
  const router = useRouter();
  const [lastViewedPhoto, setLastViewedPhoto] = useLastViewedPhoto();
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
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
        onClose={() => onClose && onClose()}
      >
        <div className="fixed inset-0 overflow-y-auto">
          <div className="sticky z-10 top-0 p-4 xl:px-10 flex items-center justify-between bg-white">
            <Skeleton height={40} width={40} circle />
            <Skeleton height={40} width={120} />
          </div>
          <div className="flex min-h-full items-center justify-center sm:p-4 pt-0 text-center">
            <div className="w-full max-w-4xl mx-auto p-4 pt-0 text-left">
              <ListingImageGallerySkeleton testId={testId} />
            </div>
          </div>
        </div>
      </MantineModal>
    );
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
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
        onClose={() => onClose && onClose()}
      >
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center sm:p-4 pt-0 text-center">
            <div className="w-full max-w-4xl mx-auto p-4 pt-0 text-left">
              <ListingImageGalleryError error={currentError} testId={testId} />
            </div>
          </div>
        </div>
      </MantineModal>
    );
  }

  // Show zero state when no images
  if (!images || images.length === 0) {
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
        onClose={() => onClose && onClose()}
      >
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center sm:p-4 pt-0 text-center">
            <div className="w-full max-w-4xl mx-auto p-4 pt-0 text-left">
              <ListingImageGalleryEmpty testId={testId} />
            </div>
          </div>
        </div>
      </MantineModal>
    );
  }

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
    try {
      onClose && onClose();
    } catch (err) {
      setInternalError('Failed to close gallery');
    }
  };

  const renderContent = () => {
    return (
      <ErrorBoundary
        fallback={
          <ListingImageGalleryError error="Gallery content failed to render" testId={testId} />
        }
      >
        <div className=" " data-testid={`${testId}-content`}>
          {photoId && (
            <ErrorBoundary
              fallback={<div className="text-red-500 p-4">Modal failed to render</div>}
            >
              <Modal
                images={images}
                onClose={() => {
                  try {
                    // @ts-ignore - photoId is string from searchParams, but setLastViewedPhoto expects string | null
                    setLastViewedPhoto(photoId);
                    const params = new URLSearchParams(document.location.search);
                    params.delete('photoId');
                    router.push(`${thisPathname}/?${params.toString()}` as Route);
                  } catch (err) {
                    setInternalError('Failed to close modal');
                  }
                }}
              />
            </ErrorBoundary>
          )}

          <div className="columns-1 gap-4 sm:columns-2 xl:columns-3" data-testid={`${testId}-grid`}>
            {images.map(({ id, url }) => (
              <ErrorBoundary
                key={id}
                fallback={
                  <div className="mb-5 bg-red-100 dark:bg-red-900/20 p-4 rounded-lg text-red-600">
                    Image failed to load
                  </div>
                }
              >
                <div
                  className="after:content group relative mb-5 block w-full cursor-zoom-in after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight focus:outline-hidden"
                  data-testid={`${testId}-image-${id}`}
                  ref={id === Number(lastViewedPhoto) ? lastViewedPhotoRef : null}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    try {
                      const newUrl = getNewParam({
                        pathname: thisPathname,
                        searchParams: new URLSearchParams(searchParams.toString()),
                        value: id,
                      });
                      router.push(newUrl);
                    } catch (err) {
                      setInternalError('Failed to navigate to image');
                    }
                  }}
                  onKeyDown={(e) => {
                    try {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const newUrl = getNewParam({
                          pathname: thisPathname,
                          searchParams: new URLSearchParams(searchParams.toString()),
                          value: id,
                        });
                        router.push(newUrl);
                      }
                    } catch (err) {
                      setInternalError('Failed to navigate to image');
                    }
                  }}
                >
                  <ErrorBoundary
                    fallback={
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-8 flex items-center justify-center">
                        <IconAlertTriangle size={24} />
                      </div>
                    }
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
                  </ErrorBoundary>
                </div>
              </ErrorBoundary>
            ))}
          </div>
        </div>
      </ErrorBoundary>
    );
  };

  return (
    <ErrorBoundary
      fallback={<ListingImageGalleryError error="Gallery modal failed to render" testId={testId} />}
    >
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
          <ErrorBoundary
            fallback={
              <div className="sticky z-10 top-0 p-4 bg-white text-red-500">
                Header failed to render
              </div>
            }
          >
            <div className="sticky z-10 top-0 p-4 xl:px-10 flex items-center justify-between bg-white">
              <ErrorBoundary fallback={<div className="w-10 h-10 bg-red-100 rounded-full" />}>
                <button
                  className="focus:outline-hidden focus:ring-0 w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-100"
                  onClick={handleClose}
                >
                  <ArrowSmallLeftIcon className="w-6 h-6" />
                </button>
              </ErrorBoundary>
              <ErrorBoundary fallback={<div className="text-red-500">Buttons unavailable</div>}>
                <LikeSaveBtns />
              </ErrorBoundary>
            </div>
          </ErrorBoundary>

          <div className="flex min-h-full items-center justify-center sm:p-4 pt-0 text-center">
            <div className="w-full max-w-4xl mx-auto p-4 pt-0 text-left">{renderContent()}</div>
          </div>
        </div>
      </MantineModal>
    </ErrorBoundary>
  );
};

export { ListingImageGallery };
export default ListingImageGallery;
