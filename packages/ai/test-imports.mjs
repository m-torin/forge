// Test imports to verify they work
import { createCustomProvider } from './src/server/providers/custom-providers';
import { createDataStreamHelper } from './src/shared/streaming/data-stream';

console.log('✅ Direct imports work');
console.log('createCustomProvider:', typeof createCustomProvider);
console.log('createDataStreamHelper:', typeof createDataStreamHelper);
