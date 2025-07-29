import { flag } from '../src/server-next';

// Example flag with custom evaluation context
export const customContextFlag = flag<boolean>({
  decide: ({ entities }: any) => {
    // Access custom entities passed via run()
    return entities?.customData?.enabled === true;
  },
  key: 'custom-context-example',
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
  decide: () => {
    const variants = ['default', 'experiment-a', 'experiment-b'];
    return variants[Math.floor(Math.random() * variants.length)];
  },
  key: 'variant-test',
  options: [
    { label: 'Default Experience', value: 'default' },
    { label: 'Experiment A', value: 'experiment-a' },
    { label: 'Experiment B', value: 'experiment-b' },
  ],
});

// Example with object values in options
interface FeatureConfig {
  allowedFormats: string[];
  enableChat: boolean;
  maxFileSize: number;
}

export const featureConfigFlag = flag<FeatureConfig>({
  decide: ({ entities }: any) => {
    const isPremium = entities?.user?.plan === 'premium';

    return {
      allowedFormats: isPremium ? ['jpg', 'png', 'pdf', 'doc'] : ['jpg', 'png'],
      enableChat: true,
      maxFileSize: isPremium ? 100 : 10, // MB
    };
  },
  key: 'feature-config',
  options: [
    {
      label: 'Free Tier',
      value: {
        allowedFormats: ['jpg', 'png'],
        enableChat: false,
        maxFileSize: 10,
      },
    },
    {
      label: 'Premium Tier',
      value: {
        allowedFormats: ['jpg', 'png', 'pdf', 'doc'],
        enableChat: true,
        maxFileSize: 100,
      },
    },
  ],
});
