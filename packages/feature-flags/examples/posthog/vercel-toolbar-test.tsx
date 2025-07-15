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

import { useFlag } from '@repo/feature-flags/client/next';
import { postHogServerAdapter as postHogAdapter } from '@repo/feature-flags/server/next';

import type { ReadonlyRequestCookies } from '@vercel/flags';

// Define the identify function for user targeting
const identify = ({ cookies }: { cookies: ReadonlyRequestCookies }) => {
  const userId = cookies.get('user-id')?.value;
  return { user: userId ? { id: userId } : undefined };
};

// Test flag 1: Simple boolean flag
export const testBooleanFlag = flag({
  identify,
  adapter: postHogAdapter.isFeatureEnabled(),
  description: 'Test boolean flag for Vercel Toolbar',
  key: 'test-boolean-flag',
});

// Test flag 2: Multivariate flag
export const testVariantFlag = flag({
  identify,
  adapter: postHogAdapter.featureFlagValue(),
  description: 'Test multivariate flag with string values',
  key: 'test-variant-flag',
});

// Test flag 3: Payload flag
interface TestPayload {
  buttonColor: string;
  showBanner: boolean;
  theme: 'light' | 'dark';
}

export const testPayloadFlag = flag<TestPayload>({
  identify,
  adapter: postHogAdapter.featureFlagPayload<TestPayload>(payload => ({
    buttonColor: payload.buttonColor || '#0070f3',
    showBanner: payload.showBanner ?? true,
    theme: payload.theme || 'light',
  })),
  defaultValue: {
    buttonColor: '#0070f3',
    showBanner: true,
    theme: 'light',
  },
  description: 'Test payload flag with complex data',
  key: 'test-payload-flag',
});

// Server Component Example
export async function ServerTestComponent() {
  const [booleanValue, variantValue, payloadValue] = await Promise.all([
    testBooleanFlag(),
    testVariantFlag(),
    testPayloadFlag(),
  ]);

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold">PostHog + Vercel Toolbar Test (Server)</h2>

      <div className="rounded border p-3">
        <h3 className="font-semibold">Boolean Flag</h3>
        <p>Key: test-boolean-flag</p>
        <p>Value: {booleanValue ? 'Enabled' : 'Disabled'}</p>
      </div>

      <div className="rounded border p-3">
        <h3 className="font-semibold">Variant Flag</h3>
        <p>Key: test-variant-flag</p>
        <p>Value: {String(variantValue)}</p>
      </div>

      <div className="rounded border p-3">
        <h3 className="font-semibold">Payload Flag</h3>
        <p>Key: test-payload-flag</p>
        <pre className="mt-2 rounded bg-gray-100 p-2 text-sm">
          {JSON.stringify(payloadValue, null, 2)}
        </pre>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>✅ These flags should appear in Vercel Toolbar</p>
        <p>✅ You should be able to override values in the toolbar</p>
        <p>✅ The discovery endpoint should list all PostHog flags</p>
      </div>
    </div>
  );
}

// Client Component Example
void 'use client';

export function ClientTestComponent() {
  const booleanValue = useFlag(testBooleanFlag, false);
  const variantValue = useFlag(testVariantFlag, 'default');
  const payloadValue = useFlag(testPayloadFlag, {
    buttonColor: '#0070f3',
    showBanner: true,
    theme: 'light',
  });

  if (booleanValue === undefined || variantValue === undefined || payloadValue === undefined) {
    return <div>Loading flags...</div>;
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold">PostHog + Vercel Toolbar Test (Client)</h2>

      <div className="rounded border p-3">
        <h3 className="font-semibold">Boolean Flag</h3>
        <p>Value: {booleanValue ? 'Enabled' : 'Disabled'}</p>
      </div>

      <div className="rounded border p-3">
        <h3 className="font-semibold">Variant Flag</h3>
        <p>Value: {String(variantValue)}</p>
      </div>

      <div
        className="rounded border p-3"
        style={{ backgroundColor: payloadValue.theme === 'dark' ? '#222' : '#fff' }}
      >
        <h3 className="font-semibold">Payload Flag</h3>
        <button
          style={{
            backgroundColor: payloadValue.buttonColor,
            borderRadius: '4px',
            color: 'white',
            padding: '8px 16px',
          }}
        >
          Test Button
        </button>
        {payloadValue.showBanner && (
          <div className="mt-2 rounded bg-blue-100 p-2">Banner is shown!</div>
        )}
      </div>
    </div>
  );
}
