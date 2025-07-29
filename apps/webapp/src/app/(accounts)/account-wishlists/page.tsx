import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/data/data';
import ButtonPrimary from '@/shared/Button/ButtonPrimary';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saved Products',
  description: 'Saved Products page',
};

const Page = async () => {
  const products = (await getProducts()).slice(0, 6);

  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      <div>
        <h1 className="text-2xl font-semibold">Wishlists</h1>
        <p className="mt-4 text-neutral-500 dark:text-neutral-400">
          Check out your wishlists. You can add or remove items from your wishlists.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:gap-x-8 lg:grid-cols-3">
        {products.map(product => (
          <ProductCard key={product.id} data={product} />
        ))}
      </div>

      <div className="flex items-center justify-center pt-10">
        <ButtonPrimary>Show me more</ButtonPrimary>
      </div>
    </div>
  );
};

export default Page;
