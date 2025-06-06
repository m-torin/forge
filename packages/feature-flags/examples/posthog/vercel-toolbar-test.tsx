/**
 * Test page to verify PostHog integration with Vercel Toolbar
 *
 * To test:
 * 1. Set up your environment variables:
 *    - NEXT_PUBLIC_POSTHOG_KEY
 *    - POSTHOG_PERSONAL_API_KEY (for discovery endpoint)
 *    - POSTHOG_PROJECT_ID (for discovery endpoint)
 *
 * 2. Create the discovery endpoint at app/.well-known/vercel/flags/route.ts
 *
 * 3. Use this component in your app
 *
 * 4. Open Vercel Toolbar and check the Feature Flags section
 */
import { flag } from '@vercel/flags/next';
import { postHogAdapter, createPostHogAdapter } from '@repo/feature-flags/server/next';
import { useFlag } from '@repo/feature-flags/client/next';
import type { ReadonlyRequestCookies } from '@vercel/flags';

// Define the identify function for user targeting
const identify = ({ cookies }: { cookies: ReadonlyRequestCookies }) => {
  const userId = cookies.get('user-id')?.value;
  return { user: userId ? { id: userId } : undefined };
};

// Test flag 1: Simple boolean flag
export const testBooleanFlag = flag({
  key: 'test-boolean-flag',
  adapter: postHogAdapter.isFeatureEnabled(),
  identify,
  description: 'Test boolean flag for Vercel Toolbar',
});

// Test flag 2: Multivariate flag
export const testVariantFlag = flag({
  key: 'test-variant-flag',
  adapter: postHogAdapter.featureFlagValue(),
  identify,
  description: 'Test multivariate flag with string values',
});

// Test flag 3: Payload flag
interface TestPayload {
  theme: 'light' | 'dark';
  buttonColor: string;
  showBanner: boolean;
}

export const testPayloadFlag = flag<TestPayload>({
  key: 'test-payload-flag',
  adapter: postHogAdapter.featureFlagPayload<TestPayload>((payload) => ({
    theme: payload.theme || 'light',
    buttonColor: payload.buttonColor || '#0070f3',
    showBanner: payload.showBanner ?? true,
  })),
  identify,
  defaultValue: {
    theme: 'light',
    buttonColor: '#0070f3',
    showBanner: true,
  },
  description: 'Test payload flag with complex data',
});

// Server Component Example
export async function ServerTestComponent() {
  const [booleanValue, variantValue, payloadValue] = await Promise.all([
    testBooleanFlag(),
    testVariantFlag(),
    testPayloadFlag(),
  ]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">PostHog + Vercel Toolbar Test (Server)</h2>

      <div className="border p-3 rounded">
        <h3 className="font-semibold">Boolean Flag</h3>
        <p>Key: test-boolean-flag</p>
        <p>Value: {booleanValue ? 'Enabled' : 'Disabled'}</p>
      </div>

      <div className="border p-3 rounded">
        <h3 className="font-semibold">Variant Flag</h3>
        <p>Key: test-variant-flag</p>
        <p>Value: {String(variantValue)}</p>
      </div>

      <div className="border p-3 rounded">
        <h3 className="font-semibold">Payload Flag</h3>
        <p>Key: test-payload-flag</p>
        <pre className="text-sm bg-gray-100 p-2 rounded mt-2">
          {JSON.stringify(payloadValue, null, 2)}
        </pre>
      </div>

      <div className="text-sm text-gray-600 mt-4">
        <p>✅ These flags should appear in Vercel Toolbar</p>
        <p>✅ You should be able to override values in the toolbar</p>
        <p>✅ The discovery endpoint should list all PostHog flags</p>
      </div>
    </div>
  );
}

// Client Component Example
('use client');

export function ClientTestComponent() {
  const booleanValue = useFlag(testBooleanFlag, false);
  const variantValue = useFlag(testVariantFlag, 'default');
  const payloadValue = useFlag(testPayloadFlag, {
    theme: 'light',
    buttonColor: '#0070f3',
    showBanner: true,
  });

  if (booleanValue === undefined || variantValue === undefined || payloadValue === undefined) {
    return <div>Loading flags...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">PostHog + Vercel Toolbar Test (Client)</h2>

      <div className="border p-3 rounded">
        <h3 className="font-semibold">Boolean Flag</h3>
        <p>Value: {booleanValue ? 'Enabled' : 'Disabled'}</p>
      </div>

      <div className="border p-3 rounded">
        <h3 className="font-semibold">Variant Flag</h3>
        <p>Value: {String(variantValue)}</p>
      </div>

      <div
        className="border p-3 rounded"
        style={{ backgroundColor: payloadValue.theme === 'dark' ? '#222' : '#fff' }}
      >
        <h3 className="font-semibold">Payload Flag</h3>
        <button
          style={{
            backgroundColor: payloadValue.buttonColor,
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
          }}
        >
          Test Button
        </button>
        {payloadValue.showBanner && (
          <div className="mt-2 p-2 bg-blue-100 rounded">Banner is shown!</div>
        )}
      </div>
    </div>
  );
}
