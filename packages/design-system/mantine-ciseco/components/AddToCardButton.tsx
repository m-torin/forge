'use client';

import { Transition } from '@headlessui/react';
import Image from 'next/image';
import React, { type ComponentType, type ElementType, type FC } from 'react';
import toast from 'react-hot-toast';

import { Divider } from './Divider';
import Prices from './Prices';

interface NotifyAddToCartProps extends AddToCardButtonProps {
  show: boolean;
}

export const NotifyAddToCart: FC<NotifyAddToCartProps> = ({
  color,
  imageUrl,
  price,
  quantity,
  show,
  size,
  title,
}) => {
  return (
    <Transition
      enterFrom="opacity-0 translate-x-20"
      enterTo="opacity-100 translate-x-0"
      leaveFrom="opacity-100 translate-x-0"
      leaveTo="opacity-0 translate-x-20"
      show={show}
      className="pointer-events-auto w-full max-w-md rounded-2xl bg-white p-4 text-neutral-900 shadow-lg ring-1 ring-black/5 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-white/10"
      appear
      as="div"
      enter="transition-all duration-150"
      leave="transition-all duration-150"
    >
      <p className="block text-base leading-none font-semibold">Added to cart!</p>

      <Divider className="my-4" />

      <div className="flex">
        <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
          <Image
            className="h-full w-full object-contain object-center"
            alt={title}
            fill
            sizes="100px"
            src={imageUrl}
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
              <Prices className="mt-0.5" price={price} />
            </div>
          </div>
          <div className="flex flex-1 items-end justify-between text-sm">
            <p className="text-gray-500 dark:text-neutral-400">{`Qty ${quantity}`}</p>

            <div className="flex">
              <button className="font-medium text-primary-600 dark:text-primary-500" type="button">
                View cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
};

interface AddToCardButtonProps {
  [key: string]: any; // Cho phép bất kỳ props tùy chỉnh nào
  as?: ElementType | ComponentType<any>;
  children?: React.ReactNode;
  className?: string;
  color?: string;
  imageUrl: string;
  price: number;
  quantity: number;
  size?: string;
  title: string;
}

const AddToCardButton = ({
  as,
  children,
  className,
  color,
  imageUrl,
  price,
  quantity,
  size,
  title,
  ...props
}: AddToCardButtonProps) => {
  const notifyAddTocart = () => {
    toast.custom(
      (t) => (
        <NotifyAddToCart
          color={color}
          show={t.visible}
          imageUrl={imageUrl}
          price={price}
          quantity={quantity}
          size={size}
          title={title}
        />
      ),
      { id: 'nc-product-notify', duration: 4000, position: 'top-right' },
    );
  };

  const Component = as || 'button';

  return (
    <Component onClick={notifyAddTocart} className={className} {...props}>
      {children}
    </Component>
  );
};

export default AddToCardButton;
