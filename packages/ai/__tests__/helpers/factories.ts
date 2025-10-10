import type { JSONObject, SharedV2ProviderMetadata } from '@ai-sdk/provider';

export function makeProviderOptions(
  provider: 'openai' | 'anthropic' | 'google' | 'perplexity',
  opts: JSONObject = {},
) {
  return { providerOptions: { [provider]: opts } as unknown as SharedV2ProviderMetadata };
}

export function makeResult<T extends object = {}>(base: T = {} as T) {
  return { ...base } as T;
}

export const makeOpenAIResult = (meta: JSONObject = {}) =>
  makeResult(makeProviderOptions('openai', meta));
export const makeAnthropicResult = (meta: JSONObject = {}) =>
  makeResult(makeProviderOptions('anthropic', meta));
export const makePerplexityResult = (
  meta: JSONObject = {},
  extra: Partial<{ sources: any[] }> = {},
) => makeResult({ ...makeProviderOptions('perplexity', meta), ...extra });
export const makeGoogleResult = (meta: JSONObject = {}) =>
  makeResult(makeProviderOptions('google', meta));
