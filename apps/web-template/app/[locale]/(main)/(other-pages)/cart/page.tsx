import { getDictionary } from '@/i18n';
import { IconCheck, IconInfoCircle, IconMapPin, IconPaint } from '@tabler/icons-react';
import { type Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { createMetadata } from '@repo/seo/server/next';

import { Breadcrumb, ButtonPrimary, NcInputNumber, Prices } from '@/components/ui';
import { getCart } from '@/actions/cart';
import type { TCartItem } from '@/types/cart';

// Define cart product type
type TCardProduct = {
  id: string;
  name: string;
  title?: string;
  handle?: string;
  quantity: number;
  price: number;
  compareAtPrice?: number;
  image?: {
    src: string;
    alt?: string;
  };
  featuredImage?: {
    src: string;
    alt?: string;
  };
  color?: string;
  size?: string;
};

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const dict = await getDictionary(params.locale);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';
  const cartUrl = `${baseUrl}/${params.locale}/cart`;

  return createMetadata({
    title: dict.cart.cartPage,
    description: dict.cart.cartDescription || 'Review and manage items in your shopping cart',
    alternates: {
      canonical: cartUrl,
    },
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  });
}

const CartPage = async ({ params }: { params: { locale: string } }) => {
  const dict = await getDictionary(params.locale);
  const cart = await getCart();

  const renderStatusInstock = () => {
    return (
      <div className="flex items-center justify-center rounded-full border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
        <IconCheck className="h-3.5 w-3.5" />
        <span className="ml-1 leading-none">{dict.cart.inStock}</span>
      </div>
    );
  };

  const renderProduct = (item: TCartItem) => {
    const { id, quantity, price, product, variant } = item;

    return (
      <div key={id} className="relative flex py-8 first:pt-0 last:pb-0 sm:py-10 xl:py-12">
        <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:w-32">
          {product.image && (
            <Image
              className="object-contain object-center"
              alt={product.name}
              fill
              sizes="300px"
              src={product.image}
            />
          )}
          <Link href={`/products/${product.slug}`} className="absolute inset-0" />
        </div>

        <div className="ml-3 flex flex-1 flex-col sm:ml-6">
          <div>
            <div className="flex justify-between">
              <div className="flex-[1.5]">
                <h3 className="text-base font-semibold">
                  <Link href={`/products/${product.slug}`}>{product.name}</Link>
                </h3>
                {variant && (
                  <div className="mt-1.5 flex text-sm text-neutral-600 sm:mt-2.5 dark:text-neutral-300">
                    <div className="flex items-center gap-x-2">
                      <IconPaint stroke={1.5} size={16} />
                      <span>{variant.name}</span>
                    </div>
                    <span className="mx-4 border-l border-neutral-200 dark:border-neutral-700" />
                    <div className="flex items-center gap-x-2">
                      <IconMapPin stroke={1.5} size={16} />
                      <span>{variant.sku}</span>
                    </div>
                  </div>
                )}

                <div className="relative mt-3 flex w-full justify-between sm:hidden">
                  <select
                    id="qty"
                    className="form-select relative z-10 rounded-md bg-white px-2 py-1 text-xs outline-1 outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-neutral-800"
                    defaultValue={quantity}
                    name="qty"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                  </select>
                  <Prices
                    contentClass="py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium h-full"
                    price={price}
                  />
                </div>
              </div>

              <div className="relative hidden text-center sm:block">
                <NcInputNumber className="relative z-10" />
              </div>

              <div className="hidden flex-1 justify-end sm:flex">
                <Prices className="mt-0.5" price={price} />
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-end justify-between pt-4 text-sm">
            {renderStatusInstock()}

            <div className="text-primary-600 hover:text-primary-500 relative z-10 mt-3 flex items-center text-sm font-medium">
              <span>{dict.cart.remove}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="nc-CartPage">
      <main className="container py-16 lg:pb-28 lg:pt-20">
        <div className="mb-12 sm:mb-16">
          <h2 className="block text-2xl font-semibold sm:text-3xl lg:text-4xl">
            {dict.cart.title}
          </h2>
          <Breadcrumb
            className="mt-5"
            breadcrumbs={[{ id: 1, name: dict.cart.home, href: '/' }]}
            currentPage={dict.cart.title}
          />
        </div>

        <hr className="my-10 border-neutral-200 xl:my-12 dark:border-neutral-700" />

        {!cart || cart.items.length === 0 ? (
          // Empty cart state
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
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M6 19a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                {dict.cart.emptyTitle || 'Your cart is empty'}
              </h3>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                {dict.cart.emptyDescription || 'Add some products to your cart to get started.'}
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <ButtonPrimary href="/en/collections">
                  {dict.cart.browseCatalog || 'Browse Collections'}
                </ButtonPrimary>
                <Link
                  href="/en"
                  className="inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-sm font-medium rounded-md text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  {dict.cart.backToHome || 'Back to Home'}
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row">
            <div className="w-full divide-y divide-neutral-200 lg:w-[60%] xl:w-[55%] dark:divide-neutral-700">
              {cart?.items.map(renderProduct)}
            </div>
            <div className="my-10 shrink-0 border-t border-neutral-200 lg:mx-10 lg:my-0 lg:border-l lg:border-t-0 xl:mx-16 2xl:mx-20 dark:border-neutral-700" />
            <div className="flex-1">
              <div className="sticky top-28">
                <h3 className="text-lg font-semibold">{dict.cart.orderSummary}</h3>
                <div className="mt-7 divide-y divide-neutral-200/70 text-sm text-neutral-500 dark:divide-neutral-700/80 dark:text-neutral-400">
                  <div className="flex justify-between pb-4">
                    <span>{dict.cart.subtotal}</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                      ${cart?.subtotal.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between py-4">
                    <span>{dict.cart.shippingEstimate}</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                      $10.00
                    </span>
                  </div>
                  <div className="flex justify-between py-4">
                    <span>{dict.cart.taxEstimate}</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                      ${(cart?.subtotal * 0.08).toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-4 text-base font-semibold text-neutral-900 dark:text-neutral-200">
                    <span>{dict.cart.orderTotal}</span>
                    <span>
                      ${(cart?.subtotal + 10 + cart?.subtotal * 0.08).toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
                <ButtonPrimary href="/checkout" className="mt-8 w-full">
                  {dict.cart.checkout}
                </ButtonPrimary>
                <div className="mt-5 flex items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
                  <p className="relative block pl-5">
                    <IconInfoCircle stroke={1.5} className="absolute -left-1 top-0.5" size={16} />
                    {dict.cart.learnMore}
                    {` `}
                    <a
                      href="##"
                      className="font-medium text-neutral-900 underline dark:text-neutral-200"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {dict.cart.taxes}
                    </a>
                    <span>
                      {` `}
                      {dict.cart.and}
                      {` `}
                    </span>
                    <a
                      href="##"
                      className="font-medium text-neutral-900 underline dark:text-neutral-200"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {dict.cart.shipping}
                    </a>
                    {` `} {dict.cart.information}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;
