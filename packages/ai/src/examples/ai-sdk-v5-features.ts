/**
 * AI SDK v5 Features Examples
 * Demonstrates the new standardized AI SDK v5 capabilities
 */

import { chatFragments } from '../core/fragments';
import { ResponseUtils, responseUtils } from '../core/response-utils';
import { smoothStream, textTransforms } from '../core/stream-transforms';
import {
  generateText,
  processFullStream,
  StreamProcessor,
  streamText,
  streamTextWithFullStream,
} from '../generation';
import { TEMPS, TOKENS } from '../providers/shared';

/**
 * Example 1: Basic Text Generation with Callbacks
 */
export async function basicGenerationWithCallbacks() {
  const result = await generateText('Write a short poem about AI', {
    temperature: TEMPS.CREATIVE,
    maxOutputTokens: TOKENS.LONG,
    onError: ({ error }) => {
      console.error('Generation failed:', error.message);
    },
    onFinish: result => {
      console.log('Generation completed:', {
        tokens: result.usage.totalTokens,
        finishReason: result.finishReason,
      });
    },
  });

  console.log('Generated text:', result.message);
  console.log('Usage:', ResponseUtils.getUsage(result));
}

/**
 * Example 2: Enhanced Streaming with Full Stream Access
 */
export async function enhancedStreamingExample() {
  const { result, fullStream } = await streamTextWithFullStream(
    'Explain quantum computing in simple terms',
    {
      temperature: TEMPS.MODERATE + 0.1, // Slightly above moderate
      maxOutputTokens: TOKENS.EXTENDED,
      stream: true,
      onError: ({ error }: { error: Error }) => {
        console.log('[AI Stream] Error:', error.message);
      },
      onFinish: (result: any) => {
        console.log('[AI Stream] Finished:', {
          tokens: result.usage?.totalTokens,
          finishReason: result.finishReason,
        });
      },
    },
  );

  // Process the full stream with custom handlers
  const streamResult = await processFullStream(fullStream, {
    onStart: () => console.log('🚀 Stream started'),
    onTextDelta: text => process.stdout.write(text),
    onToolCall: toolCall => console.log('🔧 Tool called:', toolCall.toolName),
    onFinish: () => console.log('\n✅ Stream completed'),
  });

  console.log('\nFinal result:', streamResult.text);
  console.log('Tool calls made:', streamResult.toolCalls.length);
}

/**
 * Example 3: Stream Transformation with Smooth Streaming
 */
export async function streamTransformationExample() {
  const result = await streamText('Write a story about a robot learning to paint', {
    temperature: TEMPS.CREATIVE,
    maxOutputTokens: TOKENS.LONG,
    experimental_transform: smoothStream(),
  });

  console.log('Smoothed stream result:', result.message);
}

/**
 * Example 4: Advanced Stream Processing
 */
export async function advancedStreamProcessingExample() {
  const processor = new StreamProcessor(state => {
    console.log(`Progress: ${state.text.length} chars, ${state.events} events`);
  });

  const result = await processor.processFullStream('Analyze the benefits of renewable energy', {
    temperature: TEMPS.MODERATE + 0.1, // Slightly above moderate
    maxOutputTokens: TOKENS.EXTENDED,
    experimental_transform: textTransforms.filterWords(['bad', 'terrible']),
  });

  console.log('Processed result:', {
    text: result.text?.substring(0, 100) + '...',
    reasoning: result.reasoning?.substring(0, 50) + '...',
    events: result.events.length,
    toolCalls: result.toolCalls.length,
    sources: result.sources.length,
  });
}

/**
 * Example 5: Response Access Patterns
 */
export async function responseAccessExample() {
  const result = await generateText('What are the latest developments in machine learning?', {
    temperature: TEMPS.MODERATE + 0.1, // Slightly above moderate
    maxOutputTokens: TOKENS.EXTENDED,
  });

  // Use standardized response access
  const summary = ResponseUtils.createResponseSummary(result);
  console.log('Response Summary:', summary);

  const validation = ResponseUtils.validateResponse(result);
  if (!validation.isValid) {
    console.warn('Response issues:', validation.issues);
  }

  if (validation.warnings.length > 0) {
    console.warn('Response warnings:', validation.warnings);
  }

  // Extract specific information
  const headers = ResponseUtils.getHeaders(result);
  const steps = ResponseUtils.getSteps(result);
  const warnings = ResponseUtils.getWarnings(result);

  console.log('Response metadata:', {
    headerCount: Object.keys(headers).length,
    stepCount: steps.length,
    warningCount: warnings.length,
  });

  // Use convenience utilities
  const text = responseUtils.getText(result);
  const isSuccess = responseUtils.isSuccess(result);
  const finishReason = responseUtils.getFinishReason(result);

  console.log('Convenience access:', {
    textLength: text.length,
    success: isSuccess,
    finishReason,
  });
}

/**
 * Example 6: Error Handling Patterns
 */
export async function errorHandlingExample() {
  try {
    const result = await generateText('Invalid prompt that might cause issues', {
      ...chatFragments.basicChat,
      onError: ({ error }) => {
        console.error('Stream error occurred:', error.message);
      },
      onFinish: result => {
        console.log('Operation finished despite issues');
      },
    });

    if (!result.success) {
      const error = responseUtils.getError(result);
      console.error('Generation failed:', error?.message);
      return;
    }

    console.log('Success:', result.message);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

/**
 * Example 7: Combined Transform Pipeline
 */
export async function combinedTransformExample() {
  const result = await streamText('Write a technical explanation of neural networks', {
    temperature: TEMPS.LOW_CREATIVE,
    maxOutputTokens: TOKENS.EXTENDED,
    experimental_transform: [smoothStream(), textTransforms.filterWords(['complex', 'difficult'])],
  });

  console.log('Transformed result:', result.message);
}

/**
 * Example 8: Domain-Specific Configuration
 */
export async function domainSpecificExample() {
  // Customer support scenario
  const supportResult = await generateText('Customer is asking about refund policy', {
    temperature: TEMPS.MODERATE,
    maxOutputTokens: TOKENS.MEDIUM,
    onFinish: (result: any) => {
      console.log('[AI] Performance metrics:', {
        tokens: result.usage?.totalTokens,
        steps: result.steps?.length,
        warnings: result.warnings?.length,
      });
    },
  });

  // Legal document analysis
  const legalResult = await generateText('Analyze this contract clause for potential issues', {
    temperature: TEMPS.PRECISE,
    maxOutputTokens: TOKENS.LONG,
  });

  console.log('Domain results:', {
    support: supportResult.message?.substring(0, 100),
    legal: legalResult.message?.substring(0, 100),
  });
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('🚀 AI SDK v5 Features Examples\n');

  try {
    console.log('1. Basic Generation with Callbacks');
    await basicGenerationWithCallbacks();
    console.log('\n---\n');

    console.log('2. Enhanced Streaming');
    await enhancedStreamingExample();
    console.log('\n---\n');

    console.log('3. Stream Transformation');
    await streamTransformationExample();
    console.log('\n---\n');

    console.log('4. Advanced Stream Processing');
    await advancedStreamProcessingExample();
    console.log('\n---\n');

    console.log('5. Response Access Patterns');
    await responseAccessExample();
    console.log('\n---\n');

    console.log('6. Error Handling');
    await errorHandlingExample();
    console.log('\n---\n');

    console.log('7. Combined Transforms');
    await combinedTransformExample();
    console.log('\n---\n');

    console.log('8. Domain-Specific Configuration');
    await domainSpecificExample();
  } catch (error) {
    console.error('Example execution failed:', error);
  }
}

// Usage patterns summary for documentation
export const usagePatterns = {
  /**
   * When to use callbacks vs hooks vs transforms
   */
  guidelines: {
    callbacks: 'Use onError, onFinish, onChunk for simple event handling',
    hooks: 'Use experimental_streamHooks for more complex stream processing',
    transforms: 'Use experimental_transform for modifying stream content',
    fullStream: 'Use fullStream when you need access to all event types',
  },

  /**
   * Performance considerations
   */
  performance: {
    streaming: 'Always prefer streaming for user-facing applications',
    transforms: 'Combine transforms carefully to avoid performance overhead',
    callbacks: 'Keep callback functions lightweight to avoid blocking',
    fullStream: 'Only use fullStream when you need complete event control',
  },

  /**
   * Common patterns
   */
  common: {
    progressTracking: 'Use StreamProcessor with onUpdate callback',
    errorRecovery: 'Combine onError with retry logic in fragments',
    textFiltering: 'Use textTransforms.filterWords for content moderation',
    responseAccess: 'Use ResponseUtils for standardized response handling',
  },
};
