import { marketingFlags, showBanner, showSummerSale } from '../../flags';

type Params = Promise<{ code: string }>;

export default async function Page({ params }: { params: Params }) {
  const { code } = await params;
  // access the precomputed result by passing params.code and the group of
  // flags used during precomputation of this route segment
  const summerSale = await showSummerSale(code, marketingFlags);
  const banner = await showBanner(code, marketingFlags);

  return (
    <div>
      {banner ? <p>welcome</p> : null}

      {summerSale ? <p>summer sale live now</p> : <p>summer sale starting soon</p>}
    </div>
  );
}
