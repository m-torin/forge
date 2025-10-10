'use client';

import Prices from '@/components/Prices';
import { Link } from '@/shared/link';
import { Transition } from '@headlessui/react';
import Image from 'next/image';
import React, { ComponentType, ElementType, FC } from 'react';
import toast from 'react-hot-toast';

interface NotifyAddToCartProps extends AddToCardButtonProps {
  show: boolean;
}

export const NotifyAddToCart: FC<NotifyAddToCartProps> = ({
  show,
  color,
  imageUrl,
  price,
  quantity,
  title,
  size,
}) => {
  return (
    <Transition
      appear
      as="div"
      show={show}
      className="pointer-events-auto w-full max-w-md rounded-2xl bg-white p-4 text-neutral-900 shadow-lg ring-1 ring-black/5 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-white/10"
      enter="transition-all duration-150"
      enterFrom="opacity-0 translate-x-20"
      enterTo="opacity-100 translate-x-0"
      leave="transition-all duration-150"
      leaveFrom="opacity-100 translate-x-0"
      leaveTo="opacity-0 translate-x-20"
    >
      <p className="mt-1 block text-base font-semibold leading-none">Added to cart!</p>

      <div className="mt-6 flex">
        <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="100px"
            className="h-full w-full object-contain object-center"
          />
        </div>

        <div className="ml-4 flex flex-1 flex-col">
          <div>
            <div className="flex justify-between">
              <div>
                <h3 className="text-base font-medium">{title}</h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  <span>{color}</span>
                  <span className="mx-2 h-4 border-l border-neutral-200 dark:border-neutral-700" />
                  <span>{size}</span>
                </p>
              </div>
              <Prices price={price} className="mt-0.5" />
            </div>
          </div>
          <div className="flex flex-1 items-end justify-between text-sm">
            <p className="text-gray-500 dark:text-neutral-400">{`Qty ${quantity}`}</p>

            <div className="flex">
              <Link href="/cart" className="text-primary-600 dark:text-primary-500 font-medium">
                View cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
};

interface AddToCardButtonProps {
  className?: string;
  children?: React.ReactNode;
  imageUrl: string;
  title: string;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  as?: ElementType | ComponentType<any>;
  'data-testid'?: string;
  [key: string]: any; // Cho phép bất kỳ props tùy chỉnh nào
}

const AddToCardButton = ({
  children,
  className,
  color,
  imageUrl,
  price,
  quantity,
  size,
  title,
  as,
  'data-testid': testId = 'add-to-cart-button',
  ...props
}: AddToCardButtonProps) => {
  const notifyAddTocart = () => {
    toast.custom(
      t => (
        <NotifyAddToCart
          show={t.visible}
          imageUrl={imageUrl}
          quantity={quantity}
          size={size}
          color={color}
          title={title}
          price={price}
        />
      ),
      { position: 'top-right', id: 'nc-product-notify', duration: 4000 },
    );
  };

  const Component = as || 'button';

  return (
    <Component className={className} onClick={notifyAddTocart} data-testid={testId} {...props}>
      {children}
    </Component>
  );
};

export default AddToCardButton;
