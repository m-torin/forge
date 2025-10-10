'use client';

import { Button } from '@/shared/Button/Button';
import ButtonClose from '@/shared/Button/ButtonClose';
import { CloseButton, Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { Squares2X2Icon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

const EmblaCarousel = ({ images, option }: { images: string[]; option: EmblaOptionsType }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel({
    ...option,
    direction: 'ltr',
  });
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    ...option,
    containScroll: 'keepSnaps',
    dragFree: true,
    direction: 'ltr',
  });

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || !emblaThumbsApi) return;
      emblaMainApi.scrollTo(index);
    },
    [emblaMainApi, emblaThumbsApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    setSelectedIndex(emblaMainApi.selectedScrollSnap());
    emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap());
  }, [emblaMainApi, emblaThumbsApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();

    emblaMainApi.on('select', onSelect).on('reInit', onSelect);
  }, [emblaMainApi, onSelect]);

  return (
    <div className="embla relative size-full">
      <div
        className="embla__viewport relative mx-auto size-full overflow-hidden"
        ref={emblaMainRef}
      >
        <div className="embla__container size-full">
          {images.map(image => (
            <div
              className="embla__slide relative z-50 flex basis-full items-center justify-center"
              key={image}
            >
              <Image
                alt="Slide image"
                src={image}
                width={1280}
                height={853}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute right-2.5 top-2.5 z-50 sm:right-4 sm:top-4">
            <CloseButton as={ButtonClose}>
              <span className="sr-only">Close</span>
            </CloseButton>
          </div>
        </div>
      </div>

      <div className="embla-thumbs fixed inset-x-0 bottom-5 z-10">
        <div className="embla-thumbs__viewport mx-auto max-w-28" ref={emblaThumbsRef}>
          <div className="embla-thumbs__container flex">
            {images.map((image, index) => (
              <button
                key={image}
                className={clsx(
                  'aspect-5/3 relative flex w-24 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 transition-[transform,filter] duration-300 ease-in-out',
                  index === selectedIndex
                    ? 'z-10 scale-125 overflow-hidden rounded-md brightness-100'
                    : 'brightness-50 hover:brightness-95',
                )}
                onClick={() => onThumbClick(index)}
                aria-label={`View image ${index + 1}`}
                type="button"
              >
                <Image
                  alt="Slide image"
                  src={image}
                  fill
                  sizes="100px"
                  className="object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface Props {
  images: string[];
  gridType?: 'grid1' | 'grid2' | 'grid3' | 'grid4' | 'grid5';
  className?: string;
}
const GalleryImages = ({ images, gridType = 'grid1', className }: Props) => {
  let [isOpen, setIsOpen] = useState(false);
  let [startIndex, setStartIndex] = useState(0);

  const handleOpenDialog = (index = 0) => {
    setStartIndex(index);
    setIsOpen(true);
  };

  return (
    <>
      <div className={className}>
        {gridType === 'grid1' && (
          <HeaderGalleryGrid1 images={images} handleOpenDialog={handleOpenDialog} />
        )}
        {gridType === 'grid2' && (
          <HeaderGalleryGrid2 images={images} handleOpenDialog={handleOpenDialog} />
        )}
        {gridType === 'grid3' && (
          <HeaderGalleryGrid3 images={images} handleOpenDialog={handleOpenDialog} />
        )}
        {gridType === 'grid4' && (
          <HeaderGalleryGrid4 images={images} handleOpenDialog={handleOpenDialog} />
        )}
        {gridType === 'grid5' && (
          <HeaderGalleryGrid5 images={images} handleOpenDialog={handleOpenDialog} />
        )}
      </div>

      {/* Dialog for full-screen image gallery */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        {/* The backdrop, rendered as a fixed sibling to the panel container */}
        <DialogBackdrop className="fixed inset-0 bg-black" />

        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 flex w-screen items-center justify-center">
          <DialogPanel
            transition
            className="data-closed:opacity-0 relative mx-auto aspect-[3/2] max-h-full w-full max-w-7xl flex-1 transition"
          >
            <EmblaCarousel images={images} option={{ startIndex, slidesToScroll: 1 }} />
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

const HeaderGalleryGrid1 = ({
  images,
  handleOpenDialog,
}: {
  images: string[];
  handleOpenDialog: (index?: number) => void;
}) => {
  if (!images.length) return null;

  return (
    <header className="relative md:grid md:grid-cols-4 md:gap-6">
      <div
        className="aspect-4/5 md:aspect-4/4 relative size-full md:col-span-2"
        onClick={() => handleOpenDialog(0)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpenDialog(0);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Open image gallery - main image"
      >
        <Image
          fill
          className="rounded-xl object-cover transition-[filter] hover:brightness-95"
          src={images[0]}
          alt="bigger"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 80vw"
        />
      </div>
      <div className="hidden md:col-span-2 md:grid md:grid-cols-2 md:gap-6">
        {images.slice(1, 5).map((item, index) => (
          <div
            className="aspect-2/2 relative size-full"
            key={item}
            onClick={() => handleOpenDialog(index + 1)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOpenDialog(index + 1);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Open image gallery - image ${index + 2}`}
          >
            <Image
              fill
              className="rounded-xl object-cover brightness-100 transition-[filter] hover:brightness-95"
              src={item || ''}
              alt="others"
              sizes="(max-width: 768px) 33vw, 33vw"
            />
          </div>
        ))}
      </div>

      <div className="absolute bottom-3 left-3">
        <Button
          size="smaller"
          color="light"
          onClick={() => handleOpenDialog()}
          className="[--btn-border:white]/0"
        >
          <Squares2X2Icon className="h-5 w-5" />
          <span className="text-sm/6 font-normal">Show all photos</span>
        </Button>
      </div>
    </header>
  );
};
const HeaderGalleryGrid2 = ({
  images,
  handleOpenDialog,
}: {
  images: string[];
  handleOpenDialog: (index?: number) => void;
}) => {
  if (!images.length) return null;

  return (
    <header className="relative md:grid md:grid-cols-4">
      <div
        className="aspect-4/5 md:aspect-5/4 relative size-full md:col-span-3"
        onClick={() => handleOpenDialog(0)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpenDialog(0);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Open image gallery - main image"
      >
        <Image
          alt=""
          src={images[0]}
          fill
          className="rounded-xl object-cover brightness-100 transition-[filter] hover:brightness-95"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 80vw"
        />
      </div>

      <div className="hidden md:grid md:grid-cols-1 md:gap-4 md:ps-4">
        {images.slice(1, 4).map((item, index) => (
          <div
            className="aspect-3/2 relative size-full"
            key={item}
            onClick={() => handleOpenDialog(index + 1)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOpenDialog(index + 1);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Open image gallery - image ${index + 2}`}
          >
            <Image
              alt=""
              src={item}
              fill
              className="rounded-xl object-cover brightness-100 transition-[filter] hover:brightness-95"
              sizes="(max-width: 768px) 33vw, 33vw"
            />
          </div>
        ))}
      </div>

      <div className="absolute bottom-3 left-3">
        <Button color="light" onClick={() => handleOpenDialog()} className="[--btn-border:white]/0">
          <Squares2X2Icon className="h-5 w-5" />
          <span className="text-sm/6 font-normal">Show all photos</span>
        </Button>
      </div>
    </header>
  );
};
const HeaderGalleryGrid3 = ({
  images,
  handleOpenDialog,
}: {
  images: string[];
  handleOpenDialog: (index?: number) => void;
}) => {
  if (!images.length) return null;

  return (
    <header className="relative md:grid md:grid-cols-3 md:gap-6">
      <div
        className="aspect-4/5 md:aspect-3/4 relative size-full"
        onClick={() => handleOpenDialog(0)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpenDialog(0);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Open image gallery - main image"
      >
        <Image
          alt=""
          src={images[0]}
          fill
          className="rounded-xl object-cover brightness-100 transition-[filter] hover:brightness-95"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 80vw"
        />
      </div>

      <div className="hidden md:grid md:grid-cols-1 md:gap-6">
        <div
          className="aspect-3/2 relative size-full"
          onClick={() => handleOpenDialog(1)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpenDialog(1);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Open image gallery - image 2"
        >
          {images[1] && (
            <Image
              alt=""
              src={images[1]}
              fill
              className="rounded-xl object-cover brightness-100 transition-[filter] hover:brightness-95"
              sizes="(max-width: 768px) 33vw, 33vw"
            />
          )}
        </div>
        <div
          className="aspect-3/2 relative size-full"
          onClick={() => handleOpenDialog(2)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpenDialog(2);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Open image gallery - image 3"
        >
          {images[2] && (
            <Image
              alt=""
              src={images[2]}
              fill
              className="rounded-xl object-cover brightness-100 transition-[filter] hover:brightness-95"
              sizes="(max-width: 768px) 33vw, 33vw"
            />
          )}
        </div>
      </div>

      <div
        className="md:aspect-3/4 relative hidden size-full md:block"
        onClick={() => handleOpenDialog(3)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpenDialog(3);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Open image gallery - image 4"
      >
        {images[3] && (
          <Image
            alt=""
            src={images[3]}
            fill
            className="rounded-xl object-cover brightness-100 transition-[filter] hover:brightness-95"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 80vw"
          />
        )}
      </div>

      <div className="absolute bottom-3 left-3">
        <Button color="light" onClick={() => handleOpenDialog()} className="[--btn-border:white]/0">
          <Squares2X2Icon className="h-5 w-5" />
          <span className="text-sm/6 font-normal">Show all photos</span>
        </Button>
      </div>
    </header>
  );
};
const HeaderGalleryGrid4 = ({
  images,
  handleOpenDialog,
}: {
  images: string[];
  handleOpenDialog: (index?: number) => void;
}) => {
  if (!images.length) return null;

  return (
    <header className="relative md:grid md:grid-cols-3 md:gap-6">
      <div
        className="aspect-4/5 md:aspect-3/4 relative size-full"
        onClick={() => handleOpenDialog(0)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpenDialog(0);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Open image gallery - main image"
      >
        <Image
          alt=""
          src={images[0]}
          fill
          className="rounded-xl object-cover brightness-100 transition-[filter] hover:brightness-95"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 80vw"
        />
      </div>

      <div
        className="aspect-4/5 md:aspect-3/4 relative hidden size-full md:block"
        onClick={() => handleOpenDialog(3)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpenDialog(3);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Open image gallery - image 4"
      >
        {images[3] && (
          <Image
            alt=""
            src={images[3]}
            fill
            className="rounded-xl object-cover brightness-100 transition-[filter] hover:brightness-95"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 80vw"
          />
        )}
      </div>

      <div className="hidden md:grid md:grid-cols-1 md:gap-6">
        <div
          className="aspect-3/2 relative size-full"
          onClick={() => handleOpenDialog(1)}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpenDialog(1);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Open image gallery - image 2"
        >
          {images[1] && (
            <Image
              alt=""
              src={images[1]}
              fill
              className="rounded-xl object-cover brightness-100 transition-[filter] hover:brightness-95"
              sizes="(max-width: 768px) 33vw, 33vw"
            />
          )}
        </div>
        <div
          className="aspect-3/2 relative size-full"
          onClick={() => handleOpenDialog(2)}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpenDialog(2);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Open image gallery - image 3"
        >
          {images[2] && (
            <Image
              alt=""
              src={images[2]}
              fill
              className="rounded-xl object-cover brightness-100 transition-[filter] hover:brightness-95"
              sizes="(max-width: 768px) 33vw, 33vw"
            />
          )}
        </div>
      </div>

      <div className="absolute bottom-3 left-3">
        <Button color="light" onClick={() => handleOpenDialog()} className="[--btn-border:white]/0">
          <Squares2X2Icon className="h-5 w-5" />
          <span className="text-sm/6 font-normal">Show all photos</span>
        </Button>
      </div>
    </header>
  );
};
const HeaderGalleryGrid5 = ({
  images,
  handleOpenDialog,
}: {
  images: string[];
  handleOpenDialog: (index?: number) => void;
}) => {
  if (!images.length) return null;

  return (
    <>
      <div className="relative">
        <div
          className="aspect-w-16 aspect-h-16 relative"
          onClick={() => handleOpenDialog(0)}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpenDialog(0);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Open image gallery - main image"
        >
          <Image
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            src={images[0]}
            className="w-full rounded-2xl object-cover transition-[filter] hover:brightness-95"
            alt=""
            priority
          />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-6">
        {images.slice(1).map((image, index) => {
          if (!image) {
            return null;
          }
          return (
            <div
              key={image}
              className="aspect-w-11 aspect-h-16 xl:aspect-w-10 2xl:aspect-w-11 relative"
              onClick={() => handleOpenDialog(index + 1)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenDialog(index + 1);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Open image gallery - image ${index + 2}`}
            >
              <Image
                sizes="(max-width: 640px) 100vw, 33vw"
                fill
                src={image}
                className="w-full rounded-2xl object-cover transition-[filter] hover:brightness-95"
                alt=""
                priority
              />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default GalleryImages;
