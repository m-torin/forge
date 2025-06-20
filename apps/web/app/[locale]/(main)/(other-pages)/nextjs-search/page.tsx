import NextJSOptimizedSearchPage from '@/components/search/NextJSOptimizedSearch';

// Re-export the component as the default export for the page
export default NextJSOptimizedSearchPage;

// Enable experimental features
export const experimental_ppr = true;

// Re-export metadata function
export { generateMetadata } from '@/components/search/NextJSOptimizedSearch';
