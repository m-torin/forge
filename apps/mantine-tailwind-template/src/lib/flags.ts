import { createBooleanFlag, createVariantFlag } from "@repo/feature-flags";

/**
 * Feature flags for the Mantine + Tailwind template app
 */

/**
 * Controls visibility of the language switcher in the header
 * Allows gradual rollout of internationalization features
 */
export const showLanguageSwitcher = createBooleanFlag(
  "show_language_switcher",
  {
    description: "Show/hide the language switcher in header",
    percentage: 100, // All users see the language switcher
  },
);

/**
 * Enhanced color scheme options with additional themes
 * Tests user preference for extended theme options
 */
const enhancedThemeOptions = createBooleanFlag("enhanced_theme_options", {
  description: "Enable enhanced color scheme options beyond light/dark/auto",
  percentage: 50, // 50% rollout for A/B testing
});

/**
 * A/B test for welcome message variants
 * Tests different welcome message styles for user engagement
 */
export const welcomeMessageVariant = createVariantFlag(
  "welcome_message_variant",
  [
    { label: "Default", value: "default" },
    { label: "Friendly", value: "friendly" },
    { label: "Professional", value: "professional" },
    { label: "Casual", value: "casual" },
  ],
  {
    description: "A/B test different welcome message styles",
  },
);

/**
 * Feature card display enhancement
 * Tests showing additional information on feature cards
 */
export const enhancedFeatureCards = createBooleanFlag(
  "enhanced_feature_cards",
  {
    description: "Show enhanced feature cards with additional information",
    percentage: 25, // Conservative rollout
  },
);

/**
 * Show beta features banner
 * Controls visibility of beta features promotion
 */
export const showBetaBanner = createBooleanFlag("show_beta_banner", {
  description: "Display beta features promotional banner",
  percentage: 10, // Limited visibility for testing
});

/**
 * Admin dashboard features
 * Shows advanced analytics and controls for admin users
 */
export const adminDashboardFeatures = createBooleanFlag(
  "admin_dashboard_features",
  {
    description: "Enable advanced admin dashboard features",
    percentage: 100, // Always on for admins when they exist
  },
);

/**
 * Enhanced analytics for authenticated users
 * Provides detailed user behavior tracking for logged-in users
 */
export const enhancedAuthAnalytics = createBooleanFlag(
  "enhanced_auth_analytics",
  {
    description: "Enhanced analytics tracking for authenticated users",
    percentage: 80, // High rollout for authenticated users
  },
);

/**
 * Personalized experience features
 * Shows personalized content and recommendations for auth users
 */
export const personalizedExperience = createBooleanFlag(
  "personalized_experience",
  {
    description: "Enable personalized content for authenticated users",
    percentage: 60, // Gradual rollout
  },
);

/**
 * Premium feature preview
 * Shows premium features preview for authenticated users
 */
export const premiumFeaturePreview = createVariantFlag(
  "premium_feature_preview",
  [
    { label: "None", value: "none" },
    { label: "Basic", value: "basic" },
    { label: "Advanced", value: "advanced" },
    { label: "Full", value: "full" },
  ],
  {
    description: "Level of premium features to preview for authenticated users",
  },
);

// Export all flags for middleware precomputation
export const allFlags = [
  showLanguageSwitcher,
  enhancedThemeOptions,
  welcomeMessageVariant,
  enhancedFeatureCards,
  showBetaBanner,
  adminDashboardFeatures,
  enhancedAuthAnalytics,
  personalizedExperience,
  premiumFeaturePreview,
] as const;
