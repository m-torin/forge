// Client Components - Safe to use in any context
export { default as AlgoliaABTesting } from './AlgoliaABTesting';
export { default as AlgoliaAnalyticsDashboard } from './AlgoliaAnalyticsDashboard';
export { default as AlgoliaFeaturesShowcase } from './AlgoliaFeaturesShowcase';
export { default as AlgoliaInsightsDemo } from './AlgoliaInsightsDemo';
export { default as AlgoliaMultiIndex } from './AlgoliaMultiIndex';
export { default as AlgoliaNeuralSearch } from './AlgoliaNeuralSearch';
export { default as AlgoliaQueryRules } from './AlgoliaQueryRules';
export { default as AlgoliaRecommendDemo } from './AlgoliaRecommendDemo';
export { default as AlgoliaSynonyms } from './AlgoliaSynonyms';
export { default as AlgoliaVisualSearch } from './AlgoliaVisualSearch';
export { default as AdvancedAlgoliaSearch } from './AdvancedAlgoliaSearch';

// Production-ready components
export { default as ProductionFederatedAutocomplete } from './ProductionFederatedAutocomplete';
export { default as ComprehensiveAlgoliaShowcase } from './ComprehensiveAlgoliaShowcase';
export { default as NextJSProductSearch } from './NextJSProductSearch';

// Legacy components (still included for compatibility)
export { default as FederatedEcommerceAutocomplete } from './FederatedEcommerceAutocomplete';
export { NextJSSearchWrapper } from './NextJSSearchWrapper';
export { default as SearchAnalytics } from './SearchAnalytics';
export { SearchBoxClient } from './SearchBoxClient';
export { default as SimpleAlgoliaAutocomplete } from './SimpleAlgoliaAutocomplete';

// Server Components - Import directly, don't re-export through index
// These should only be imported directly in server contexts:
// - NextJSOptimizedSearch (use: import NextJSOptimizedSearch from './NextJSOptimizedSearch')
// - SearchFiltersServer (use: import { SearchFiltersServer } from './SearchFiltersServer')
// - SearchResultsServer (use: import { SearchResultsServer } from './SearchResultsServer')
// - SearchStatsServer (use: import { SearchStatsServer } from './SearchStatsServer')
