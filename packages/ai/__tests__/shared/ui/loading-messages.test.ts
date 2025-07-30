import type {
  LoadingContext,
  LoadingMessageConfig,
  UseLoadingMessagesOptions,
} from '#/shared/ui/loading-messages';
import { beforeEach, describe, expect, vi } from 'vitest';

describe('loading Messages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should import loading messages successfully', async () => {
    const loadingMessages = await import('#/shared/ui/loading-messages');
    expect(loadingMessages).toBeDefined();
    expect(loadingMessages.analyzeUserMessage).toBeTypeOf('function');
    expect(loadingMessages.getContextualLoadingMessage).toBeTypeOf('function');
    expect(loadingMessages.createLoadingMessageManager).toBeTypeOf('function');
    expect(loadingMessages.getRandomLoadingMessage).toBeTypeOf('function');
    expect(loadingMessages.getLoadingMessageForDuration).toBeTypeOf('function');
  });

  test('should analyze user message for code-related queries', async () => {
    const { analyzeUserMessage } = await import('#/shared/ui/loading-messages');

    const codeMessage = 'Can you help me debug this JavaScript function?';
    const context = analyzeUserMessage(codeMessage);

    expect(context.isCodeRelated).toBeTruthy();
    expect(context.isQuestion).toBeTruthy();
    expect(context.isDebugQuery).toBeTruthy();
    expect(context.isCreativeWriting).toBeFalsy();
    expect(context.isDataAnalysis).toBeFalsy();
  });

  test('should analyze user message for creative writing', async () => {
    const { analyzeUserMessage } = await import('#/shared/ui/loading-messages');

    const creativeMessage = 'Write me a short story about a robot';
    const context = analyzeUserMessage(creativeMessage);

    expect(context.isCreativeWriting).toBeTruthy();
    expect(context.isCodeRelated).toBeFalsy();
    expect(context.isQuestion).toBeFalsy();
    expect(context.isDataAnalysis).toBeFalsy();
  });

  test('should analyze user message for data analysis', async () => {
    const { analyzeUserMessage } = await import('#/shared/ui/loading-messages');

    const dataMessage = 'Analyze this dataset and show me the trends';
    const context = analyzeUserMessage(dataMessage);

    expect(context.isDataAnalysis).toBeTruthy();
    expect(context.isCodeRelated).toBeFalsy();
    expect(context.isCreativeWriting).toBeFalsy();
    expect(context.isQuestion).toBeFalsy();
  });

  test('should analyze user message for research queries', async () => {
    const { analyzeUserMessage } = await import('#/shared/ui/loading-messages');

    const researchMessage = 'Find information about climate change recent studies';
    const context = analyzeUserMessage(researchMessage);

    expect(context.isResearch).toBeTruthy();
    expect(context.isCodeRelated).toBeFalsy();
    expect(context.isCreativeWriting).toBeFalsy();
    expect(context.isDataAnalysis).toBeFalsy();
  });

  test('should analyze user message for technical queries', async () => {
    const { analyzeUserMessage } = await import('#/shared/ui/loading-messages');

    const technicalMessage =
      'Explain the architecture of microservices and their scalability patterns';
    const context = analyzeUserMessage(technicalMessage);

    expect(context.isTechnicalQuery).toBeTruthy();
    expect(context.isExplanation).toBeTruthy();
    expect(context.isQuestion).toBeTruthy(); // "Explain" triggers isQuestion
    expect(context.isCodeRelated).toBeFalsy();
  });

  test('should analyze user message for calculations', async () => {
    const { analyzeUserMessage } = await import('#/shared/ui/loading-messages');

    const calculationMessage = 'Calculate the compound interest for $1000 at 5% over 10 years';
    const context = analyzeUserMessage(calculationMessage);

    expect(context.needsCalculation).toBeTruthy();
    expect(context.isDataAnalysis).toBeTruthy(); // "Calculate" triggers isDataAnalysis
    expect(context.isCodeRelated).toBeFalsy();
  });

  test('should analyze complex requests', async () => {
    const { analyzeUserMessage } = await import('#/shared/ui/loading-messages');

    const complexMessage =
      'I need you to analyze this code, explain how it works, write tests for it, and then create documentation. The code is about implementing a distributed cache system with Redis and needs to handle high concurrency. Please also suggest performance optimizations.';
    const context = analyzeUserMessage(complexMessage);

    expect(context.isComplexRequest).toBeTruthy();
    expect(context.isCodeRelated).toBeTruthy();
    expect(context.isTechnicalQuery).toBeTruthy();
    expect(context.isExplanation).toBeTruthy();
  });

  test('should get contextual loading message for code context', async () => {
    const { getContextualLoadingMessage } = await import('#/shared/ui/loading-messages');

    const context = {
      isCodeRelated: true,
      isQuestion: false,
      isCreativeWriting: false,
      isDataAnalysis: false,
      isResearch: false,
      hasAttachments: false,
      mentionsTools: false,
      isComplexRequest: false,
      isTechnicalQuery: false,
      needsCalculation: false,
    };

    const message = getContextualLoadingMessage(context, 500);
    expect(message).toBeDefined();
    expect(typeof message).toBe('string');
    expect(message.length).toBeGreaterThan(0);
  });

  test('should get contextual loading message for different durations', async () => {
    const { getContextualLoadingMessage } = await import('#/shared/ui/loading-messages');

    const context = {
      isCodeRelated: true,
      isQuestion: false,
      isCreativeWriting: false,
      isDataAnalysis: false,
      isResearch: false,
      hasAttachments: false,
      mentionsTools: false,
      isComplexRequest: true,
      isTechnicalQuery: false,
      needsCalculation: false,
    };

    const shortMessage = getContextualLoadingMessage(context, 500);
    const mediumMessage = getContextualLoadingMessage(context, 2000);
    const longMessage = getContextualLoadingMessage(context, 4000);
    const veryLongMessage = getContextualLoadingMessage(context, 8000);

    expect(shortMessage).toBeDefined();
    expect(mediumMessage).toBeDefined();
    expect(longMessage).toBeDefined();
    expect(veryLongMessage).toBeDefined();

    expect(mediumMessage).toContain('This might take a moment');
    expect(longMessage).toContain('Almost there');
    // veryLongMessage can be any of the long messages
    expect(veryLongMessage).toMatch(
      /Thank you for|Processing a detailed response|Still working on|Taking extra care/,
    );
  });

  test('should create loading message manager', async () => {
    const { createLoadingMessageManager } = await import('#/shared/ui/loading-messages');

    const manager = createLoadingMessageManager();

    expect(manager).toBeDefined();
    expect(manager.analyze).toBeTypeOf('function');
    expect(manager.getMessage).toBeTypeOf('function');
    expect(manager.getToolMessage).toBeTypeOf('function');
  });

  test('should get tool-specific loading messages', async () => {
    const { createLoadingMessageManager } = await import('#/shared/ui/loading-messages');

    const manager = createLoadingMessageManager();

    const weatherMessage = manager.getToolMessage('weather');
    const codeMessage = manager.getToolMessage('code');
    const searchMessage = manager.getToolMessage('search');
    const unknownMessage = manager.getToolMessage('unknown-tool');

    expect(weatherMessage).toBeDefined();
    expect(codeMessage).toBeDefined();
    expect(searchMessage).toBeDefined();
    expect(unknownMessage).toBeDefined();

    expect(typeof weatherMessage).toBe('string');
    expect(typeof codeMessage).toBe('string');
    expect(typeof searchMessage).toBe('string');
    expect(typeof unknownMessage).toBe('string');
  });

  test('should get random loading message', async () => {
    const { getRandomLoadingMessage } = await import('#/shared/ui/loading-messages');

    const defaultMessage = getRandomLoadingMessage();
    const customMessage = getRandomLoadingMessage(['Custom message 1', 'Custom message 2']);

    expect(defaultMessage).toBeDefined();
    expect(customMessage).toBeDefined();
    expect(typeof defaultMessage).toBe('string');
    expect(typeof customMessage).toBe('string');
    expect(['Custom message 1', 'Custom message 2']).toContain(customMessage);
  });

  test('should get loading message for duration', async () => {
    const { getLoadingMessageForDuration } = await import('#/shared/ui/loading-messages');

    const shortMessage = getLoadingMessageForDuration(500);
    const longMessage = getLoadingMessageForDuration(6000);
    const codeMessage = getLoadingMessageForDuration(2000, { isCodeRelated: true });

    expect(shortMessage).toBeDefined();
    expect(longMessage).toBeDefined();
    expect(codeMessage).toBeDefined();

    expect(typeof shortMessage).toBe('string');
    expect(typeof longMessage).toBe('string');
    expect(typeof codeMessage).toBe('string');
  });

  test('should use custom analyzer function', async () => {
    const { analyzeUserMessage } = await import('#/shared/ui/loading-messages');

    const customAnalyzer = vi.fn().mockReturnValue({
      isCustomAnalyzed: true,
      isCodeRelated: false, // Override default analysis
    });

    const message = 'function test() { return true; }';
    const context = analyzeUserMessage(message, customAnalyzer);

    expect(customAnalyzer).toHaveBeenCalledWith(message);
    expect(context.isCustomAnalyzed).toBeTruthy();
    expect(context.isCodeRelated).toBeFalsy(); // Should be overridden
  });

  test('should handle custom message pools in config', async () => {
    const { createLoadingMessageManager } = await import('#/shared/ui/loading-messages');

    const config = {
      messages: {
        code: ['Custom code message'],
        default: ['Custom default message'],
      },
    };

    const manager = createLoadingMessageManager(config);

    const context = {
      isCodeRelated: true,
      isQuestion: false,
      isCreativeWriting: false,
      isDataAnalysis: false,
      isResearch: false,
      hasAttachments: false,
      mentionsTools: false,
      isComplexRequest: false,
      isTechnicalQuery: false,
      needsCalculation: false,
    };

    const message = manager.getMessage(context, 500);
    expect(message).toBe('Custom code message');
  });

  test('should handle custom thresholds in config', async () => {
    const { createLoadingMessageManager } = await import('#/shared/ui/loading-messages');

    const config = {
      thresholds: {
        short: 500,
        medium: 1500,
        long: 3000,
      },
    };

    const manager = createLoadingMessageManager(config);

    const context = {
      isCodeRelated: false,
      isQuestion: false,
      isCreativeWriting: false,
      isDataAnalysis: false,
      isResearch: false,
      hasAttachments: false,
      mentionsTools: false,
      isComplexRequest: true,
      isTechnicalQuery: false,
      needsCalculation: false,
    };

    const mediumMessage = manager.getMessage(context, 1000);
    expect(mediumMessage).toContain('This might take a moment');
  });

  test('should test interface types', async () => {
    const { analyzeUserMessage, getContextualLoadingMessage } = await import(
      '#/shared/ui/loading-messages'
    );

    // Test LoadingContext interface
    const context: LoadingContext = {
      isCodeRelated: true,
      isQuestion: false,
      isCreativeWriting: false,
      isDataAnalysis: false,
      isResearch: false,
      hasAttachments: false,
      mentionsTools: true,
      isComplexRequest: false,
      isTechnicalQuery: true,
      needsCalculation: false,
      isCustomAnalyzed: true,
    };
    expect(context.isCodeRelated).toBeTruthy();
    expect(context.isCustomAnalyzed).toBeTruthy();

    // Test LoadingMessageConfig interface
    const config: LoadingMessageConfig = {
      messages: {
        code: ['Analyzing code...', 'Processing syntax...'],
        technical: ['Checking technical details...'],
      },
      thresholds: {
        short: 1000,
        medium: 3000,
        long: 5000,
      },
    };
    expect(config.messages?.code).toHaveLength(2);

    // Test UseLoadingMessagesOptions interface
    const useOptions: UseLoadingMessagesOptions = {
      message: 'How do I implement a binary search?',
      startTime: Date.now(),
      updateInterval: 1000,
      messages: {
        code: ['Analyzing algorithm...'],
      },
    };
    expect(useOptions.message).toContain('binary search');
  });

  test('should handle all context types', async () => {
    const { analyzeUserMessage } = await import('#/shared/ui/loading-messages');

    const testCases = [
      { message: 'Translate this to Spanish', expectedFlags: ['isTranslation'] },
      { message: 'Summarize this article', expectedFlags: ['isSummarization'] },
      { message: 'Hello, how are you?', expectedFlags: ['isConversational'] },
      { message: 'Debug this error message', expectedFlags: ['isDebugQuery'] },
      { message: 'Explain how this works', expectedFlags: ['isExplanation'] },
      { message: 'What is machine learning?', expectedFlags: ['isQuestion'] },
      { message: 'Create a blog post about AI', expectedFlags: ['isCreativeWriting'] },
      { message: 'Analyze these sales numbers', expectedFlags: ['isDataAnalysis'] },
      { message: 'Research the latest trends', expectedFlags: ['isResearch'] },
      { message: 'Use the weather tool', expectedFlags: ['mentionsTools'] },
      {
        message:
          'This is a very long message that contains multiple sentences and ideas. It talks about various topics including technology, science, and philosophy. The message is designed to be complex and trigger the complex request flag.',
        expectedFlags: ['isComplexRequest'],
      },
      { message: 'Optimize the system architecture', expectedFlags: ['isTechnicalQuery'] },
      { message: 'Calculate the square root of 144', expectedFlags: ['needsCalculation'] },
    ];

    testCases.forEach(({ message, expectedFlags }) => {
      const context = analyzeUserMessage(message);
      expectedFlags.forEach(flag => {
        expect(context[flag as keyof typeof context]).toBeTruthy();
      });
    });
  });

  test('should handle tool loading messages', async () => {
    const { toolLoadingMessages } = await import('#/shared/ui/loading-messages');

    expect(toolLoadingMessages).toBeDefined();
    expect(toolLoadingMessages.weather).toBeDefined();
    expect(toolLoadingMessages.document).toBeDefined();
    expect(toolLoadingMessages.code).toBeDefined();
    expect(toolLoadingMessages.search).toBeDefined();
    expect(toolLoadingMessages.web).toBeDefined();
    expect(toolLoadingMessages.bash).toBeDefined();
    expect(toolLoadingMessages.api).toBeDefined();

    expect(Array.isArray(toolLoadingMessages.weather)).toBeTruthy();
    expect(toolLoadingMessages.weather.length).toBeGreaterThan(0);
    expect(typeof toolLoadingMessages.weather[0]).toBe('string');
  });
});
