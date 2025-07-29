'use client';

import { useFlag } from '../src/client-next';

import { newFeatureFlag } from './flags';

export function ClientFeatureComponent() {
  // Use flag in client component
  const showNewFeature = useFlag(newFeatureFlag, false);

  if (showNewFeature === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {showNewFeature ? <div>New Feature is Enabled!</div> : <div>Using Standard Feature</div>}
    </div>
  );
}
