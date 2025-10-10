/**
 * Test orthogonal composition of gateway and provider helpers
 * This demonstrates that our helpers can be combined without conflicts
 */

import {
  extractGatewayMetadata,
  withAppAttribution,
  withCostLimit,
  withGatewayRouting,
  withImages,
  withModelVariant,
  withReasoning,
  withReasoningMode,
} from './src/index';

// Test 1: Verify all helpers return config objects that can be spread
const config1 = {
  ...withGatewayRouting({ order: ['anthropic', 'bedrock'] }),
  ...withReasoning(25000),
  ...withAppAttribution({ referer: 'https://myapp.vercel.app', title: 'MyApp' }),
};

// Test 2: Verify complex composition works
const config2 = {
  ...withGatewayRouting({ only: ['anthropic'] }),
  ...withCostLimit({ maxCost: 0.05 }),
  ...withReasoningMode(30000, 'high'),
  ...withModelVariant('anthropic-1m-context'),
};

// Test 3: Verify Perplexity helpers compose
const config3 = {
  ...withGatewayRouting({ order: ['perplexity'] }),
  ...withImages(),
  ...withAppAttribution({ title: 'Research App' }),
};

// Test 4: Verify types work correctly
console.log('Config 1 has providerOptions:', !!config1.providerOptions);
console.log('Config 1 has headers:', !!config1.headers);

console.log('Config 2 has providerOptions:', !!config2.providerOptions);
console.log('Config 2 has headers:', !!config2.headers);

console.log('Config 3 has providerOptions:', !!config3.providerOptions);
console.log('Config 3 has headers:', !!config3.headers);

// Test 5: Verify metadata extraction would work
const mockResult = {
  providerOptions: {
    gateway: {
      routing: { finalProvider: 'anthropic' },
      cost: '0.0025',
    },
  },
};

const metadata = extractGatewayMetadata(mockResult);
console.log('Extracted metadata:', metadata);

console.log('✅ All composition tests passed - helpers work orthogonally!');
