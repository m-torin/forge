import { edgeConfigAdapter, identify, postHogServerAdapter } from '@repo/feature-flags';
import { flag } from 'flags/next';

// RAG feature toggle
export const ragEnabledFlag = flag<boolean>({
  key: 'rag-enabled',
  description: 'Enable RAG (Retrieval Augmented Generation) features',
  identify,
  adapter: postHogServerAdapter.isFeatureEnabled(),
});

// Chat model variant testing
export const chatModelFlag = flag<'gpt-4' | 'claude-3' | 'gemini-pro'>({
  key: 'chat-model',
  description: 'A/B test different chat models',
  identify,
  adapter: postHogServerAdapter.featureFlagValue(),
  defaultValue: 'gpt-4',
  options: [
    { label: 'GPT-4 (Control)', value: 'gpt-4' },
    { label: 'Claude-3 (Variant A)', value: 'claude-3' },
    { label: 'Gemini Pro (Variant B)', value: 'gemini-pro' },
  ],
});

// Enhanced search with fallback chain
export const enhancedSearchFlag = flag<boolean>({
  key: 'enhanced-search',
  description: 'Enable enhanced semantic search capabilities',
  identify,
  decide: async context => {
    // Try PostHog first
    try {
      const result = await postHogServerAdapter.isFeatureEnabled().decide(context);
      if (result !== undefined) return result;
    } catch (error) {
      console.warn('PostHog adapter failed:', error);
    }

    // Fallback to Edge Config
    try {
      return (await edgeConfigAdapter().decide(context)) ?? false;
    } catch (error) {
      console.warn('Edge Config adapter failed:', error);
      return false; // Ultimate fallback
    }
  },
});

// Analytics tracking toggle
export const analyticsTrackingFlag = flag<boolean>({
  key: 'analytics-tracking',
  description: 'Enable enhanced analytics tracking for chat interactions',
  identify,
  adapter: postHogServerAdapter.isFeatureEnabled(),
});

// Debug mode for development
export const debugModeFlag = flag<boolean>({
  key: 'debug-mode',
  description: 'Enable debug mode with additional logging',
  identify,
  decide: async context => {
    // Always enabled in development
    if (process.env.NODE_ENV === 'development') return true;

    // Check PostHog for production debug access
    try {
      return await postHogServerAdapter.isFeatureEnabled().decide(context);
    } catch {
      return false;
    }
  },
});

// Utility function for getting chat configuration
export async function getChatConfig() {
  const [ragEnabled, model, enhancedSearch, analyticsEnabled, debugMode] = await Promise.all([
    ragEnabledFlag(),
    chatModelFlag(),
    enhancedSearchFlag(),
    analyticsTrackingFlag(),
    debugModeFlag(),
  ]);

  return {
    rag: ragEnabled,
    model,
    search: enhancedSearch ? 'semantic' : 'basic',
    analytics: analyticsEnabled,
    debug: debugMode,
  };
}
