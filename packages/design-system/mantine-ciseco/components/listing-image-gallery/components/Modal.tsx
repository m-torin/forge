'use client';

import { Modal } from '@mantine/core';
import { type Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getNewParam } from '../ListingImageGallery';

import SharedModal from './SharedModal';

import type { ListingGalleryImage } from '../utils/types';

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
  const photoId = searchParams?.get('photoId');
  const index = Number(photoId);

  const [direction, setDirection] = useState(0);
  const [curIndex, setCurIndex] = useState(index);

  function handleClose() {
    onClose && onClose();
  }

  function changePhotoId(newVal: number) {
    if (newVal > index) {
      setDirection(1);
    } else {
      setDirection(-1);
    }
    setCurIndex(newVal);
    router.push(`${thisPathname}/?${getNewParam({ value: newVal })}` as Route);
  }

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
  }, [index, images.length]);

  return (
    <Modal
      onClose={handleClose}
      opened={true}
      withCloseButton={false}
      classNames={{
        body: 'bg-black p-0',
        content: 'bg-black',
        header: 'bg-black',
        root: 'bg-black',
      }}
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
      fullScreen
      padding={0}
    >
      <SharedModal
        changePhotoId={changePhotoId}
        closeModal={handleClose}
        direction={direction}
        navigation={true}
        images={images}
        index={curIndex}
      />
    </Modal>
  );
}
