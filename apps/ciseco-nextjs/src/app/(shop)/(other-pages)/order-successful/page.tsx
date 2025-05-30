import { Divider } from '@/components/Divider'
import Heading from '@/components/Heading/Heading'
import Prices from '@/components/Prices'
import { getOrders } from '@/data/data'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Order Successful',
  description: 'Your order has been successfully placed.',
}

export default async function Page() {
  // for demo purposes, you need to use the getOrder(number) function to get the order by number, example: getOrder(123456789)
  const order = (await getOrders())[0]

  if (!order) {
    return notFound()
  }
  const products = order.products

  return (
    <>
      <main className="container">
        <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:max-w-3xl">
          <div>
            <p className="text-xs font-medium uppercase">Thanks for ordering</p>
            <Heading className="mt-4">Payment successful!</Heading>

            <p className="mt-2.5 max-w-2xl text-neutral-500">
              We appreciate your order, we’re currently processing it. So hang tight and we’ll send you confirmation
              very soon!
            </p>

            <dl className="mt-16 text-sm">
              <dt className="text-neutral-500">Tracking number</dt>
              <dd>
                <Link className="mt-2 text-lg font-medium" href="/orders/123456789">
                  #{order.number}
                  <span aria-hidden="true"> &rarr;</span>
                </Link>
              </dd>
            </dl>

            <ul
              role="list"
              className="mt-6 divide-y divide-neutral-200 border-t border-neutral-200 text-sm text-neutral-500 dark:divide-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
            >
              {products.map((product) => (
                <li key={product.id} className="flex gap-x-2.5 py-6 sm:gap-x-6">
                  <div className="relative aspect-3/4 w-24 flex-none">
                    {product.featuredImage && (
                      <Image
                        alt={product.featuredImage.alt}
                        src={product.featuredImage}
                        fill
                        sizes="200px"
                        className="rounded-md bg-neutral-100 object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-auto flex-col gap-y-1.5">
                    <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                      <Link href={'/products/' + product.handle}>{product.title}</Link>
                    </h3>
                    <div className="flex items-center gap-x-2 text-neutral-500 dark:text-neutral-300">
                      <p className="text-sm text-neutral-500 dark:text-neutral-300">{product.color}</p>
                      {product.size ? <p className="text-sm text-neutral-300">/</p> : null}
                      {product.size ? (
                        <p className="text-sm text-neutral-500 dark:text-neutral-300">{product.size}</p>
                      ) : null}
                    </div>
                    <Prices price={product.price} className="flex justify-start sm:hidden" />

                    <p className="mt-auto text-sm text-neutral-500 dark:text-neutral-300">Qty {product.quantity}</p>
                  </div>

                  <Prices price={product.price} className="hidden sm:block" />
                </li>
              ))}
            </ul>

            <dl className="space-y-6 border-t border-neutral-200 pt-6 text-sm font-medium text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              <div className="flex justify-between">
                <dt className="uppercase">Subtotal</dt>
                <dd className="text-neutral-900 dark:text-neutral-100">${order.cost.subtotal.toFixed(2)}</dd>
              </div>

              <div className="flex justify-between">
                <dt className="uppercase">Shipping</dt>
                <dd className="text-neutral-900 dark:text-neutral-100">${order.cost.shipping.toFixed(2)}</dd>
              </div>

              <div className="flex justify-between">
                <dt className="uppercase">Taxes</dt>
                <dd className="text-neutral-900 dark:text-neutral-100">${order.cost.tax.toFixed(2)}</dd>
              </div>

              <div className="flex items-center justify-between border-t border-neutral-200 pt-6 text-neutral-900 dark:border-neutral-700 dark:text-neutral-100">
                <dt className="text-base uppercase">Total</dt>
                <dd className="text-base">${order.cost.total.toFixed(2)}</dd>
              </div>
            </dl>

            <dl className="mt-12 grid grid-cols-2 gap-x-4 text-sm text-neutral-600 sm:mt-16 dark:text-neutral-300">
              <div>
                <dt className="font-medium text-neutral-900 uppercase">Shipping Address</dt>
                <dd className="mt-2">
                  <address className="uppercase not-italic">
                    <span className="block">Kristin Watson</span>
                    <span className="block">7363 Cynthia Pass</span>
                    <span className="block">Toronto, ON N3Y 4H8</span>
                  </address>
                </dd>
              </div>
              <div>
                <dt className="font-medium uppercase">Payment Information</dt>
                <dd className="mt-2 space-y-2 sm:flex sm:space-y-0 sm:gap-x-4">
                  <div className="flex-none">
                    <svg width={36} height={24} viewBox="0 0 36 24" aria-hidden="true" className="h-6 w-auto">
                      <rect rx={4} fill="#224DBA" width={36} height={24} />
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
    </>
  )
}
