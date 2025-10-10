import { Divider } from '@/components/Divider';
import Prices from '@/components/Prices';
import { getOrder } from '@/data/data';
import ButtonSecondary from '@/shared/Button/ButtonSecondary';
import clsx from 'clsx';
import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ number: string }>;
}): Promise<Metadata> {
  const { number } = await params;
  const order = await getOrder(number);
  if (!order) {
    return {
      title: 'Order not found',
      description: 'The order you are looking for does not exist.',
    };
  }
  const { number: orderNumber, status } = order;
  return { title: 'Order' + orderNumber, description: status };
}

const Page = async ({ params }: { params: Promise<{ number: string }> }) => {
  const { number } = await params;
  const order = await getOrder(number);

  if (!order?.number) {
    return notFound();
  }

  const products = order.products;

  return (
    <div>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <p className="mb-1 text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">Order placed</span>
            <time dateTime="2021-03-22"> {order.date}</time>
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Order #{order.number}
          </h1>
        </div>

        <div className="ml-auto">
          <ButtonSecondary size="smaller" href="#">
            View invoice
            <span className="ms-2" aria-hidden="true">
              &rarr;
            </span>
          </ButtonSecondary>
        </div>
      </div>

      {/* Products */}
      <div className="mt-6">
        <h2 className="sr-only">Products purchased</h2>
        <div className="flex flex-col gap-y-10">
          {products.map(product => (
            <div
              key={product.id}
              className="border-b border-t bg-white sm:rounded-lg sm:border dark:bg-neutral-800"
            >
              <div className="py-6 sm:px-6 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:p-8">
                <div className="sm:flex lg:col-span-7">
                  <div className="relative aspect-square w-full shrink-0 rounded-lg object-cover sm:size-40">
                    {product.featuredImage.src && (
                      <Image
                        alt={product.featuredImage.alt}
                        src={product.featuredImage}
                        fill
                        className="rounded-lg object-cover"
                        sizes="(min-width: 640px) 10rem, 100vw"
                      />
                    )}
                  </div>

                  <div className="mt-6 flex flex-col sm:ml-6 sm:mt-0">
                    <h3 className="text-base font-medium">
                      <a href={product.href}>{product.title}</a>
                    </h3>
                    <p className="my-2 text-sm text-neutral-500 dark:text-neutral-400">
                      Qty {product.quantity}
                    </p>
                    <Prices price={product.price} className="mt-auto flex justify-start" />
                  </div>
                </div>

                <div className="mt-6 lg:col-span-5 lg:mt-0">
                  <dl className="grid grid-cols-2 gap-x-6 text-sm">
                    <div>
                      <dt className="font-medium">Delivery address</dt>
                      <dd className="mt-3 text-neutral-500 dark:text-neutral-400">
                        <span className="block">{product.address[0]}</span>
                        <span className="block">{product.address[1]}</span>
                        <span className="block">{product.address[2]}</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium">Shipping updates</dt>
                      <dd className="mt-3 flex flex-col gap-y-3 text-neutral-500 dark:text-neutral-400">
                        <p>{product.email}</p>
                        <p>{product.phone}</p>
                        <button type="button" className="font-medium underline">
                          Edit
                          <span aria-hidden="true"> &rarr;</span>
                        </button>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="border-t px-4 py-6 sm:px-6 lg:p-8">
                <h4 className="sr-only">Status</h4>
                <p className="text-sm font-medium">
                  {product.status} on <time dateTime={product.datetime}>{product.date}</time>
                </p>
                <div aria-hidden="true" className="mt-6">
                  <div className="overflow-hidden rounded-full bg-neutral-200">
                    <div
                      style={{ width: `calc((${product.step} * 2 + 1) / 8 * 100%)` }}
                      className="h-2 rounded-full bg-neutral-950 sm:h-1.5"
                    />
                  </div>
                  <div className="mt-6 hidden grid-cols-4 text-sm font-medium text-neutral-500 sm:grid">
                    <div className="text-neutral-950 dark:text-white">Order placed</div>
                    <div
                      className={clsx(
                        product.step > 0 ? 'text-neutral-950 dark:text-white' : '',
                        'text-center',
                      )}
                    >
                      Processing
                    </div>
                    <div
                      className={clsx(
                        product.step > 1 ? 'text-neutral-950 dark:text-white' : '',
                        'text-center',
                      )}
                    >
                      Shipped
                    </div>
                    <div
                      className={clsx(
                        product.step > 2 ? 'text-neutral-950 dark:text-white' : '',
                        'text-right',
                      )}
                    >
                      Delivered
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing */}
      <div className="mt-16">
        <h2 className="sr-only">Billing Summary</h2>

        <div className="bg-neutral-50 px-4 py-6 sm:rounded-lg sm:px-6 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8 lg:py-8 dark:bg-neutral-800">
          <dl className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-2 md:gap-x-8 lg:col-span-7">
            <div>
              <dt className="t font-medium">Billing address</dt>
              <dd className="mt-3 text-neutral-500 dark:text-neutral-400">
                <span className="block">Floyd Miles</span>
                <span className="block">7363 Cynthia Pass</span>
                <span className="block">Toronto, ON N3Y 4H8</span>
              </dd>
            </div>
            <div>
              <dt className="font-medium">Payment information</dt>
              <dd className="-ml-4 -mt-1 flex flex-wrap">
                <div className="ml-4 mt-4 shrink-0">
                  <svg
                    width={36}
                    height={24}
                    viewBox="0 0 36 24"
                    aria-hidden="true"
                    className="h-6 w-auto"
                  >
                    <rect rx={4} fill="#224DBA" width={36} height={24} />
                    <path
                      d="M10.925 15.673H8.874l-1.538-6c-.073-.276-.228-.52-.456-.635A6.575 6.575 0 005 8.403v-.231h3.304c.456 0 .798.347.855.75l.798 4.328 2.05-5.078h1.994l-3.076 7.5zm4.216 0h-1.937L14.8 8.172h1.937l-1.595 7.5zm4.101-5.422c.057-.404.399-.635.798-.635a3.54 3.54 0 011.88.346l.342-1.615A4.808 4.808 0 0020.496 8c-1.88 0-3.248 1.039-3.248 2.481 0 1.097.969 1.673 1.653 2.02.74.346 1.025.577.968.923 0 .519-.57.75-1.139.75a4.795 4.795 0 01-1.994-.462l-.342 1.616a5.48 5.48 0 002.108.404c2.108.057 3.418-.981 3.418-2.539 0-1.962-2.678-2.077-2.678-2.942zm9.457 5.422L27.16 8.172h-1.652a.858.858 0 00-.798.577l-2.848 6.924h1.994l.398-1.096h2.45l.228 1.096h1.766zm-2.905-5.482l.57 2.827h-1.596l1.026-2.827z"
                      fill="#fff"
                    />
                  </svg>
                  <p className="sr-only">Visa</p>
                </div>
                <div className="ml-4 mt-4">
                  <p className="">Ending with 4242</p>
                  <p className="text-neutral-600 dark:text-neutral-300">Expires 02 / 24</p>
                </div>
              </dd>
            </div>
          </dl>

          <dl className="mt-8 flex flex-col gap-y-5 text-sm lg:col-span-5 lg:mt-0">
            <div className="flex items-center justify-between">
              <dt className="text-neutral-600 dark:text-neutral-300">Subtotal</dt>
              <dd className="font-medium">$72</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-neutral-600 dark:text-neutral-300">Shipping</dt>
              <dd className="font-medium">$5</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-neutral-600 dark:text-neutral-300">Tax</dt>
              <dd className="font-medium">$6.16</dd>
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <dt className="font-medium">Order total</dt>
              <dd className="font-medium">$83.16</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Page;
