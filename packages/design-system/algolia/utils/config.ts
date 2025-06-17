import { SearchConfig } from '../types';

export function getSearchConfig(): SearchConfig {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME;

  if (!appId || !apiKey || !indexName) {
    throw new Error(
      'Missing required Algolia environment variables. Please set NEXT_PUBLIC_ALGOLIA_APP_ID, NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY, and NEXT_PUBLIC_ALGOLIA_INDEX_NAME',
    );
  }

  return {
    apiKey,
    appId,
    indexName,
  };
}
