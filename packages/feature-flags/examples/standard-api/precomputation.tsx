import {
  deserialize,
  evaluate,
  flag,
  generatePermutations,
  getPrecomputed,
  precompute,
  serialize,
} from '@vercel/flags/next';
/**
 * Precomputation example following Vercel documentation
 * For static optimization and edge middleware
 */
import { NextResponse } from 'next/server';

// Example 5: Using precomputation with adapters
import { edgeConfigAdapter } from '@repo/feature-flags/server';

// Define flags for precomputation
export const showBanner = flag<boolean>({
  decide: () => true,
  defaultValue: false,
  key: 'show-banner',
});

export const saleDiscount = flag<number>({
  decide: () => 20,
  defaultValue: 0,
  key: 'sale-discount',
  options: [
    { label: 'No discount', value: 0 },
    { label: '10% off', value: 10 },
    { label: '20% off', value: 20 },
    { label: '30% off', value: 30 },
  ],
});

export const theme = flag<string>({
  decide: () => 'light',
  defaultValue: 'light',
  key: 'theme',
  options: [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'Auto', value: 'auto' },
  ],
});

// Group flags for precomputation
export const precomputeFlags: readonly any[] = [showBanner, saleDiscount, theme];

// Example 1: In middleware.ts - precompute flags
export async function middleware(request: Request) {
  // Shorthand: evaluate and serialize in one call
  const code = await precompute(precomputeFlags);

  // Rewrite URL to include precomputed code
  const url = new URL(request.url);
  url.pathname = `/${code}${url.pathname}`;

  return NextResponse.rewrite(url);
}

// Example 2: In page component - use precomputed values
interface PageProps {
  params: { code: string };
}

export async function Page({ params }: PageProps) {
  // Method 1: Get specific flags
  const [banner, discount] = await getPrecomputed(
    [showBanner, saleDiscount],
    precomputeFlags,
    params.code,
  );

  // Method 2: Call flag directly with code
  const themeValue = await theme(params.code, precomputeFlags);

  // Method 3: Get all flags as a record
  // eslint-disable-next-line unused-imports/no-unused-vars
  const allFlags = await deserialize(precomputeFlags, params.code);
  // _allFlags = { 'show-banner': true, 'sale-discount': 20, 'theme': 'light' }

  return (
    <div>
      {banner && <div>Banner with {discount}% discount</div>}
      <div data-theme={themeValue}>{/* Your content */}</div>
    </div>
  );
}

// Example 3: Manual evaluate and serialize (for custom logic)
export async function customPrecompute() {
  // Evaluate flags individually
  const values = await evaluate(precomputeFlags);

  // Custom logic with values
  console.log('Flag values:', values);

  // Serialize with custom secret
  const code = await serialize(precomputeFlags, values, process.env.CUSTOM_FLAGS_SECRET);

  return code;
}

// Example 4: Generate static params for all permutations
export async function generateStaticParams() {
  // Generate all possible combinations
  const codes = await generatePermutations(precomputeFlags);

  // With filter - only generate specific combinations
  // eslint-disable-next-line unused-imports/no-unused-vars
  const filteredCodes = await generatePermutations(precomputeFlags, combination => {
    // Only prerender when banner is shown
    return combination['show-banner'] === true;
  });

  return codes.map(code => ({ code }));
}

export const edgeFlag = flag({
  adapter: edgeConfigAdapter(),
  defaultValue: false,
  key: 'edge-feature',
});

// Adapter flags can also be precomputed
export const mixedFlags: readonly any[] = [showBanner, edgeFlag, saleDiscount];

// Note: serialize uses compression - only 2 bytes per flag + JWS signature
// Boolean and null values have special encoding
// Options with declared values use index-based encoding for efficiency
