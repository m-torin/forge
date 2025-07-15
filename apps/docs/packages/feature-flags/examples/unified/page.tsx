import {
  betaFeatureFlag,
  devToolsFlag,
  featureTierFlag,
  heroTestFlag,
  maintenanceModeFlag,
  newFeatureFlag,
  premiumFeatureFlag,
  regionalFeatureFlag,
} from './flags';

export default async function UnifiedFlagsPage() {
  // All flags use the same transparent online/offline evaluation
  const [
    newFeature,
    heroVariant,
    betaEnabled,
    premiumEnabled,
    maintenanceMode,
    featureTier,
    regionalEnabled,
    devToolsEnabled,
  ] = await Promise.all([
    newFeatureFlag(),
    heroTestFlag(),
    betaFeatureFlag(),
    premiumFeatureFlag(),
    maintenanceModeFlag(),
    featureTierFlag(),
    regionalFeatureFlag(),
    devToolsFlag(),
  ]);

  // Handle maintenance mode
  if (maintenanceMode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">🔧 Maintenance Mode</h1>
          <p className="mt-2 text-gray-600">System maintenance in progress</p>
          <p className="mt-4 text-xs text-gray-400">
            Transparent fallback: Schedule-based evaluation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Unified Feature Flags Demo</h1>
          <p className="text-gray-600">
            All flags use transparent online/offline evaluation with automatic fallback
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Hero Section Variant */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Hero Section</h2>
            <div
              className={`rounded-lg p-4 ${
                heroVariant === 'control'
                  ? 'border-blue-200 bg-blue-50'
                  : heroVariant === 'variant-a'
                    ? 'border-green-200 bg-green-50'
                    : 'border-purple-200 bg-purple-50'
              } border`}
            >
              <h3 className="mb-2 font-bold">
                {heroVariant === 'control'
                  ? 'Classic Hero'
                  : heroVariant === 'variant-a'
                    ? 'Modern Hero'
                    : 'Experimental Hero'}
              </h3>
              <p className="text-sm text-gray-600">
                Variant: <strong>{heroVariant}</strong>
              </p>
            </div>
            <p className="mt-2 text-xs text-gray-500">A/B test with transparent fallback</p>
          </div>

          {/* Feature Availability */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Features</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <span
                  className={`mr-2 h-3 w-3 rounded-full ${
                    featureTier.analytics ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
                <span>Analytics Dashboard</span>
              </div>
              <div className="flex items-center">
                <span
                  className={`mr-2 h-3 w-3 rounded-full ${
                    featureTier.exports ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
                <span>Data Exports</span>
              </div>
              <div className="flex items-center">
                <span
                  className={`mr-2 h-3 w-3 rounded-full ${
                    featureTier.aiInsights ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
                <span>AI Insights</span>
                {betaEnabled && (
                  <span className="ml-2 rounded bg-orange-100 px-2 py-1 text-xs text-orange-700">
                    Beta
                  </span>
                )}
              </div>
              <div className="flex items-center">
                <span
                  className={`mr-2 h-3 w-3 rounded-full ${
                    featureTier.customIntegrations ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
                <span>Custom Integrations</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500">Tier-based with custom logic fallback</p>
          </div>

          {/* New Features */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">New Dashboard</h2>
            {newFeature ? (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="font-bold text-blue-800">✨ New Experience</h3>
                <p className="mt-1 text-sm text-blue-600">Enhanced dashboard with improved UX</p>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="font-bold text-gray-600">Classic Dashboard</h3>
                <p className="mt-1 text-sm text-gray-500">Current stable version</p>
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500">Boolean with percentage fallback</p>
          </div>

          {/* Premium Features */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Premium Access</h2>
            <div
              className={`rounded-lg border p-4 ${
                premiumEnabled
                  ? 'from-gold-50 border-gold-200 bg-gradient-to-r to-yellow-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              {premiumEnabled ? (
                <>
                  <h3 className="text-gold-800 font-bold">🏆 Premium Unlocked</h3>
                  <p className="text-gold-600 mt-1 text-sm">Advanced features available</p>
                </>
              ) : (
                <>
                  <h3 className="font-bold text-gray-600">Standard Access</h3>
                  <p className="mt-1 text-sm text-gray-500">Upgrade for premium features</p>
                </>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">Context-aware custom logic</p>
          </div>

          {/* Regional Features */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Regional Features</h2>
            <div
              className={`rounded-lg border p-4 ${
                regionalEnabled ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}
            >
              <h3 className={`font-bold ${regionalEnabled ? 'text-green-800' : 'text-red-800'}`}>
                {regionalEnabled ? '🌍 Available' : '🚫 Not Available'}
              </h3>
              <p className={`mt-1 text-sm ${regionalEnabled ? 'text-green-600' : 'text-red-600'}`}>
                {regionalEnabled
                  ? 'Feature enabled in your region'
                  : 'Feature not available in your region'}
              </p>
            </div>
            <p className="mt-2 text-xs text-gray-500">Geography-based evaluation</p>
          </div>

          {/* Development Tools */}
          {devToolsEnabled && (
            <div className="rounded-lg border-l-4 border-yellow-400 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">🛠️ Dev Tools</h2>
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <h3 className="font-bold text-yellow-800">Debug Panel</h3>
                <p className="mt-1 text-sm text-yellow-600">Development tools active</p>
                <div className="mt-2 rounded bg-yellow-100 p-2 font-mono text-xs">
                  Environment: {process.env.NODE_ENV || 'development'}
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">Environment-based visibility</p>
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">🔄 Transparent Fallback Status</h2>
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <strong>New Feature:</strong>
              <span className="ml-1 text-gray-600">{newFeature ? 'On' : 'Off'}</span>
            </div>
            <div>
              <strong>Hero Test:</strong>
              <span className="ml-1 text-gray-600">{heroVariant}</span>
            </div>
            <div>
              <strong>Beta Features:</strong>
              <span className="ml-1 text-gray-600">{betaEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div>
              <strong>Premium:</strong>
              <span className="ml-1 text-gray-600">{premiumEnabled ? 'Active' : 'Standard'}</span>
            </div>
          </div>
          <div className="mt-4 rounded-lg bg-blue-50 p-3">
            <p className="text-sm text-blue-800">
              <strong>🎯 All flags automatically fallback:</strong>
              PostHog → Edge Config → Environment Variables → Local Logic
            </p>
          </div>
        </div>

        {/* Testing Instructions */}
        <div className="mt-6 rounded-lg border border-indigo-200 bg-indigo-50 p-6">
          <h3 className="mb-2 font-semibold text-indigo-800">🧪 Test Transparent Fallback</h3>
          <div className="grid gap-4 text-sm text-indigo-700 md:grid-cols-2">
            <div>
              <strong>Environment Overrides:</strong>
              <ul className="mt-1 space-y-1 font-mono text-xs">
                <li>FLAG_NEW_FEATURE=true</li>
                <li>FLAG_BETA_FEATURE=false</li>
                <li>FLAG_PREMIUM_FEATURE=true</li>
              </ul>
            </div>
            <div>
              <strong>Cookie Context:</strong>
              <ul className="mt-1 space-y-1 font-mono text-xs">
                <li>user-id=premium_user_123</li>
                <li>subscription=pro</li>
                <li>visitor-id=visitor_abc</li>
              </ul>
            </div>
          </div>
          <p className="mt-3 text-xs text-indigo-600">
            All flags work identically online or offline - no code changes needed!
          </p>
        </div>
      </div>
    </div>
  );
}
