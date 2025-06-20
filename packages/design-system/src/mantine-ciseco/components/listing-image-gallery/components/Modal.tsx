'use client';

import { Modal } from '@mantine/core';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ListingGalleryImage } from '../utils/types';
import { getNewParam } from '../utils/urlUtils';

import SharedModal from './SharedModal';

export default function ImageGalleryModal({
  images,
  onClose,
}: {
  images: ListingGalleryImage[];
  onClose?: () => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const thisPathname = usePathname();
  const photoId = searchParams.get('photoId');
  const index = Number(photoId);

  const [direction, setDirection] = useState(0);
  const [curIndex, setCurIndex] = useState(index);

  function handleClose() {
    onClose && onClose();
  }

  const changePhotoId = useCallback(
    (newVal: number) => {
      if (newVal > index) {
        setDirection(1);
      } else {
        setDirection(-1);
      }
      setCurIndex(newVal);
      router.push(
        getNewParam({
          pathname: thisPathname,
          searchParams: new URLSearchParams(searchParams.toString()),
          value: newVal,
        }),
      );
    },
    [index, router, thisPathname, searchParams],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' && index + 1 < images.length) {
        changePhotoId(index + 1);
      } else if (event.key === 'ArrowLeft' && index > 0) {
        changePhotoId(index - 1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [index, images.length, changePhotoId]);

  return (
    <Modal
      classNames={{
        body: 'bg-black p-0',
        content: 'bg-black',
        header: 'bg-black',
        root: 'bg-black',
      }}
      fullScreen
      opened={true}
      padding={0}
      styles={{
        body: {
          alignItems: 'center',
          backgroundColor: 'black',
          display: 'flex',
          height: '100vh',
          justifyContent: 'center',
        },
        content: {
          backgroundColor: 'black',
        },
      }}
      withCloseButton={false}
      onClose={handleClose}
    >
      <SharedModal
        changePhotoId={changePhotoId}
        closeModal={handleClose}
        direction={direction}
        images={images}
        index={curIndex}
        navigation={true}
      />
    </Modal>
  );
}
