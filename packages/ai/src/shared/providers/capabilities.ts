import type { Capability } from '../types';

export const CORE_CAPABILITIES: Capability[] = ['complete', 'stream'];
export const EXTENDED_CAPABILITIES: Capability[] = ['embed', 'generateObject', 'tools', 'vision'];
export const ANALYSIS_CAPABILITIES: Capability[] = [
  'moderate',
  'classify',
  'sentiment',
  'extraction',
  'analyze',
];

export const ALL_CAPABILITIES: Capability[] = [
  ...CORE_CAPABILITIES,
  ...EXTENDED_CAPABILITIES,
  ...ANALYSIS_CAPABILITIES,
];

export function hasRequiredCapabilities(
  providerCapabilities: Set<Capability>,
  requiredCapabilities: Capability[],
): boolean {
  return requiredCapabilities.every((cap) => providerCapabilities.has(cap));
}

export function getCapabilityDescription(capability: Capability): string {
  const descriptions: Record<Capability, string> = {
    analyze: 'General content analysis',
    classify: 'Text classification',
    complete: 'Text completion and generation',
    embed: 'Text embeddings',
    extraction: 'Entity extraction and NER',
    generateObject: 'Structured object generation',
    moderate: 'Content moderation and safety',
    sentiment: 'Sentiment analysis',
    stream: 'Streaming text generation',
    tools: 'Function calling and tool use',
    vision: 'Image understanding and analysis',
  };

  return descriptions[capability] || 'Unknown capability';
}
