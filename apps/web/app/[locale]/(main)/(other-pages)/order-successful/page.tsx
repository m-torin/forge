import { type Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createMetadata } from '@repo/seo/server/next';

import { Divider, Heading, Prices } from '@/components/ui';
import { getOrders } from '@/actions/orders';

export const metadata: Metadata = createMetadata({
  title: 'Order Successful',
  description: 'Your order has been successfully placed.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
});

export default async function Page() {
  // for demo purposes, you need to use the getOrderByNumber(number) function to get the order by number
  const { orders } = await getOrders();
  const order = orders[0];

  if (!order) {
    return notFound();
  }
  const items = order.items || [];

  return (
    <main className="container">
      <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:max-w-3xl">
        <div>
          <p className="text-xs font-medium uppercase">Thanks for ordering</p>
          <Heading className="mt-4">Payment successful!</Heading>

          <p className="mt-2.5 max-w-2xl text-neutral-500">
            We appreciate your order, we&apos;re currently processing it. So hang tight and
            we&apos;ll send you confirmation very soon!
          </p>

          <dl className="mt-16 text-sm">
            <dt className="text-neutral-500">Tracking number</dt>
            <dd>
              <Link href={`/orders/${order.orderNumber}`} className="mt-2 text-lg font-medium">
                #{order.orderNumber}
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            </dd>
          </dl>

          <ul
            role="list"
            className="mt-6 divide-y divide-neutral-200 border-t border-neutral-200 text-sm text-neutral-500 dark:divide-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
          >
            {items?.map((item: any) => (
              <li key={item.id} className="flex gap-x-2.5 py-6 sm:gap-x-6">
                <div className="aspect-3/4 relative w-24 flex-none">
                  {item.product?.image && (
                    <Image
                      className="rounded-md bg-neutral-100 object-cover"
                      alt={item.productName}
                      fill
                      sizes="200px"
                      src={item.product.image}
                    />
                  )}
                </div>
                <div className="flex flex-auto flex-col gap-y-1.5">
                  <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                    <Link href={`/products/${item.product?.slug || item.productId}`}>
                      {item.productName}
                    </Link>
                  </h3>
                  {item.variantId && (
                    <div className="flex items-center gap-x-2 text-neutral-500 dark:text-neutral-300">
                      <p className="text-sm text-neutral-500 dark:text-neutral-300">
                        Variant ID: {item.variantId}
                      </p>
                    </div>
                  )}
                  <Prices className="flex justify-start sm:hidden" price={item.price} />

                  <p className="mt-auto text-sm text-neutral-500 dark:text-neutral-300">
                    Qty {item.quantity}
                  </p>
                </div>

                <Prices className="hidden sm:block" price={item.price} />
              </li>
            ))}
          </ul>

          <dl className="space-y-6 border-t border-neutral-200 pt-6 text-sm font-medium text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            <div className="flex justify-between">
              <dt className="uppercase">Subtotal</dt>
              <dd className="text-neutral-900 dark:text-neutral-100">
                ${order.subtotal?.toFixed(2) || '0.00'}
              </dd>
            </div>

            <div className="flex justify-between">
              <dt className="uppercase">Shipping</dt>
              <dd className="text-neutral-900 dark:text-neutral-100">
                ${order.shippingAmount?.toFixed(2) || '10.00'}
              </dd>
            </div>

            <div className="flex justify-between">
              <dt className="uppercase">Taxes</dt>
              <dd className="text-neutral-900 dark:text-neutral-100">
                ${order.taxAmount?.toFixed(2) || '0.00'}
              </dd>
            </div>

            <div className="flex items-center justify-between border-t border-neutral-200 pt-6 text-neutral-900 dark:border-neutral-700 dark:text-neutral-100">
              <dt className="text-base uppercase">Total</dt>
              <dd className="text-base">${order.total?.toFixed(2) || '0.00'}</dd>
            </div>
          </dl>

          <dl className="mt-12 grid grid-cols-2 gap-x-4 text-sm text-neutral-600 sm:mt-16 dark:text-neutral-300">
            <div>
              <dt className="font-medium uppercase text-neutral-900">Shipping Address</dt>
              <dd className="mt-2">
                <address className="uppercase not-italic">
                  {order.shippingAddress ? (
                    <>
                      <span className="block">
                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                      </span>
                      <span className="block">{order.shippingAddress.street1}</span>
                      {order.shippingAddress.street2 && (
                        <span className="block">{order.shippingAddress.street2}</span>
                      )}
                      <span className="block">
                        {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                        {order.shippingAddress.postalCode}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="block">Kristin Watson</span>
                      <span className="block">7363 Cynthia Pass</span>
                      <span className="block">Toronto, ON N3Y 4H8</span>
                    </>
                  )}
                </address>
              </dd>
            </div>
            <div>
              <dt className="font-medium uppercase">Payment Information</dt>
              <dd className="mt-2 space-y-2 sm:flex sm:gap-x-4 sm:space-y-0">
                <div className="flex-none">
                  <svg
                    aria-hidden="true"
                    width={36}
                    viewBox="0 0 36 24"
                    className="h-6 w-auto"
                    height={24}
                  >
                    <rect width={36} fill="#224DBA" height={24} rx={4} />
                    <path
                      d="M10.925 15.673H8.874l-1.538-6c-.073-.276-.228-.52-.456-.635A6.575 6.575 0 005 8.403v-.231h3.304c.456 0 .798.347.855.75l.798 4.328 2.05-5.078h1.994l-3.076 7.5zm4.216 0h-1.937L14.8 8.172h1.937l-1.595 7.5zm4.101-5.422c.057-.404.399-.635.798-.635a3.54 3.54 0 011.88.346l.342-1.615A4.808 4.808 0 0020.496 8c-1.88 0-3.248 1.039-3.248 2.481 0 1.097.969 1.673 1.653 2.02.74.346 1.025.577.968.923 0 .519-.57.75-1.139.75a4.795 4.795 0 01-1.994-.462l-.342 1.616a5.48 5.48 0 002.108.404c2.108.057 3.418-.981 3.418-2.539 0-1.962-2.678-2.077-2.678-2.942zm9.457 5.422L27.16 8.172h-1.652a.858.858 0 00-.798.577l-2.848 6.924h1.994l.398-1.096h2.45l.228 1.096h1.766zm-2.905-5.482l.57 2.827h-1.596l1.026-2.827z"
                      fill="#fff"
                    />
                  </svg>
                  <p className="sr-only">Visa</p>
                </div>
                <div className="flex-auto uppercase">
                  <p className="">Ending with 4242</p>
                  <p>Expires 12 / 21</p>
                </div>
              </dd>
            </div>
          </dl>

          <div className="mt-16 border-t border-neutral-200 py-6 text-right dark:border-neutral-700">
            <Link href="/collections/all" className="text-sm font-medium uppercase">
              Continue Shopping
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      <Divider />
    </main>
  );
}
