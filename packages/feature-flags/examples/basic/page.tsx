import { exampleFlag } from './flags';

export default async function Page() {
  const example = await exampleFlag();
  return <div>{example ? 'Flag is on' : 'Flag is off'}</div>;
}
