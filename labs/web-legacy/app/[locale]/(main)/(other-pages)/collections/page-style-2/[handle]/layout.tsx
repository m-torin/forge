import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';

import { Divider, SectionPromo1, SectionSliderProductCard } from '@/components/ui';
import { getCollectionByHandle } from '@/actions/collections';
import { getProducts } from '@/actions/products';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;

  const collection = await getCollectionByHandle(handle);
  const title = collection?.name || 'Collection';
  const copy = collection?.copy as { description?: string } | null;
  const description = copy?.description || 'Collection page';
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
  const title = collection.name;
  const copy = collection.copy as { description?: string } | null;
  const description = copy?.description;
  const products = await getProducts({ limit: 4 });

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
        <hr className="mb-10 mt-20 border-neutral-200 lg:mt-24 dark:border-neutral-700" />

        {/* content */}
        {children}
      </div>

      <Divider />
      <SectionSliderProductCard
        data={products.data.slice(0, 4).map((p) => ({
          ...p,
          name: p.name || '',
          image: (p as any).featuredImage?.src || '',
          price: p.price || 0,
        }))}
      />
      <Divider />
      <SectionPromo1 />
    </div>
  );
};

export default Layout;
