import { flag, generatePermutations } from '../src/server-next';

// Multiple flags for testing combinations
export const featureAFlag = flag<boolean>({
  decide: () => false,
  key: 'feature-a',
  options: [
    { label: 'Disabled', value: false },
    { label: 'Enabled', value: true },
  ],
});

export const featureBFlag = flag<boolean>({
  decide: () => false,
  key: 'feature-b',
  options: [
    { label: 'Disabled', value: false },
    { label: 'Enabled', value: true },
  ],
});

export const variantFlag = flag<'A' | 'B' | 'C'>({
  decide: () => 'A',
  key: 'variant',
  options: [
    { label: 'Variant A', value: 'A' },
    { label: 'Variant B', value: 'B' },
    { label: 'Variant C', value: 'C' },
  ],
});

export const advancedFlags = [featureAFlag, featureBFlag, variantFlag] as const;

// Example: Generate only specific combinations at build time
export async function generateStaticParams() {
  // Without filter: would generate 2 * 2 * 3 = 12 combinations
  // With filter: only generate specific combinations we care about

  const codes = await generatePermutations(advancedFlags, (combination: Record<string, any>) => {
    // Only prerender combinations where:
    // 1. Both features are enabled together, OR
    // 2. Both features are disabled together
    // This reduces from 12 to 6 combinations

    const featureA = combination[featureAFlag.key];
    const featureB = combination[featureBFlag.key];

    return featureA === featureB;
  });

  return codes.map((code: string) => ({ code }));
}

// Alternative example: Only prerender popular combinations
export async function generatePopularCombinations() {
  const codes = await generatePermutations(advancedFlags, (combination: Record<string, any>) => {
    // Only prerender the most common combinations:
    // - Default state (all false/A)
    // - Premium state (all true/C)

    const isDefault =
      combination[featureAFlag.key] === false &&
      combination[featureBFlag.key] === false &&
      combination[variantFlag.key] === 'A';

    const isPremium =
      combination[featureAFlag.key] === true &&
      combination[featureBFlag.key] === true &&
      combination[variantFlag.key] === 'C';

    return isDefault || isPremium;
  });

  return codes;
}

// Page using the precomputed flags
export default async function AdvancedPrecomputePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const [featureA, featureB, variant] = await Promise.all([
    featureAFlag(code, advancedFlags),
    featureBFlag(code, advancedFlags),
    variantFlag(code, advancedFlags),
  ]);

  return (
    <div>
      <h1>Advanced Precompute Example</h1>
      <ul>
        <li>Feature A: {featureA ? 'ON' : 'OFF'}</li>
        <li>Feature B: {featureB ? 'ON' : 'OFF'}</li>
        <li>Variant: {variant}</li>
      </ul>
    </div>
  );
}
