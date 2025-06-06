import type { GetStaticPaths, GetStaticProps } from 'next';
import { generatePermutations } from '../src/server';
import { marketingFlags, heroTestFlag } from './flags';

// Pages Router example with precomputation
export const getStaticPaths = (async () => {
  const codes = await generatePermutations(marketingFlags);

  return {
    paths: codes.map((code) => ({ params: { code } })),
    fallback: 'blocking', // Enable ISR
  };
}) satisfies GetStaticPaths;

export const getStaticProps = (async (context) => {
  if (typeof context.params?.code !== 'string') {
    return { notFound: true };
  }

  // Evaluate flags with precomputed code
  const heroVariant = await heroTestFlag(context.params.code, marketingFlags);

  return {
    props: {
      heroVariant,
    },
    revalidate: 60 * 60, // Revalidate every hour
  };
}) satisfies GetStaticProps<{ heroVariant: 'A' | 'B' }>;

export default function PagesRouterExample({ heroVariant }: { heroVariant: 'A' | 'B' }) {
  return (
    <div>
      <h1>Pages Router with Feature Flags</h1>
      {heroVariant === 'A' ? <div>Hero Variant A</div> : <div>Hero Variant B</div>}
    </div>
  );
}
