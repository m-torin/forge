import { flag } from '../src/server';

// Example flag with custom evaluation context
export const customContextFlag = flag<boolean>({
  key: 'custom-context-example',
  decide: ({ entities }) => {
    // Access custom entities passed via run()
    return entities?.customData?.enabled === true;
  },
});

// Using the flag with custom evaluation context
export async function ExampleWithCustomContext() {
  // Method 1: Pass custom evaluation context directly
  const isEnabled = await customContextFlag.run({
    identify: { customData: { enabled: true } },
  });

  // Method 2: Pass custom evaluation context function
  const isEnabledWithFunction = await customContextFlag.run({
    identify: () => ({ customData: { enabled: Math.random() > 0.5 } }),
  });

  return (
    <div>
      <p>Flag with direct context: {isEnabled ? 'ON' : 'OFF'}</p>
      <p>Flag with function context: {isEnabledWithFunction ? 'ON' : 'OFF'}</p>
    </div>
  );
}

// Example showing options with labels
export const variantFlag = flag<string>({
  key: 'variant-test',
  decide: () => {
    const variants = ['default', 'experiment-a', 'experiment-b'];
    return variants[Math.floor(Math.random() * variants.length)];
  },
  options: [
    { label: 'Default Experience', value: 'default' },
    { label: 'Experiment A', value: 'experiment-a' },
    { label: 'Experiment B', value: 'experiment-b' },
  ],
});

// Example with object values in options
interface FeatureConfig {
  enableChat: boolean;
  maxFileSize: number;
  allowedFormats: string[];
}

export const featureConfigFlag = flag<FeatureConfig>({
  key: 'feature-config',
  decide: ({ entities }) => {
    const isPremium = entities?.user?.plan === 'premium';

    return {
      enableChat: true,
      maxFileSize: isPremium ? 100 : 10, // MB
      allowedFormats: isPremium ? ['jpg', 'png', 'pdf', 'doc'] : ['jpg', 'png'],
    };
  },
  options: [
    {
      label: 'Free Tier',
      value: {
        enableChat: false,
        maxFileSize: 10,
        allowedFormats: ['jpg', 'png'],
      },
    },
    {
      label: 'Premium Tier',
      value: {
        enableChat: true,
        maxFileSize: 100,
        allowedFormats: ['jpg', 'png', 'pdf', 'doc'],
      },
    },
  ],
});
