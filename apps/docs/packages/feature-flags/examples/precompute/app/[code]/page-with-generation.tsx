import { generatePermutations } from '@vercel/flags/next';

import { marketingFlags } from '../../flags';

export async function generateStaticParams() {
  const codes = await generatePermutations(marketingFlags);
  return codes.map(code => ({ code }));
}

export default function Page() {
  /* ... */
  return <div>Page content</div>;
}
