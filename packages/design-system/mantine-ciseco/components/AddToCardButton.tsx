'use client';

import Image from 'next/image';
import React, { type ComponentType, type ElementType, type FC } from 'react';

import { notify } from '@repo/notifications/mantine-notifications';

import { Divider } from './Divider';
import Prices from './Prices';

interface NotifyAddToCartProps extends Omit<AddToCardButtonProps, 'as' | 'children' | 'className'> {
  color?: string;
  imageUrl: string;
  price: number;
  quantity: number;
  size?: string;
  title: string;
}

export const NotifyAddToCart: FC<NotifyAddToCartProps> = ({
  color,
  imageUrl,
  price,
  quantity,
  size,
  title,
}) => {
  return (
    <div
      data-testid="notification-content"
      className="pointer-events-auto w-full max-w-md rounded-2xl bg-white p-4 text-neutral-900 shadow-lg ring-1 ring-black/5 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-white/10"
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
              <button
                data-testid="view-cart-button"
                className="font-medium text-primary-600 dark:text-primary-500"
                type="button"
              >
                View cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AddToCardButtonProps {
  [key: string]: any; // Cho phép bất kỳ props tùy chỉnh nào
  as?: ElementType | ComponentType<any>;
  children?: React.ReactNode;
  className?: string;
  color?: string;
  'data-testid'?: string;
  imageUrl: string;
  price: number;
  quantity: number;
  size?: string;
  title: string;
}

const AddToCardButton = ({
  'data-testid': testId = 'add-to-cart-button',
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
    notify.custom({
      id: 'nc-product-notify',
      autoClose: 4000,
      message: (
        <NotifyAddToCart
          color={color}
          imageUrl={imageUrl}
          price={price}
          quantity={quantity}
          size={size}
          title={title}
        />
      ),
      position: 'top-right',
      styles: {
        root: {
          backgroundColor: 'transparent',
          border: 'none',
          boxShadow: 'none',
          padding: 0,
        },
      },
      withCloseButton: false,
    });
  };

  const Component = as || 'button';

  return (
    <Component data-testid={testId} onClick={notifyAddTocart} className={className} {...props}>
      {children}
    </Component>
  );
};

export { AddToCardButton };
export default AddToCardButton;
