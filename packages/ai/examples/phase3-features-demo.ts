/**
 * AI SDK v5 Phase 3 Features Demonstration
 * Showcases advanced media generation, lifecycle hooks, and experimental features
 */

import { openai } from '@ai-sdk/openai';

// Import Phase 3 features
import {
  // Lifecycle Hooks
  createLifecycleManager,
  // Retry Middleware
  createRetryMiddleware,
  // Audio Processing
  createSpeechManager,
  enhancedGeneration,
  imageGenerators,
  lifecyclePresets,
  outputProcessors,
  outputSchemas,
  quickAudio,
  quickImage,
  retryPresets,
  wrapModelWithLifecycle,
} from '../src/server';

/**
 * Demo 1: Image Generation Capabilities
 */
async function demoImageGeneration() {
  console.log('🖼️ Demo 1: Image Generation');

  // Basic image generation
  const basicImage = await quickImage.generate(
    'A serene mountain landscape at sunset with a crystal clear lake',
    { size: '1024x1024', quality: 'hd' },
  );

  console.log('Generated basic image:', {
    imagesCount: basicImage.images.length,
    model: basicImage.metadata.model,
    originalPrompt: basicImage.metadata.originalPrompt,
  });

  // Generate variations
  const variations = await quickImage.variations('A futuristic cityscape with flying cars', 3, {
    quality: 'hd',
  });

  console.log('Generated variations:', {
    totalImages: variations.metadata.totalImages,
    usage: variations.metadata.usage,
  });

  // Generate avatar
  const avatar = await quickImage.avatar('A friendly robot with blue LED eyes', {
    style: 'cartoon',
  });

  console.log('Generated avatar:', {
    imageUrl: avatar.images[0].url ? 'Generated' : 'N/A',
    revisedPrompt: avatar.images[0].revisedPrompt,
  });

  // Advanced generator with custom style
  const styledGenerator = imageGenerators.styled('cyberpunk');
  const cyberpunkImage = await styledGenerator.generate('A motorcycle in a neon-lit alley');

  console.log('Styled generation:', {
    model: cyberpunkImage.metadata.model,
    timestamp: new Date(cyberpunkImage.metadata.timestamp).toISOString(),
  });
}

/**
 * Demo 2: Audio Processing Capabilities
 */
async function demoAudioProcessing() {
  console.log('🎵 Demo 2: Audio Processing');

  // Text-to-speech
  const speech = await quickAudio.speak(
    'Welcome to the AI SDK version 5 demonstration. This showcases our advanced audio capabilities.',
    'nova',
  );

  console.log('Generated speech:', {
    audioSize: speech.audio.length,
    voice: speech.metadata.voice,
    format: speech.metadata.format,
    characters: speech.metadata.usage?.characters,
  });

  // Create narration
  const narration = await quickAudio.createNarration(
    'In a world where artificial intelligence has evolved beyond our wildest dreams, we explore the cutting-edge capabilities of modern language models and their integration with multimedia content.',
    'alloy',
  );

  console.log('Generated narration:', {
    audioSize: narration.audio.length,
    voice: narration.metadata.voice,
  });

  // Advanced speech manager
  const speechManager = createSpeechManager('tts-1-hd');

  // Generate with multiple voices for comparison
  const voiceComparison = await speechManager.generateWithVoices(
    'Hello, this is a voice comparison test.',
    ['alloy', 'echo', 'nova'],
  );

  console.log('Voice comparison:', {
    voicesGenerated: Object.keys(voiceComparison),
    totalAudioData: Object.values(voiceComparison).reduce(
      (sum, result) => sum + result.audio.length,
      0,
    ),
  });

  // Long text processing
  const longText = `
    The advancement of artificial intelligence represents one of the most significant technological
    developments of our time. From natural language processing to computer vision, AI systems are
    transforming industries and reshaping how we interact with technology. The integration of
    multimodal capabilities, including text, image, and audio processing, marks a new era in
    AI development where systems can understand and generate content across multiple formats
    seamlessly.
  `.trim();

  const longSpeech = await speechManager.generateLongText(longText, {
    chunkSize: 100,
    responseFormat: 'mp3',
  });

  console.log('Long text speech:', {
    chunksGenerated: longSpeech.audioChunks.length,
    totalDuration: longSpeech.totalDuration,
  });
}

/**
 * Demo 3: Enhanced Lifecycle Hooks
 */
async function demoLifecycleHooks() {
  console.log('🔄 Demo 3: Enhanced Lifecycle Hooks');

  // Create a lifecycle manager with custom hooks
  const lifecycleManager = createLifecycleManager({
    onGenerationStart: async context => {
      console.log(`🚀 Starting generation with ${context.modelId}`);
      console.log(`📝 Prompt: ${context.prompt?.slice(0, 50)}...`);

      // Example: Modify prompt based on context
      if (context.prompt?.includes('aggressive')) {
        return {
          continue: true,
          modifiedPrompt: context.prompt.replace('aggressive', 'assertive'),
          metadata: { promptModified: true },
        };
      }

      return { continue: true };
    },

    onGenerationComplete: async context => {
      console.log(`✅ Generation completed in ${context.duration}ms`);
      if (context.usage) {
        console.log(`💰 Token usage: ${context.usage.totalTokens} total`);
      }
    },

    onGenerationError: async context => {
      console.log(`❌ Generation error: ${context.error.message}`);
      // Retry logic can be implemented here
      return context.retryCount < 2; // Retry up to 2 times
    },

    onTokenUsage: async context => {
      // Track token usage for billing/monitoring
      console.log(`📊 Token tracking: ${JSON.stringify(context.usage)}`);
    },
  });

  // Wrap a model with lifecycle hooks
  const baseModel = openai('gpt-4o-mini');
  const enhancedModel = wrapModelWithLifecycle(baseModel, lifecycleManager);

  // Test the enhanced model
  console.log('Testing lifecycle-enhanced model...');

  try {
    const result = await enhancedModel.doGenerate({
      inputFormat: 'prompt',
      mode: { type: 'regular' },
      prompt: 'Explain the benefits of using AI in software development',
    });

    console.log('Result preview:', result.text.slice(0, 100) + '...');
  } catch (error) {
    console.error('Enhanced model error:', error.message);
  }

  // Use preset lifecycle configurations
  const _devLifecycle = lifecyclePresets.development();
  const _prodLifecycle = lifecyclePresets.production();

  console.log('Lifecycle presets available:', {
    development: 'Comprehensive logging enabled',
    production: 'Minimal logging, metrics focused',
    debug: 'Detailed inspection mode',
  });
}

/**
 * Demo 4: Retry Middleware
 */
async function demoRetryMiddleware() {
  console.log('🔄 Demo 4: Retry Middleware');

  const { wrapLanguageModel } = await import('ai');

  // Create model with retry middleware
  const modelWithRetry = wrapLanguageModel({
    model: openai('gpt-4o-mini'),
    middleware: [createRetryMiddleware(retryPresets.development())],
  });

  console.log('Testing retry middleware...');

  try {
    const result = await modelWithRetry.doGenerate({
      inputFormat: 'prompt',
      mode: { type: 'regular' },
      prompt: 'What are the key principles of resilient system design?',
    });

    console.log('Retry middleware result:', result.text.slice(0, 100) + '...');
  } catch (error) {
    console.error('Retry middleware error:', error.message);
  }

  // Demonstrate different retry presets
  const presets = {
    production: retryPresets.production(),
    realtime: retryPresets.realtime(),
    batch: retryPresets.batch(),
    network: retryPresets.network(),
  };

  console.log('Retry presets:', {
    production: `${presets.production.maxRetries} retries, ${presets.production.initialDelay}ms initial delay`,
    realtime: `${presets.realtime.maxRetries} retries, ${presets.realtime.initialDelay}ms initial delay`,
    batch: `${presets.batch.maxRetries} retries, ${presets.batch.initialDelay}ms initial delay`,
    network: `${presets.network.maxRetries} retries, ${presets.network.initialDelay}ms initial delay`,
  });
}

/**
 * Demo 5: Experimental Output Features
 */
async function demoExperimentalOutput() {
  console.log('🧪 Demo 5: Experimental Output Features');

  const model = openai('gpt-4o');

  // Enhanced text generation with analysis
  const enhancedText = await enhancedGeneration.text(
    model,
    'Write a product review for a new smartphone with advanced AI features',
    {
      enableAnalysis: true,
      enableFiltering: true,
    },
  );

  console.log('Enhanced text generation:', {
    originalLength: enhancedText.original.length,
    transformedLength: enhancedText.transformed.length,
    transformsApplied: enhancedText.metadata.transformsApplied,
    sentiment: enhancedText.metadata.sentiment,
    processingTime: `${enhancedText.metadata.processingTime}ms`,
  });

  // Enhanced object generation with repair
  const enhancedObject = await enhancedGeneration.object(
    model,
    outputSchemas.analysis,
    'Analyze the impact of artificial intelligence on modern education systems',
    {
      repairAttempts: 3,
      validationMode: 'repair',
    },
  );

  console.log('Enhanced object generation:', {
    analysis: enhancedObject.transformed,
    transformsApplied: enhancedObject.metadata.transformsApplied,
    validationErrors: enhancedObject.metadata.validationErrors,
  });

  // Content creation processor
  const contentProcessor = outputProcessors.contentCreation(model);

  const processedContent = await contentProcessor.generateEnhancedText(
    'Create a blog post about the future of renewable energy technology',
  );

  console.log('Content processor result:', {
    wordCount: processedContent.transformed.split(' ').length,
    sentiment: processedContent.metadata.sentiment,
    entities: processedContent.metadata.entities?.length || 0,
    summary: processedContent.metadata.summary?.slice(0, 100) + '...',
  });

  // Streaming with real-time processing
  console.log('Starting streaming demo...');

  const stream = await enhancedGeneration.stream(
    model,
    'Explain quantum computing concepts in simple terms',
    (chunk, accumulated) => {
      if (accumulated.length > 0 && accumulated.length % 50 === 0) {
        console.log(`📝 Accumulated ${accumulated.length} characters...`);
      }
    },
  );

  let finalText = '';
  for await (const chunk of stream) {
    finalText += chunk;
  }

  console.log('Streaming complete:', {
    finalLength: finalText.length,
    preview: finalText.slice(0, 100) + '...',
  });
}

/**
 * Demo 6: Integrated Features Showcase
 */
async function demoIntegratedFeatures() {
  console.log('🚀 Demo 6: Integrated Features Showcase');

  const { wrapLanguageModel } = await import('ai');

  // Create a fully enhanced model with all features
  const lifecycleManager = createLifecycleManager({
    onGenerationStart: async context => {
      console.log(`🎯 Enhanced generation starting: ${context.requestId}`);
      return { continue: true };
    },
    onGenerationComplete: async context => {
      console.log(`🎉 Enhanced generation completed in ${context.duration}ms`);
    },
  });

  const fullyEnhancedModel = wrapLanguageModel({
    model: wrapModelWithLifecycle(openai('gpt-4o'), lifecycleManager),
    middleware: [createRetryMiddleware(retryPresets.production())],
  });

  // Use the enhanced model for content creation
  const result = await fullyEnhancedModel.doGenerate({
    inputFormat: 'prompt',
    mode: { type: 'regular' },
    prompt: 'Create a comprehensive guide for implementing AI in small businesses',
  });

  console.log('Fully enhanced model result:', {
    contentLength: result.text.length,
    preview: result.text.slice(0, 150) + '...',
  });

  // Generate related audio content
  const audioContent = await quickAudio.createNarration(
    result.text.slice(0, 500), // First 500 characters
    'nova',
  );

  console.log('Generated audio narration:', {
    audioSize: audioContent.audio.length,
    estimatedDuration: Math.ceil(audioContent.audio.length / 16000) + 's',
  });

  // Generate visual content
  const visualContent = await quickImage.generate(
    'A modern office with AI technology integration, showing computers and digital interfaces',
    { quality: 'hd', style: 'natural' },
  );

  console.log('Generated visual content:', {
    imageGenerated: visualContent.images.length > 0,
    model: visualContent.metadata.model,
  });

  console.log('🎊 Integrated features demonstration complete!');
}

/**
 * Run all Phase 3 feature demos
 */
async function runPhase3Demos() {
  console.log('🚀 AI SDK v5 Phase 3 Features Demo');
  console.log('='.repeat(60));

  try {
    await demoImageGeneration();
    console.log('' + '='.repeat(60));

    await demoAudioProcessing();
    console.log('' + '='.repeat(60));

    await demoLifecycleHooks();
    console.log('' + '='.repeat(60));

    await demoRetryMiddleware();
    console.log('' + '='.repeat(60));

    await demoExperimentalOutput();
    console.log('' + '='.repeat(60));

    await demoIntegratedFeatures();
    console.log('' + '='.repeat(60));

    console.log('✅ All Phase 3 demos completed successfully!');
    console.log('🎉 AI SDK v5 implementation is now complete with all advanced features!');
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Export for external usage
export {
  demoAudioProcessing,
  demoExperimentalOutput,
  demoImageGeneration,
  demoIntegratedFeatures,
  demoLifecycleHooks,
  demoRetryMiddleware,
  runPhase3Demos,
};

// Run demos if called directly
if (require.main === module) {
  runPhase3Demos();
}
