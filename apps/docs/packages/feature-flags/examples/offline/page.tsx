import { cookies, headers } from 'next/headers';
import {
  betaFeatureFlag,
  heroTestFlag,
  maintenanceModeFlag,
  promoDiscountFlag,
  themeVariantFlag,
} from './flags';

export default async function OfflineFlagsPage() {
  // Get headers and cookies locally (air-gapped compatible)
  const requestHeaders = headers();
  const requestCookies = cookies();

  // Evaluate all flags offline
  const [isPromoAvailable, heroVariant, isBetaEnabled, themeVariant, isMaintenanceMode] =
    await Promise.all([
      promoDiscountFlag({ cookies: requestCookies, headers: requestHeaders }),
      heroTestFlag({ cookies: requestCookies, headers: requestHeaders }),
      betaFeatureFlag({ cookies: requestCookies, headers: requestHeaders }),
      themeVariantFlag({ cookies: requestCookies, headers: requestHeaders }),
      maintenanceModeFlag({ cookies: requestCookies, headers: requestHeaders }),
    ]);

  // Handle maintenance mode
  if (isMaintenanceMode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">🔧 Maintenance Mode</h1>
          <p className="mt-2 text-gray-600">Site is temporarily unavailable</p>
          <p className="mt-4 text-xs text-gray-400">Flag evaluated offline</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-8 ${
        themeVariant === 'dark'
          ? 'bg-gray-900 text-white'
          : themeVariant === 'light'
            ? 'bg-white text-gray-900'
            : 'bg-gray-50 text-gray-800'
      }`}
    >
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">Offline Feature Flags Demo</h1>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Hero Section - A/B Test */}
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">Hero Variant: {heroVariant}</h2>
            {heroVariant === 'A' ? (
              <div className="rounded bg-blue-100 p-4">
                <h3 className="font-bold text-blue-800">Hero Version A</h3>
                <p className="text-blue-600">Traditional hero design</p>
              </div>
            ) : (
              <div className="rounded bg-green-100 p-4">
                <h3 className="font-bold text-green-800">Hero Version B</h3>
                <p className="text-green-600">Modern hero design</p>
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500">A/B test - offline eval</p>
          </div>

          {/* Pricing Section - Promo Flag */}
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">Pricing</h2>
            <div className="space-y-2">
              <div className="text-lg">
                Premium Plan
                {isPromoAvailable ? (
                  <div>
                    <span className="text-gray-500 line-through">$19.99/month</span>
                    <span className="ml-2 font-bold text-green-600">$14.99/month</span>
                    <span className="ml-2 rounded bg-green-100 px-2 py-1 text-xs text-green-800">
                      Promo Active!
                    </span>
                  </div>
                ) : (
                  <div className="text-lg">$19.99/month</div>
                )}
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">Region-based promo - offline eval</p>
          </div>

          {/* Beta Features */}
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">Features</h2>
            <ul className="space-y-2">
              <li>✅ Basic Analytics</li>
              <li>✅ Export Reports</li>
              <li>✅ Team Collaboration</li>
              {isBetaEnabled && <li className="text-orange-600">🚀 Advanced AI Insights (Beta)</li>}
            </ul>
            <p className="mt-2 text-xs text-gray-500">Beta rollout: 25% - offline eval</p>
          </div>

          {/* Theme Selector */}
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">Theme Settings</h2>
            <div className="space-y-2">
              <p>
                Current theme: <strong>{themeVariant}</strong>
              </p>
              <div className="text-sm text-gray-600">
                Theme selected based on preferences and time
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">Time-based theme - offline eval</p>
          </div>
        </div>

        {/* Debug Information */}
        <div className="mt-8 rounded-lg bg-gray-100 p-4">
          <h3 className="mb-2 font-semibold">Debug Info (Offline Evaluation)</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Promo Discount:</strong> {isPromoAvailable ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Hero Variant:</strong> {heroVariant}
            </div>
            <div>
              <strong>Beta Feature:</strong> {isBetaEnabled ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Theme:</strong> {themeVariant}
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-600">
            All flags evaluated locally without network dependencies
          </p>
        </div>

        {/* Instructions */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4">
          <h3 className="mb-2 font-semibold text-blue-800">Air-Gapped Testing Instructions</h3>
          <ol className="space-y-1 text-sm text-blue-700">
            <li>
              1. Set cookies: <code>document.cookie = &apos;user-id=test123; path=/&apos;;</code>
            </li>
            <li>
              2. Set cookies:{' '}
              <code>document.cookie = &apos;visitor-id=visitor123; path=/&apos;;</code>
            </li>
            <li>
              3. Set cookies:{' '}
              <code>document.cookie = &apos;theme-preference=dark; path=/&apos;;</code>
            </li>
            <li>4. Reload page to see flag changes</li>
            <li>5. All evaluation happens offline - no network required!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
