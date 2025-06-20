'use client';

import { Button, NumberFormatter, Skeleton } from '@mantine/core';
import { IconChevronDown, IconAlertTriangle } from '@tabler/icons-react';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

// Removed direct action import - cart data should come from props

interface CartContentProps {
  className?: string;
  onClose?: () => void;
  cart: any; // Cart data is required - should be passed from server component
  loading?: boolean;
  error?: string;
  'data-testid'?: string;
}

// Loading skeleton for CartContent
function CartContentSkeleton({ testId }: { testId?: string }) {
  return (
    <div className="flex h-full flex-col px-4 md:px-8" data-testid={testId}>
      <div className="flex-1 overflow-x-hidden overflow-y-auto py-6">
        <div className="flow-root">
          <div className="-my-6 divide-y divide-neutral-900/10 dark:divide-neutral-100/10">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex py-5">
                <Skeleton height={96} width={80} className="shrink-0 rounded-xl" />
                <div className="ml-4 flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <div>
                      <Skeleton height={20} width={120} mb="xs" />
                      <Skeleton height={16} width={80} />
                    </div>
                    <Skeleton height={20} width={60} />
                  </div>
                  <div className="flex flex-1 items-end justify-between mt-4">
                    <Skeleton height={32} width={64} />
                    <Skeleton height={16} width={60} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-auto grid gap-4 border-t border-neutral-900/10 py-6">
        <div className="flex justify-between">
          <Skeleton height={20} width={60} />
          <Skeleton height={20} width={80} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Skeleton height={40} />
          <Skeleton height={40} />
        </div>
      </div>
    </div>
  );
}

// Error state for CartContent
function CartContentError({ error, testId }: { error: string; testId?: string }) {
  return (
    <div
      className="flex h-full flex-col px-4 md:px-8 items-center justify-center"
      data-testid={testId}
    >
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center max-w-sm">
        <IconAlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
          Cart failed to load
        </h3>
        <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>
        <Link
          href="/collections/all"
          className="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          Continue Shopping →
        </Link>
      </div>
    </div>
  );
}

// Zero state for CartContent
function CartContentEmpty({ onClose, testId }: { onClose?: () => void; testId?: string }) {
  return (
    <div
      className="flex h-full flex-col px-4 md:px-8 items-center justify-center"
      data-testid={testId}
    >
      <div className="text-center">
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
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6H19M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6"
          />
        </svg>
        <p className="text-lg text-neutral-500 dark:text-neutral-400 mb-4">Your cart is empty</p>
        <Link
          href="/collections/all"
          onClick={onClose}
          className="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          Continue Shopping →
        </Link>
      </div>
    </div>
  );
}

const CartProduct = ({
  product,
  onRemove,
  onUpdateQuantity,
}: {
  product: any;
  onRemove?: () => void;
  onUpdateQuantity?: (quantity: number) => void;
}) => {
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
    <ErrorBoundary
      fallback={
        <div className="flex py-5 bg-red-50 dark:bg-red-900/20 rounded p-2 text-red-600">
          Product failed to load
        </div>
      }
    >
      <div className="flex py-5 last:pb-0">
        <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
          <ErrorBoundary
            fallback={
              <div className="h-full w-full bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                <IconAlertTriangle size={20} />
              </div>
            }
          >
            {image && (
              <Image
                className="h-full w-full object-contain object-center"
                alt={image.alt || 'Product image'}
                fill
                src={typeof image === 'string' ? image : image.src}
              />
            )}
            <Link href={`/products/${handle}`} className="absolute inset-0" />
          </ErrorBoundary>
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
                value={quantity}
                onChange={(e) => onUpdateQuantity?.(parseInt(e.target.value))}
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
              <button
                className="font-medium text-primary-600 dark:text-primary-500"
                type="button"
                onClick={onRemove}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export function CartContent({
  className = '',
  onClose,
  cart,
  loading = false,
  error,
  'data-testid': testId = 'cart-content',
}: CartContentProps) {
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <CartContentSkeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <CartContentError error={currentError} testId={testId} />;
  }

  // Convert cart data to expected format for backward compatibility
  const formattedCart = cart
    ? {
        lines: cart.items || cart.lines || [],
        cost: {
          subtotal:
            cart.subtotal ||
            (cart.cost?.subtotalAmount ? parseFloat(cart.cost.subtotalAmount.amount) : 0),
        },
      }
    : { lines: [], cost: { subtotal: 0 } };

  // Show zero state when cart is empty
  if (!formattedCart || formattedCart.lines.length === 0) {
    return <CartContentEmpty onClose={onClose} testId={testId} />;
  }

  return (
    <ErrorBoundary
      fallback={<CartContentError error="Cart content failed to render" testId={testId} />}
    >
      <div className={clsx('flex h-full flex-col px-4 md:px-8', className)} data-testid={testId}>
        {/* CONTENT */}
        <ErrorBoundary fallback={<div className="p-4 text-red-500">Cart items failed to load</div>}>
          <div className="hidden-scrollbar flex-1 overflow-x-hidden overflow-y-auto py-6">
            <div className="flow-root">
              <ul
                role="list"
                className="-my-6 divide-y divide-neutral-900/10 dark:divide-neutral-100/10"
              >
                {formattedCart.lines.map((product: any) => {
                  try {
                    return (
                      <ErrorBoundary
                        key={product.id}
                        fallback={
                          <li className="py-5 bg-red-50 dark:bg-red-900/20 rounded p-2 text-red-600">
                            Product failed to load
                          </li>
                        }
                      >
                        <CartProduct
                          product={product}
                          onRemove={product.onRemove}
                          onUpdateQuantity={product.onUpdateQuantity}
                        />
                      </ErrorBoundary>
                    );
                  } catch (_err) {
                    setInternalError('Failed to render cart product');
                    return (
                      <li
                        key={product.id}
                        className="py-5 bg-red-50 dark:bg-red-900/20 rounded p-2 text-red-600"
                      >
                        Product error
                      </li>
                    );
                  }
                })}
              </ul>
            </div>
          </div>
        </ErrorBoundary>

        {/* FOOTER  */}
        {formattedCart.lines.length > 0 && (
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
                <p className="font-medium">${formattedCart.cost.subtotal.toFixed(2)}</p>
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
    </ErrorBoundary>
  );
}
