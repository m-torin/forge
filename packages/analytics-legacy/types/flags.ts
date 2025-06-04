/**
 * Feature flag types for packages to import without circular dependencies
 * Import from '@repo/analytics/types/flags' to avoid importing the full package
 */

/**
 * Feature flag constants
 */
export const FLAGS = {
  ai: {
    anthropic: 'ai.anthropic',
    chat: 'ai.chat',
    enabled: 'ai.enabled',
    openai: 'ai.openai',
  },
  analytics: {
    debug: 'analytics.debug',
    enabled: 'analytics.enabled',
    google: 'analytics.google',
    posthog: 'analytics.posthog',
    segment: 'analytics.segment',
  },
  auth: {
    apiKeys: 'auth.api-keys',
    emailPassword: 'auth.email-password',
    magicLink: 'auth.magic-link',
    oauth: {
      discord: 'auth.oauth.discord',
      github: 'auth.oauth.github',
      google: 'auth.oauth.google',
    },
    organizations: 'auth.organizations',
    passkey: 'auth.passkey',
    twoFactor: 'auth.two-factor',
  },
  email: {
    apiKeyNotifications: 'email.api-key-notifications',
    enabled: 'email.enabled',
    magicLink: 'email.magic-link',
    organizationInvites: 'email.organization-invites',
    passwordReset: 'email.password-reset',
    verification: 'email.verification',
    welcome: 'email.welcome',
  },
  payments: {
    refunds: 'payments.refunds',
    stripe: 'payments.stripe',
    subscriptions: 'payments.subscriptions',
    trials: 'payments.trials',
  },
  ui: {
    animations: 'ui.animations',
    betaComponents: 'ui.beta-components',
    darkMode: 'ui.dark-mode',
    newNavigation: 'ui.new-navigation',
  },
  workflows: {
    batchProcessing: 'workflows.batch-processing',
    configuration: 'workflows.configuration',
    integrations: 'workflows.integrations',
    monitoring: 'workflows.monitoring',
    productClassification: 'workflows.product-classification',
    schedules: 'workflows.schedules',
  },
} as const;

export interface AnalyticsFlags {
  consentRequired: boolean;
  debug: boolean;
  enabled: boolean;
  googleEnabled: boolean;
  posthogEnabled: boolean;
  productionOnly: boolean;
  segmentEnabled: boolean;
}

export interface AuthFlags {
  apiKeysEnabled: boolean;
  discordOAuthEnabled: boolean;
  emailPasswordEnabled: boolean;
  githubOAuthEnabled: boolean;
  googleOAuthEnabled: boolean;
  impersonationEnabled: boolean;
  magicLinkEnabled: boolean;
  microsoftOAuthEnabled: boolean;
  organizationsEnabled: boolean;
  passkeyEnabled: boolean;
  twoFactorOptional: boolean;
  twoFactorRequired: boolean;
}

export interface PaymentFlags {
  creditsEnabled: boolean;
  invoicesEnabled: boolean;
  lemonSqueezyEnabled: boolean;
  refundsEnabled: boolean;
  stripeEnabled: boolean;
  subscriptionsEnabled: boolean;
  taxEnabled: boolean;
  trialsEnabled: boolean;
}

export interface AIFlags {
  anthropicEnabled: boolean;
  chatEnabled: boolean;
  codeGenerationEnabled: boolean;
  enabled: boolean;
  googleEnabled: boolean;
  moderationEnabled: boolean;
  openAIEnabled: boolean;
  rateLimitingEnabled: boolean;
}

export interface UIFlags {
  advancedTables: boolean;
  animationsEnabled: boolean;
  betaComponents: boolean;
  chartsEnabled: boolean;
  darkModeEnabled: boolean;
  mobileOptimized: boolean;
  newNavigation: boolean;
}

export interface WorkflowFlags {
  advancedFeatures: boolean;
  batchProcessingEnabled: boolean;
  configurationEnabled: boolean;
  experimentalWorkflows: boolean;
  integrationsEnabled: boolean;
  monitoringEnabled: boolean;
  productClassificationEnabled: boolean;
  schedulesEnabled: boolean;
}

export interface EmailFlags {
  apiKeyNotificationsEnabled: boolean;
  enabled: boolean;
  magicLinkEnabled: boolean;
  organizationInvitesEnabled: boolean;
  passwordResetEnabled: boolean;
  verificationEnabled: boolean;
  welcomeEmailEnabled: boolean;
}
