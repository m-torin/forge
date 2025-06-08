'use client';

import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';
import { type Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { getNewParam } from '../ListingImageGallery';

import SharedModal from './SharedModal';

import type { ListingGalleryImage } from '../utils/types';

export default function Modal({
  images,
  onClose,
}: {
  images: ListingGalleryImage[];
  onClose?: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
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
  }, [index, images.length, changePhotoId]);

  return (
    <Dialog
      initialFocus={overlayRef}
      onClose={handleClose}
      open={true}
      className="fixed inset-0 z-50 flex items-center justify-center "
      static
    >
      <motion.div
        key="backdrop"
        ref={overlayRef}
        onClick={handleClose}
        className="fixed inset-0 z-30 bg-black"
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
      />
      <SharedModal
        changePhotoId={changePhotoId}
        closeModal={handleClose}
        direction={direction}
        navigation={true}
        images={images}
        index={curIndex}
      />
    </Dialog>
  );
}
