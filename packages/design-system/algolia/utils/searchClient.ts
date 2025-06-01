import { algoliasearch } from 'algoliasearch';
import type { SearchConfig } from '../types';

export function createSearchClient(config: SearchConfig) {
  const { appId, apiKey } = config;
  
  if (!appId || !apiKey) {
    throw new Error('Algolia App ID and API Key are required');
  }

  return algoliasearch(appId, apiKey);
}