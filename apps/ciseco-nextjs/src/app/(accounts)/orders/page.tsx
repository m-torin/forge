import { ButtonSecondary, Link, Prices, getOrders, type TOrder } from '@repo/design-system/ciseco'
import { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Orders',
  description: 'Orders History page',
}

const Order = ({ order }: { order: TOrder }) => {
  return (
    <div className="z-0 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
      <div className="flex flex-col bg-neutral-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-8 dark:bg-neutral-500/5">
        <div>
          <Link href={{ pathname: '/orders/[number]', query: { number: order.number } } as any} as={'/orders/' + order.number} className="text-lg font-semibold">
            #{order.number}
          </Link>
          <p className="mt-1.5 text-sm text-neutral-500 sm:mt-2 dark:text-neutral-400">{order.status}</p>
        </div>
        <div className="mt-3 flex gap-x-1.5 sm:mt-0">
          <ButtonSecondary sizeClass="py-2.5 px-4 sm:px-6" fontSize="text-sm font-medium" href={'collections/all'}>
            Buy again
          </ButtonSecondary>
          <ButtonSecondary
            sizeClass="py-2.5 px-4 sm:px-6"
            fontSize="text-sm font-medium"
            href={'/orders/' + order.number}
          >
            View order
          </ButtonSecondary>
        </div>
      </div>
      <div className="divide-y-neutral-200 divide-y border-t border-neutral-200 p-2 sm:p-8 dark:divide-neutral-700 dark:border-neutral-700">
        {order?.products?.map(({ id, featuredImage, price, handle, title, color, size, status, quantity }) => (
          <div key={id} className="flex py-4 first:pt-0 last:pb-0 sm:py-7">
            <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:w-20">
              <Image
                fill
                sizes="100px"
                src={featuredImage}
                alt={featuredImage.alt}
                className="h-full w-full object-cover object-center"
              />
            </div>

            <div className="ml-4 flex flex-1 flex-col">
              <div>
                <div className="flex justify-between">
                  <div>
                    <h3 className="line-clamp-1 text-base font-medium">{title}</h3>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      <span>{color}</span>
                      <span className="mx-2 h-4 border-l border-neutral-200 dark:border-neutral-700"></span>
                      <span>{size}</span>
                    </p>
                  </div>
                  <Prices className="ml-2 mt-0.5" price={price || 0} />
                </div>
              </div>
              <div className="flex flex-1 items-end justify-between text-sm">
                <p className="flex items-center text-neutral-500 dark:text-neutral-400">
                  <span className="hidden sm:inline-block">Qty</span>
                  <span className="inline-block sm:hidden">x</span>
                  <span className="ml-2">{quantity}</span>
                </p>

                <div className="flex">
                  <Link href={{ pathname: '/products/[handle]', query: { handle } } as any} as={'/products/' + handle} className="text-primary-600 dark:text-primary-500 font-medium">
                    Leave review
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const Page = async () => {
  const orders = await getOrders()

  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      {/* HEADING */}
      <div>
        <h2 className="text-2xl font-semibold sm:text-3xl">Order history</h2>
        <p className="mt-2.5 text-neutral-500 dark:text-neutral-400">
          Check the status of recent orders, manage returns, and discover similar products.
        </p>
      </div>
      {orders.map((order) => (
        <Order key={order.number} order={order} />
      ))}
    </div>
  )
}

export default Page
