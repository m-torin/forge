import { getDictionary } from "@/i18n";
import { CheckIcon } from "@heroicons/react/24/outline";
import {
  Coordinate01Icon,
  InformationCircleIcon,
  PaintBucketIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  Breadcrumb,
  ButtonPrimary,
  getCart,
  NcInputNumber,
  Prices,
  type TCardProduct,
} from "@repo/design-system/mantine-ciseco";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const dict = await getDictionary(params.locale);
  return {
    description: dict.cart.cartDescription,
    title: dict.cart.cartPage,
  };
}

const CartPage = async ({ params }: { params: { locale: string } }) => {
  const dict = await getDictionary(params.locale);
  const cart = await getCart("id://cart");

  const renderStatusInstock = () => {
    return (
      <div className="flex items-center justify-center rounded-full border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
        <CheckIcon className="h-3.5 w-3.5" />
        <span className="ml-1 leading-none">{dict.cart.inStock}</span>
      </div>
    );
  };

  const renderProduct = (product: TCardProduct) => {
    const { id, name, color, handle, image, price, quantity, size } = product;

    return (
      <div
        key={id}
        className="relative flex py-8 first:pt-0 last:pb-0 sm:py-10 xl:py-12"
      >
        <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:w-32">
          {image?.src && (
            <Image
              className="object-contain object-center"
              alt={image.alt || ""}
              fill
              sizes="300px"
              src={image}
            />
          )}
          <Link href={`/products/${handle}`} className="absolute inset-0" />
        </div>

        <div className="ml-3 flex flex-1 flex-col sm:ml-6">
          <div>
            <div className="flex justify-between">
              <div className="flex-[1.5]">
                <h3 className="text-base font-semibold">
                  <Link href={`/products/${handle}`}>{name}</Link>
                </h3>
                <div className="mt-1.5 flex text-sm text-neutral-600 sm:mt-2.5 dark:text-neutral-300">
                  <div className="flex items-center gap-x-2">
                    <HugeiconsIcon
                      strokeWidth={1.5}
                      color="currentColor"
                      icon={PaintBucketIcon}
                      size={16}
                    />
                    <span>{color}</span>
                  </div>
                  <span className="mx-4 border-l border-neutral-200 dark:border-neutral-700" />
                  <div className="flex items-center gap-x-2">
                    <HugeiconsIcon
                      strokeWidth={1.5}
                      color="currentColor"
                      icon={Coordinate01Icon}
                      size={16}
                    />
                    <span>{size}</span>
                  </div>
                </div>

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
                    price={price || 0}
                  />
                </div>
              </div>

              <div className="relative hidden text-center sm:block">
                <NcInputNumber className="relative z-10" />
              </div>

              <div className="hidden flex-1 justify-end sm:flex">
                <Prices className="mt-0.5" price={price || 0} />
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
            breadcrumbs={[{ id: 1, name: dict.cart.home, href: "/" }]}
            currentPage={dict.cart.title}
          />
        </div>

        <hr className="my-10 border-neutral-200 xl:my-12 dark:border-neutral-700" />

        <div className="flex flex-col lg:flex-row">
          <div className="w-full divide-y divide-neutral-200 lg:w-[60%] xl:w-[55%] dark:divide-neutral-700">
            {cart.lines.map(renderProduct)}
          </div>
          <div className="my-10 shrink-0 border-t border-neutral-200 lg:mx-10 lg:my-0 lg:border-l lg:border-t-0 xl:mx-16 2xl:mx-20 dark:border-neutral-700" />
          <div className="flex-1">
            <div className="sticky top-28">
              <h3 className="text-lg font-semibold">
                {dict.cart.orderSummary}
              </h3>
              <div className="mt-7 divide-y divide-neutral-200/70 text-sm text-neutral-500 dark:divide-neutral-700/80 dark:text-neutral-400">
                <div className="flex justify-between pb-4">
                  <span>{dict.cart.subtotal}</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                    ${cart.cost.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-4">
                  <span>{dict.cart.shippingEstimate}</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                    ${cart.cost.shipping.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-4">
                  <span>{dict.cart.taxEstimate}</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                    ${cart.cost.tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-4 text-base font-semibold text-neutral-900 dark:text-neutral-200">
                  <span>{dict.cart.orderTotal}</span>
                  <span>${cart.cost.total.toFixed(2)}</span>
                </div>
              </div>
              <ButtonPrimary href="/checkout" className="mt-8 w-full">
                {dict.cart.checkout}
              </ButtonPrimary>
              <div className="mt-5 flex items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
                <p className="relative block pl-5">
                  <HugeiconsIcon
                    strokeWidth={1.5}
                    color="currentColor"
                    icon={InformationCircleIcon}
                    className="absolute -left-1 top-0.5"
                    size={16}
                  />
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
      </main>
    </div>
  );
};

export default CartPage;
