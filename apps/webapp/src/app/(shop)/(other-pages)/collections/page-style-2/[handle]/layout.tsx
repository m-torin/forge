import { Divider } from '@/components/Divider';
import SectionPromo1 from '@/components/SectionPromo1';
import SectionSliderLargeProduct from '@/components/SectionSliderLargeProduct';
import { getCollectionByHandle, getProducts } from '@/data/data';
import { Metadata } from 'next';
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
    title,
    description,
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
  const { title, description, count: _count } = collection;
  const products = await getProducts();

  return (
    <div className="container flex flex-col gap-y-20 py-20 sm:gap-y-20 lg:gap-y-28 lg:py-28">
      <div>
        {/* HEADING */}
        <div className="max-w-3xl">
          <h1 className="block text-4xl font-semibold tracking-tight sm:text-[2.5rem]">{title}</h1>
          <span
            className="mt-6 block text-base text-neutral-500 dark:text-neutral-400"
            dangerouslySetInnerHTML={{ __html: description || '' }}
          />
        </div>
        <Divider className="mb-10 mt-20 lg:mt-24" />

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
