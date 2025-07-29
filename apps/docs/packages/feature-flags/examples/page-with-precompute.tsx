import { generatePermutations } from '../src/server-next';

import { heroTestFlag, marketingFlags, newFeatureFlag } from './flags';

type PageParams = Promise<{ code: string }>;

// Example of a precomputed page
export default async function MarketingPage({ params }: { params: PageParams }) {
  const { code } = await params;

  // Access precomputed flags by passing the code and flags array
  const heroVariant = await heroTestFlag(code, marketingFlags);
  const showNewFeature = await newFeatureFlag(code, marketingFlags);

  return (
    <div>
      {/* Render different hero based on A/B test */}
      {heroVariant === 'A' ? <div>Hero Variant A</div> : <div>Hero Variant B</div>}

      {/* Conditionally show new feature */}
      {showNewFeature && <div>New Feature Content</div>}
    </div>
  );
}

// Generate static params for all flag combinations at build time
export async function generateStaticParams() {
  const codes = await generatePermutations(marketingFlags);
  return codes.map(code => ({ code }));
}
