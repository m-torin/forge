/**
 * UI Examples exports
 * Complete working examples and integration patterns
 */

// AI SDK Integration examples
// Import for collection exports
import AiSdkIntegrationExample, { AiSdkIntegrationVariants } from './AiSdkIntegration';

export {
  default as AiSdkIntegrationExample,
  AiSdkIntegrationVariants,
  type AiSdkIntegrationExampleProps,
} from './AiSdkIntegration';

// Export examples as a collection for easy discovery
export const Examples = {
  AiSdkIntegration: AiSdkIntegrationExample,
  // Add more examples here as they are created
};

export const ExampleVariants = {
  AiSdkIntegration: AiSdkIntegrationVariants,
  // Add more example variants here
};
