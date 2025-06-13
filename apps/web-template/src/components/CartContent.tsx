'use client';

import { Button, NumberFormatter } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

import { getCartAction } from '@/actions';
import { type TCardProduct } from '@/data/data-service';

interface CartContentProps {
  className?: string;
  onClose?: () => void;
  cart?: {
    lines: TCardProduct[];
    cost: { subtotal: number };
  } | null;
  loading?: boolean;
}

const CartProduct = ({ product }: { product: any }) => {
  if (!product) {
    return null;
  }

  // Handle both legacy and new product formats
  const name = product.title || product.name;
  const color = product.color;
  const handle = product.handle;
  const image = product.featuredImage || product.image;
  const price = product.price || parseFloat(product.priceRange?.minVariantPrice?.amount || '0');
  const quantity = product.quantity;
  const size = product.size;

  return (
    <div className="flex py-5 last:pb-0">
      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
        {image && (
          <Image
            className="h-full w-full object-contain object-center"
            alt={image.alt || 'Product image'}
            fill
            src={typeof image === 'string' ? image : image.src}
          />
        )}
        <Link href={`/products/${handle}`} className="absolute inset-0" />
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between">
            <div>
              <h3 className="text-base font-medium">
                <Link href={`/products/${handle}`}>{name}</Link>
              </h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                <span>{color}</span>
                <span className="mx-2 h-4 border-l border-neutral-200 dark:border-neutral-700" />
                <span>{size}</span>
              </p>
            </div>
            <div className="mt-0.5 font-semibold text-green-600">
              <NumberFormatter prefix="$" value={price || 0} decimalScale={2} />
            </div>
          </div>
        </div>
        <div className="flex flex-1 items-end justify-between text-sm">
          <div className="inline-grid w-full max-w-16 grid-cols-1">
            <select
              className="col-start-1 row-start-1 appearance-none rounded-md py-0.5 pl-3 pr-8 text-xs/6 outline-1 -outline-offset-1 outline-neutral-900/10 focus:outline-1 dark:outline-white/15"
              aria-label={`Quantity, ${product.name}`}
              defaultValue={quantity}
              name={`quantity-${product.id}`}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
              <option value={8}>8</option>
            </select>
            <IconChevronDown
              aria-hidden="true"
              className="pointer-events-none col-start-1 row-start-1 mr-2 size-4 self-center justify-self-end text-neutral-500 dark:text-neutral-400"
            />
          </div>

          <div className="flex">
            <button className="font-medium text-primary-600 dark:text-primary-500" type="button">
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export function CartContent({
  className = '',
  onClose,
  cart: propCart,
  loading: propLoading = false,
}: CartContentProps) {
  // If cart data is passed as prop, use it; otherwise fetch it
  const [localCart, setLocalCart] = useState<{ lines: any[]; cost: { subtotal: number } } | null>(
    null,
  );
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (propCart) {
      setLocalCart(propCart);
      return;
    }

    setLocalLoading(true);
    getCartAction()
      .then((cart: any) => {
        if (cart) {
          // Convert cart format to expected format
          const convertedCart = {
            lines: cart.lines || [],
            cost: {
              subtotal: cart.cost?.subtotalAmount ? parseFloat(cart.cost.subtotalAmount.amount) : 0,
            },
          };
          setLocalCart(convertedCart);
        } else {
          setLocalCart({ cost: { subtotal: 0 }, lines: [] });
        }
      })
      .catch((error: any) => {
        console.error('Failed to fetch cart:', error);
        setLocalCart({ cost: { subtotal: 0 }, lines: [] });
      })
      .finally(() => setLocalLoading(false));
  }, [propCart]);

  const cart = propCart ?? localCart;
  const loading = propCart ? propLoading : localLoading;

  if (loading) {
    return <div className="p-4">Loading cart...</div>;
  }

  if (!cart) {
    return <div className="p-4">Failed to load cart</div>;
  }

  return (
    <div className={clsx('flex h-full flex-col px-4 md:px-8', className)}>
      {/* CONTENT */}
      <div className="hidden-scrollbar flex-1 overflow-x-hidden overflow-y-auto py-6">
        {cart.lines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-lg text-neutral-500 dark:text-neutral-400 mb-4">
              Your cart is empty
            </p>
            <Link
              href="/collections/all"
              onClick={onClose}
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              Continue Shopping →
            </Link>
          </div>
        ) : (
          <div className="flow-root">
            <ul
              role="list"
              className="-my-6 divide-y divide-neutral-900/10 dark:divide-neutral-100/10"
            >
              {cart.lines.map((product: any) => (
                <CartProduct key={product.id} product={product} />
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* FOOTER  */}
      {cart.lines.length > 0 && (
        <section
          className="mt-auto grid shrink-0 gap-4 border-t border-neutral-900/10 py-6 dark:border-neutral-100/10"
          aria-labelledby="summary-heading"
        >
          <h2 id="summary-heading" className="sr-only">
            Order summary
          </h2>
          <div>
            <div className="flex justify-between text-base font-medium text-gray-900 dark:text-neutral-100">
              <p className="font-medium">Subtotal</p>
              <p className="font-medium">${cart.cost.subtotal}</p>
            </div>
            <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
              Shipping and taxes calculated at checkout.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button
                component={Link}
                href="/cart"
                variant="outline"
                className="flex-1 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                View cart
              </Button>
              <Button
                component={Link}
                href="/checkout"
                className="flex-1 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Check out
              </Button>
            </div>
            <div className="mt-6 flex justify-center text-center text-sm text-neutral-500 dark:text-neutral-400">
              <p className="text-xs">
                or{' '}
                <Link
                  href="/collections/all"
                  onClick={onClose}
                  className="text-xs font-medium uppercase"
                >
                  Continue Shopping<span aria-hidden="true"> →</span>
                </Link>
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
