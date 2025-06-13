import { Button } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { type FC } from 'react';

import type { Product } from '@/data/types';
import ProductCard from '@/components/ui/ProductCard';

export interface SectionGridFeatureItemsProps {
  data: Product[];
  heading?: string;
  showMoreHref?: string;
  showMoreText?: string;
  className?: string;
}

const SectionGridFeatureItems: FC<SectionGridFeatureItemsProps> = ({ 
  data,
  heading = 'Find your favorite products',
  showMoreHref = '/products',
  showMoreText = 'Show me more',
  className = '',
}) => {
  return (
    <div className={`nc-SectionGridFeatureItems relative ${className}`}>
      {/* Header */}
      <div className="container mx-auto px-4 mb-12 lg:mb-14">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
            {heading}
          </h2>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>

        {/* Show More Button */}
        <div className="mt-16 flex items-center justify-center">
          <Button
            component="a"
            href={showMoreHref}
            size="lg"
            rightSection={<IconArrowRight size={20} />}
          >
            {showMoreText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SectionGridFeatureItems;