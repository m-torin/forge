import { Divider } from '@/components/Divider';
import SectionPromo1 from '@/components/SectionPromo1';
import SectionSliderLargeProduct from '@/components/SectionSliderLargeProduct';
import { getCollectionByHandle, getProducts } from '@/data/data';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;

  const collection = await getCollectionByHandle(handle);
  const title = collection?.title || 'Collection';
  const description = collection?.description || 'Collection page';
  return {
    description,
    title,
  };
}

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ handle: string }>;
}) => {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection?.id) {
    return notFound();
  }
  const { count, description, title } = collection;
  const products = await getProducts();

  return (
    <div className="container flex flex-col gap-y-20 py-20 sm:gap-y-20 lg:gap-y-28 lg:py-28">
      <div>
        {/* HEADING */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="block text-4xl font-semibold tracking-tight">{title}</h1>
          <span
            dangerouslySetInnerHTML={{ __html: description || '' }}
            className="mt-4 block text-base text-neutral-500 dark:text-neutral-400"
          />
        </div>
        <hr className="mt-20 mb-10 border-neutral-200 lg:mt-24 dark:border-neutral-700" />

        {/* content */}
        {children}
      </div>

      <Divider />
      <SectionSliderLargeProduct products={products.slice(0, 4)} />
      <Divider />
      <SectionPromo1 />
    </div>
  );
};

export default Layout;
