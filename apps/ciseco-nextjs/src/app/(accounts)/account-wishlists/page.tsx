import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/data/data';
import ButtonSecondary from '@/shared/Button/ButtonSecondary';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  description: 'Saved Products page',
  title: 'Saved Products',
};

const Page = async () => {
  const products = (await getProducts()).slice(0, 6);

  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Wishlists</h1>
        <p className="mt-2.5 text-neutral-500 dark:text-neutral-400">
          Check out your wishlists. You can add or remove items from your wishlists.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} data={product} />
        ))}
      </div>

      <div className="flex items-center justify-center pt-10">
        <ButtonSecondary loading>Show me more</ButtonSecondary>
      </div>
    </div>
  );
};

export default Page;
