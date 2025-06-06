/**
 * Precomputation example following Vercel documentation
 * For static optimization and edge middleware
 */
import { 
  flag, 
  precompute, 
  generatePermutations,
  getPrecomputed,
  evaluate,
  serialize,
  deserialize
} from '@vercel/flags/next';

// Define flags for precomputation
export const showBanner = flag<boolean>({
  key: 'show-banner',
  decide: () => true,
  defaultValue: false,
});

export const saleDiscount = flag<number>({
  key: 'sale-discount',
  decide: () => 20,
  defaultValue: 0,
  options: [
    { value: 0, label: 'No discount' },
    { value: 10, label: '10% off' },
    { value: 20, label: '20% off' },
    { value: 30, label: '30% off' },
  ],
});

export const theme = flag<string>({
  key: 'theme',
  decide: () => 'light',
  defaultValue: 'light',
  options: [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto' },
  ],
});

// Group flags for precomputation
export const precomputeFlags = [showBanner, saleDiscount, theme];

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
    params.code
  );
  
  // Method 2: Call flag directly with code
  const themeValue = await theme(params.code, precomputeFlags);
  
  // Method 3: Get all flags as a record
  const allFlags = await deserialize(precomputeFlags, params.code);
  // allFlags = { 'show-banner': true, 'sale-discount': 20, 'theme': 'light' }
  
  return (
    <div>
      {banner && <Banner discount={discount} />}
      <div data-theme={themeValue}>
        {/* Your content */}
      </div>
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
  const code = await serialize(
    precomputeFlags, 
    values,
    process.env.CUSTOM_FLAGS_SECRET
  );
  
  return code;
}

// Example 4: Generate static params for all permutations
export async function generateStaticParams() {
  // Generate all possible combinations
  const codes = await generatePermutations(precomputeFlags);
  
  // With filter - only generate specific combinations
  const filteredCodes = await generatePermutations(
    precomputeFlags,
    (combination) => {
      // Only prerender when banner is shown
      return combination['show-banner'] === true;
    }
  );
  
  return codes.map((code) => ({ code }));
}

// Example 5: Using precomputation with adapters
import { edgeConfigAdapter } from '@repo/feature-flags/server';

export const edgeFlag = flag({
  key: 'edge-feature',
  adapter: edgeConfigAdapter(),
  defaultValue: false,
});

// Adapter flags can also be precomputed
export const mixedFlags = [showBanner, edgeFlag, saleDiscount];

// Note: serialize uses compression - only 2 bytes per flag + JWS signature
// Boolean and null values have special encoding
// Options with declared values use index-based encoding for efficiency