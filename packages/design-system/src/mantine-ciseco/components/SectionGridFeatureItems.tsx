'use client';

import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { type FC } from 'react';

import { type TProductItem } from '../data/types';
import { useLocalizeHref } from '../hooks/useLocale';

import HeaderFilterSection from './HeaderFilterSection';
import ProductCard from './ProductCard';
import ButtonPrimary from './shared/Button/ButtonPrimary';

//
export interface SectionGridFeatureItemsProps extends Record<string, any> {
  data: TProductItem[];
}

const SectionGridFeatureItems: FC<SectionGridFeatureItemsProps> = ({ data }: any) => {
  const localizeHref = useLocalizeHref();

  return (
    <div className="nc-SectionGridFeatureItems relative">
      <HeaderFilterSection heading="Find your favorite products." />
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.map((item: any) => (
          <ProductCard key={item.id} data={item} />
        ))}
      </div>
      <div className="mt-16 flex items-center justify-center">
        <ButtonPrimary href={localizeHref('/collections/all')}>
          Show me more
          <ArrowRightIcon className="ms-2 h-5 w-5" />
        </ButtonPrimary>
      </div>
    </div>
  );
};

export default SectionGridFeatureItems;
