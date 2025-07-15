import { dedupe } from '@vercel/flags/next';

const dedupeExample = dedupe(() => {
  return Math.random();
});

export default async function Page() {
  const random1 = await dedupeExample();
  const random2 = await dedupeExample();
  const random3 = await dedupeExample();

  // these will all be the same random number
  return (
    <div>
      {random1} {random2} {random3}
    </div>
  );
}
