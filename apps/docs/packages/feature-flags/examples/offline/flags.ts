import { dedupe, flag } from '@vercel/flags/next';

// Deduped function to get user region from headers (simulated locally for air-gapped env)
const identifyRegion = dedupe(async ({ headers }: { headers: Headers }) => {
  // In air-gapped mode, simulate or use local data (no real fetch)
  const country = headers.get('x-country') ?? 'US'; // Fallback to default
  return { region: country === 'EU' ? 'EU' : 'NA' };
});

// Define a boolean feature flag for a promo discount - FULLY OFFLINE
export const promoDiscountFlag = flag({
  key: 'promo-discount',
  description: 'Enables regional promo discount (offline evaluation)',
  // Identify context locally (e.g., from cookies/headers, no network)
  async identify({ cookies, headers }) {
    const userId = cookies?.get('user-id')?.value ?? 'default';
    const { region } = await identifyRegion({ headers });
    return { user: { id: userId }, region };
  },
  // Decide offline based on local entities
  decide({ entities }) {
    if (!entities?.region) return false;
    return ['EU', 'NA'].includes(entities.region) && entities.user.id !== 'blocked';
  },
  options: [
    { label: 'Enabled', value: true },
    { label: 'Disabled', value: false },
  ],
});

// A/B test flag with visitor targeting - FULLY OFFLINE
interface VisitorEntities {
  visitor?: { id: string };
}

const identifyVisitor = dedupe(async ({ cookies }: { cookies: any }): Promise<VisitorEntities> => {
  // Generate visitor ID locally without external dependencies
  const existingId = cookies?.get('visitor-id')?.value;
  const visitorId = existingId || `visitor-${Math.random().toString(36).slice(2, 11)}`;
  return { visitor: { id: visitorId } };
});

export const heroTestFlag = flag<'A' | 'B'>({
  key: 'hero-test-offline',
  description: 'A/B test for hero section (offline evaluation)',
  identify: identifyVisitor,
  decide: ({ entities }) => {
    if (!entities?.visitor) return 'A';
    // Use hash of visitor ID for deterministic 50/50 split
    const hash = entities.visitor.id.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    return hash % 2 === 0 ? 'A' : 'B';
  },
  options: [
    { label: 'Hero Variant A', value: 'A' },
    { label: 'Hero Variant B', value: 'B' },
  ],
});

// Feature rollout flag with percentage-based targeting - FULLY OFFLINE
export const betaFeatureFlag = flag<boolean>({
  key: 'beta-feature-offline',
  description: 'Beta feature with 25% rollout (offline evaluation)',
  async identify({ cookies, headers }) {
    const userId = cookies?.get('user-id')?.value ?? 'anonymous';
    const timestamp = headers?.get('x-timestamp') ?? Date.now().toString();
    return { user: { id: userId }, timestamp };
  },
  decide: ({ entities }) => {
    if (!entities?.user) return false;
    // Deterministic percentage rollout based on user ID
    const hash = entities.user.id.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    return hash % 100 < 25; // 25% rollout
  },
  options: [
    { label: 'Enabled', value: true },
    { label: 'Disabled', value: false },
  ],
});

// Complex multivariate flag - FULLY OFFLINE
export const themeVariantFlag = flag<'light' | 'dark' | 'auto'>({
  key: 'theme-variant-offline',
  description: 'Theme variant selection (offline evaluation)',
  async identify({ cookies, headers }) {
    const preference = cookies?.get('theme-preference')?.value;
    const userAgent = headers?.get('user-agent') ?? '';
    const timeZone = headers?.get('x-timezone') ?? 'UTC';
    return {
      user: { preference, userAgent, timeZone },
    };
  },
  decide: ({ entities }) => {
    // Use explicit preference if set
    if (entities?.user?.preference) {
      return entities.user.preference as 'light' | 'dark' | 'auto';
    }

    // Fallback to time-based logic for demo
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) return 'light';
    if (hour >= 18 || hour < 6) return 'dark';
    return 'auto';
  },
  options: [
    { label: 'Light Theme', value: 'light' },
    { label: 'Dark Theme', value: 'dark' },
    { label: 'Auto Theme', value: 'auto' },
  ],
});

// Maintenance mode flag - FULLY OFFLINE
export const maintenanceModeFlag = flag<boolean>({
  key: 'maintenance-mode-offline',
  description: 'Maintenance mode toggle (offline evaluation)',
  async identify({ headers }) {
    const deploymentId = headers?.get('x-deployment-id') ?? 'local';
    const environment = headers?.get('x-environment') ?? 'development';
    return { deployment: { id: deploymentId, environment } };
  },
  decide: ({ entities }) => {
    // Enable maintenance mode for specific deployment patterns
    const deploymentId = entities?.deployment?.id ?? '';
    const environment = entities?.deployment?.environment ?? 'development';

    // Never enable in development
    if (environment === 'development') return false;

    // Enable for specific deployment IDs (could be set via env var)
    return deploymentId.includes('maintenance') || deploymentId.includes('deploy');
  },
  options: [
    { label: 'Enabled', value: true },
    { label: 'Disabled', value: false },
  ],
});

// Export flags array for precomputation
export const offlineFlags = [
  promoDiscountFlag,
  heroTestFlag,
  betaFeatureFlag,
  themeVariantFlag,
  maintenanceModeFlag,
] as const;
