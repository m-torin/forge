import { type Metadata } from "next";
import Image from "next/image";

import {
  ButtonSecondary,
  getOrders,
  Link,
  Prices,
  type TOrder,
} from "@repo/design-system/mantine-ciseco";

export const metadata: Metadata = {
  description: "Orders History page",
  title: "Orders",
};

const Order = ({ order }: { order: TOrder }) => {
  return (
    <div className="z-0 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
      <div className="flex flex-col bg-neutral-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-8 dark:bg-neutral-500/5">
        <div>
          <Link
            href={
              {
                pathname: "/orders/[number]",
                query: { number: order.number },
              } as any
            }
            className="text-lg font-semibold"
            as={"/orders/" + order.number}
          >
            #{order.number}
          </Link>
          <p className="mt-1.5 text-sm text-neutral-500 sm:mt-2 dark:text-neutral-400">
            {order.status}
          </p>
        </div>
        <div className="mt-3 flex gap-x-1.5 sm:mt-0">
          <ButtonSecondary
            href="collections/all"
            fontSize="text-sm font-medium"
            sizeClass="py-2.5 px-4 sm:px-6"
          >
            Buy again
          </ButtonSecondary>
          <ButtonSecondary
            href={"/orders/" + order.number}
            fontSize="text-sm font-medium"
            sizeClass="py-2.5 px-4 sm:px-6"
          >
            View order
          </ButtonSecondary>
        </div>
      </div>
      <div className="divide-y-neutral-200 divide-y border-t border-neutral-200 p-2 sm:p-8 dark:divide-neutral-700 dark:border-neutral-700">
        {order?.products?.map(
          ({
            id,
            color,
            featuredImage,
            handle,
            price,
            quantity,
            size,
            status: _status,
            title,
          }) => (
            <div key={id} className="flex py-4 first:pt-0 last:pb-0 sm:py-7">
              <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:w-20">
                <Image
                  className="h-full w-full object-cover object-center"
                  alt={featuredImage.alt}
                  fill
                  sizes="100px"
                  src={featuredImage}
                />
              </div>

              <div className="ml-4 flex flex-1 flex-col">
                <div>
                  <div className="flex justify-between">
                    <div>
                      <h3 className="line-clamp-1 text-base font-medium">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        <span>{color}</span>
                        <span className="mx-2 h-4 border-l border-neutral-200 dark:border-neutral-700" />
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
                    <Link
                      href={
                        {
                          pathname: "/products/[handle]",
                          query: { handle },
                        } as any
                      }
                      className="text-primary-600 dark:text-primary-500 font-medium"
                      as={"/products/" + handle}
                    >
                      Leave review
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
};

const Page = async () => {
  const orders = await getOrders();

  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      {/* HEADING */}
      <div>
        <h2 className="text-2xl font-semibold sm:text-3xl">Order history</h2>
        <p className="mt-2.5 text-neutral-500 dark:text-neutral-400">
          Check the status of recent orders, manage returns, and discover
          similar products.
        </p>
      </div>
      
      {orders.length === 0 ? (
        // Empty orders state
        <div className="text-center py-16">
          <div className="mx-auto max-w-md">
            <div className="mx-auto h-24 w-24 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
              <svg 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                className="h-12 w-12 text-neutral-400 dark:text-neutral-500" 
                fill="none"
              >
                <path 
                  strokeWidth={1.5} 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" 
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
              No orders yet
            </h3>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              When you place your first order, it will appear here. Start shopping to see your order history.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <ButtonSecondary 
                href="/en/collections"
                fontSize="text-sm font-medium"
                sizeClass="py-2.5 px-4 sm:px-6"
              >
                Start Shopping
              </ButtonSecondary>
              <ButtonSecondary 
                href="/en"
                fontSize="text-sm font-medium"
                sizeClass="py-2.5 px-4 sm:px-6"
              >
                Back to Home
              </ButtonSecondary>
            </div>
          </div>
        </div>
      ) : (
        orders.map((order) => (
          <Order key={order.number} order={order} />
        ))
      )}
    </div>
  );
};

export default Page;
