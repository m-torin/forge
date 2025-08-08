/**
 * AI Test Data Generators
 * Following analytics package conventions for test data generation
 * Enhanced with AI SDK v5 specific data patterns
 */

import { z } from 'zod/v4';

/**
 * AI SDK Response Data Generators
 * Generate realistic test data for AI SDK responses
 */
export class AIResponseGenerators {
  /**
   * Generate realistic usage metrics
   */
  static generateUsage(
    options: {
      scale?: 'small' | 'medium' | 'large';
      variance?: boolean;
    } = {},
  ) {
    const { scale = 'medium', variance = true } = options;

    const baseValues = {
      small: { input: 10, output: 15 },
      medium: { input: 50, output: 75 },
      large: { input: 200, output: 300 },
    };

    const base = baseValues[scale];
    const varianceMultiplier = variance ? 0.8 + Math.random() * 0.4 : 1;

    return {
      inputTokens: Math.floor(base.input * varianceMultiplier),
      outputTokens: Math.floor(base.output * varianceMultiplier),
    };
  }

  /**
   * Generate realistic text responses
   */
  static generateTextResponses(count: number = 1, theme: string = 'general') {
    const themes = {
      general: [
        'This is a comprehensive response to your query.',
        'Based on the information provided, here are the key insights.',
        'Let me break this down into manageable parts for you.',
        'The analysis reveals several important patterns.',
        "Here's what you need to know about this topic.",
      ],
      technical: [
        'The implementation follows industry best practices.',
        'This approach leverages modern architectural patterns.',
        'The solution provides optimal performance characteristics.',
        'Integration requires careful consideration of dependencies.',
        'The system demonstrates robust error handling capabilities.',
      ],
      creative: [
        'Once upon a time, in a digital realm far away...',
        'The story unfolds with unexpected twists and turns.',
        'Characters emerge from the narrative with distinct voices.',
        'The plot develops through carefully crafted scenes.',
        'Emotions run deep as the story reaches its climax.',
      ],
    };

    const responses = themes[theme as keyof typeof themes] || themes.general;
    return Array.from(
      { length: count },
      (_, i) => responses[i % responses.length] || `Generated response ${i + 1}`,
    );
  }

  /**
   * Generate streaming text chunks
   */
  static generateStreamChunks(text: string, chunkSize: number = 5) {
    const words = text.split(' ');
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      chunks.push(chunk + (i + chunkSize < words.length ? ' ' : ''));
    }

    return chunks.map(chunk => ({ type: 'text', text: chunk }));
  }

  /**
   * Generate provider metadata
   */
  static generateProviderMetadata(provider: 'anthropic' | 'openai' | 'google' = 'anthropic') {
    const metadata = {
      anthropic: {
        cacheCreationInputTokens: Math.floor(Math.random() * 100),
        cacheReadInputTokens: Math.floor(Math.random() * 50),
      },
      openai: {
        systemFingerprint: `fp_${Math.random().toString(36).substring(2, 12)}`,
        inputTokens: Math.floor(Math.random() * 100),
        outputTokens: Math.floor(Math.random() * 150),
      },
      google: {
        safetyRatings: [
          { category: 'HARM_CATEGORY_HARASSMENT', probability: 'NEGLIGIBLE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', probability: 'NEGLIGIBLE' },
        ],
      },
    };

    return { [provider]: metadata[provider] };
  }
}

/**
 * Tool Execution Data Generators
 * Generate realistic tool call and result data
 */
export class ToolDataGenerators {
  /**
   * Generate weather tool data
   */
  static generateWeatherTool() {
    const locations = ['San Francisco', 'New York', 'London', 'Tokyo', 'Sydney'];
    const conditions = ['sunny', 'cloudy', 'rainy', 'snowy', 'partly cloudy'];

    return {
      description: 'Get the weather in a location',
      inputSchema: z.object({
        location: z.string().describe('The location to get the weather for'),
      }),
      sampleArgs: {
        location: locations[Math.floor(Math.random() * locations.length)],
      },
      sampleResult: {
        location: locations[Math.floor(Math.random() * locations.length)],
        temperature: Math.floor(Math.random() * 40) + 30, // 30-70°F
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        humidity: Math.floor(Math.random() * 50) + 30, // 30-80%
        windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 mph
      },
    };
  }

  /**
   * Generate calculator tool data
   */
  static generateCalculatorTool() {
    const operations = ['add', 'subtract', 'multiply', 'divide'] as const;
    const operation = operations[Math.floor(Math.random() * operations.length)];
    const a = Math.floor(Math.random() * 100) + 1;
    const b = Math.floor(Math.random() * 100) + 1;

    let result;
    switch (operation) {
      case 'add':
        result = a + b;
        break;
      case 'subtract':
        result = a - b;
        break;
      case 'multiply':
        result = a * b;
        break;
      case 'divide':
        result = Math.round((a / b) * 100) / 100;
        break;
    }

    return {
      description: 'Perform basic calculations',
      inputSchema: z.object({
        operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
        a: z.number(),
        b: z.number(),
      }),
      sampleArgs: { operation, a, b },
      sampleResult: { result },
    };
  }

  /**
   * Generate search tool data
   */
  static generateSearchTool() {
    const queries = [
      'artificial intelligence trends',
      'machine learning applications',
      'software development best practices',
      'cloud computing benefits',
      'data science methodologies',
    ];

    return {
      description: 'Search for information on the web',
      inputSchema: z.object({
        query: z.string().describe('The search query'),
        limit: z.number().optional().describe('Number of results to return'),
      }),
      sampleArgs: {
        query: queries[Math.floor(Math.random() * queries.length)],
        limit: Math.floor(Math.random() * 5) + 3, // 3-7 results
      },
      sampleResult: {
        results: Array.from({ length: 3 }, (_, i) => ({
          title: `Search Result ${i + 1}`,
          url: `https://example.com/result-${i + 1}`,
          snippet: `This is a sample snippet for search result ${i + 1} containing relevant information.`,
        })),
        totalFound: Math.floor(Math.random() * 1000) + 100,
      },
    };
  }

  /**
   * Generate multi-step tool workflow
   */
  static generateMultiStepWorkflow(steps: number = 3) {
    const tools = [
      this.generateWeatherTool(),
      this.generateCalculatorTool(),
      this.generateSearchTool(),
    ];

    return Array.from({ length: steps }, (_, i) => {
      const tool = tools[i % tools.length];
      return {
        stepNumber: i,
        stepType: i === 0 ? 'initial' : 'tool-result',
        toolCall: {
          toolCallId: `call_${i + 1}`,
          toolName: tool.description.split(' ')[0].toLowerCase(),
          args: tool.sampleArgs,
        },
        toolResult:
          i > 0
            ? {
                toolCallId: `call_${i}`,
                toolName: tools[(i - 1) % tools.length].description.split(' ')[0].toLowerCase(),
                result: tools[(i - 1) % tools.length].sampleResult,
              }
            : undefined,
        usage: AIResponseGenerators.generateUsage({ scale: 'small' }),
      };
    });
  }
}

/**
 * Telemetry Data Generators
 * Generate realistic telemetry and observability data
 */
export class TelemetryDataGenerators {
  /**
   * Generate telemetry metadata
   */
  static generateTelemetryMetadata(
    context: {
      userId?: string;
      sessionId?: string;
      feature?: string;
      environment?: 'development' | 'staging' | 'production';
    } = {},
  ) {
    const {
      userId = `user_${Math.random().toString(36).substring(2, 12)}`,
      sessionId = `session_${Math.random().toString(36).substring(2, 16)}`,
      feature = 'ai-interaction',
      environment = 'development',
    } = context;

    return {
      userId,
      sessionId,
      feature,
      environment,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      platform: 'web',
      userAgent: 'Mozilla/5.0 (compatible; test-agent)',
    };
  }

  /**
   * Generate observability system data
   */
  static generateObservabilityData(system: 'langfuse' | 'langsmith' | 'braintrust' = 'langfuse') {
    const traceId = `trace_${Math.random().toString(36).substring(2, 16)}`;
    const spanId = `span_${Math.random().toString(36).substring(2, 12)}`;

    const commonData = {
      traceId,
      spanId,
      timestamp: Date.now(),
      duration: Math.floor(Math.random() * 5000) + 100, // 100-5100ms
    };

    const systemSpecific = {
      langfuse: {
        ...commonData,
        sessionId: `lf_session_${Math.random().toString(36).substring(2, 12)}`,
        version: 'v1.0.0',
        userId: `lf_user_${Math.random().toString(36).substring(2, 10)}`,
      },
      langsmith: {
        ...commonData,
        runId: `ls_run_${Math.random().toString(36).substring(2, 16)}`,
        projectName: 'ai-package-testing',
        tags: ['ai-sdk-v5', 'testing', 'context7'],
      },
      braintrust: {
        ...commonData,
        experimentId: `bt_exp_${Math.random().toString(36).substring(2, 12)}`,
        projectId: `bt_proj_${Math.random().toString(36).substring(2, 10)}`,
        scores: {
          accuracy: Math.random(),
          relevance: Math.random(),
          coherence: Math.random(),
        },
      },
    };

    return systemSpecific[system];
  }
}

/**
 * Error and Edge Case Generators
 * Generate realistic error scenarios and edge cases
 */
export class ErrorDataGenerators {
  /**
   * Generate API error responses
   */
  static generateAPIErrors() {
    const errors = [
      {
        type: 'RateLimitError',
        message: 'Rate limit exceeded. Please try again later.',
        code: 429,
        retryAfter: Math.floor(Math.random() * 60) + 30, // 30-90 seconds
      },
      {
        type: 'AuthenticationError',
        message: 'Invalid API key provided.',
        code: 401,
      },
      {
        type: 'ModelOverloadError',
        message: 'Model is currently overloaded. Please try again.',
        code: 503,
        retryAfter: Math.floor(Math.random() * 30) + 10, // 10-40 seconds
      },
      {
        type: 'ValidationError',
        message: 'Input validation failed.',
        code: 400,
        details: {
          field: 'prompt',
          issue: 'Prompt cannot be empty',
        },
      },
      {
        type: 'TimeoutError',
        message: 'Request timed out after 30 seconds.',
        code: 408,
      },
    ];

    return errors[Math.floor(Math.random() * errors.length)];
  }

  /**
   * Generate tool execution errors
   */
  static generateToolErrors() {
    const toolErrors = [
      {
        toolName: 'weather',
        error: 'Location not found',
        code: 'LOCATION_NOT_FOUND',
      },
      {
        toolName: 'calculator',
        error: 'Division by zero',
        code: 'MATH_ERROR',
      },
      {
        toolName: 'search',
        error: 'Search service unavailable',
        code: 'SERVICE_UNAVAILABLE',
      },
    ];

    return toolErrors[Math.floor(Math.random() * toolErrors.length)];
  }

  /**
   * Generate streaming errors
   */
  static generateStreamErrors() {
    const streamErrors = [
      {
        type: 'ConnectionError',
        message: 'Stream connection lost',
        recoverable: true,
      },
      {
        type: 'ParseError',
        message: 'Failed to parse streaming response',
        recoverable: false,
      },
      {
        type: 'BufferOverflowError',
        message: 'Stream buffer exceeded maximum size',
        recoverable: false,
      },
    ];

    return streamErrors[Math.floor(Math.random() * streamErrors.length)];
  }
}

/**
 * Realistic Test Scenarios
 * Generate complete, realistic test scenarios
 */
export class TestScenarioGenerators {
  /**
   * Generate a complete chat interaction scenario
   */
  static generateChatScenario() {
    const user = TelemetryDataGenerators.generateTelemetryMetadata();
    const conversation = [
      'Hello, I need help with planning a trip.',
      'Can you tell me about the weather in Tokyo?',
      'What about restaurants in that area?',
      'Thank you for the recommendations!',
    ];

    return {
      user,
      conversation,
      expectedResponses: conversation.map(
        (_, i) => AIResponseGenerators.generateTextResponses(1, 'general')[0],
      ),
      toolUsage: [
        null, // First message doesn't use tools
        ToolDataGenerators.generateWeatherTool(),
        ToolDataGenerators.generateSearchTool(),
        null, // Thank you message doesn't use tools
      ],
    };
  }

  /**
   * Generate a complex multi-step analysis scenario
   */
  static generateAnalysisScenario() {
    const steps = ToolDataGenerators.generateMultiStepWorkflow(4);
    const telemetry = TelemetryDataGenerators.generateTelemetryMetadata({
      feature: 'data-analysis',
      environment: 'production',
    });

    return {
      prompt: 'Analyze the current market trends and provide recommendations.',
      expectedSteps: steps.length,
      telemetry,
      observability: TelemetryDataGenerators.generateObservabilityData('langfuse'),
      finalResponse: AIResponseGenerators.generateTextResponses(1, 'technical')[0],
    };
  }

  /**
   * Generate an error recovery scenario
   */
  static generateErrorRecoveryScenario() {
    const initialError = ErrorDataGenerators.generateAPIErrors();
    const retryAttempts = Math.floor(Math.random() * 3) + 1;

    return {
      initialRequest: {
        prompt: 'Generate a summary of recent AI developments.',
        telemetry: TelemetryDataGenerators.generateTelemetryMetadata(),
      },
      initialError,
      retryAttempts,
      finalSuccess: {
        response: AIResponseGenerators.generateTextResponses(1, 'technical')[0],
        usage: AIResponseGenerators.generateUsage({ scale: 'medium' }),
      },
    };
  }
}

/**
 * Export all generators for easy importing
 */
export const TestDataGenerators = {
  AI: AIResponseGenerators,
  Tools: ToolDataGenerators,
  Telemetry: TelemetryDataGenerators,
  Errors: ErrorDataGenerators,
  Scenarios: TestScenarioGenerators,
};
