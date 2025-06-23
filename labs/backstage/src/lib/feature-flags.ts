import { dedupe, flag, postHogServerAdapter as adapter } from '@repo/feature-flags/server/next';

import type { ReadonlyRequestCookies } from '@repo/feature-flags/server/next';

// Define entities for type safety
interface Entities {
  user?: { id: string };
  organization?: { id: string };
}

// Dedupe the identify function to prevent duplicate calls
const identify = dedupe(({ cookies }: { cookies: ReadonlyRequestCookies }): Entities => {
  const userId = cookies.get('user-id')?.value;
  const orgId = cookies.get('org-id')?.value;

  return {
    user: userId ? { id: userId } : undefined,
    organization: orgId ? { id: orgId } : undefined,
  };
});

// Example: New admin dashboard layout
export const newAdminDashboardFlag = flag<boolean, Entities>({
  identify,
  adapter: adapter.isFeatureEnabled(),
  defaultValue: false,
  key: 'new-admin-dashboard',
});

// Example: Enhanced product management interface
export const enhancedPIMFlag = flag<boolean, Entities>({
  identify,
  adapter: adapter.isFeatureEnabled(),
  defaultValue: false,
  key: 'enhanced-pim-interface',
});

// Example: Workflow automation beta
export const workflowAutomationFlag = flag<boolean, Entities>({
  identify,
  adapter: adapter.isFeatureEnabled(),
  defaultValue: false,
  key: 'workflow-automation-beta',
});

// Example: AI-powered suggestions
export const aiSuggestionsFlag = flag<boolean, Entities>({
  identify,
  adapter: adapter.isFeatureEnabled(),
  defaultValue: false,
  key: 'ai-powered-suggestions',
});

// Example: Multivariate test for table layout
export const tableLayoutVariantFlag = flag<string, Entities>({
  identify,
  adapter: adapter.featureFlagValue() as any,
  defaultValue: 'default',
  key: 'table-layout-variant',
  options: [
    { label: 'Default', value: 'default' },
    { label: 'Compact', value: 'compact' },
    { label: 'Expanded', value: 'expanded' },
  ],
});
