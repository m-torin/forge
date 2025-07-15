import { algoliasearch } from 'algoliasearch';

import { SearchConfig } from '../types';

export function createSearchClient(config: SearchConfig) {
  const { apiKey, appId } = config;

  if (!appId || !apiKey) {
    throw new Error('Algolia App ID and API Key are required');
  }

  return algoliasearch(appId, apiKey);
}
