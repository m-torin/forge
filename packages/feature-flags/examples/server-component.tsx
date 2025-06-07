import { newFeatureFlag, premiumFeatureFlag } from './flags';

export default async function ServerFeatureComponent() {
  // Evaluate flags directly in server components
  const isPremium = await premiumFeatureFlag();
  const showNewFeature = await newFeatureFlag();

  return (
    <div>
      {isPremium && <div>Premium Feature Content</div>}

      {showNewFeature && <div>New Feature Content</div>}
    </div>
  );
}
