/**
 * Test fixtures for @repo/ai
 * Provides realistic data for testing AI interactions
 */

import { TEMPS, TOKENS, TOP_P } from '../providers/shared';

/**
 * Sample messages for conversation testing
 */
export const messageFixtures = {
  simple: [
    { role: 'user' as const, content: 'Hello' },
    { role: 'assistant' as const, content: 'Hi! How can I help you today?' },
  ],

  technical: [
    { role: 'user' as const, content: 'Explain how transformers work in AI' },
    {
      role: 'assistant' as const,
      content:
        'Transformers are a type of neural network architecture that uses self-attention mechanisms to process sequences of data. They consist of an encoder-decoder structure where the encoder processes the input sequence and the decoder generates the output sequence.',
    },
    { role: 'user' as const, content: 'Can you give me a simple example?' },
    {
      role: 'assistant' as const,
      content:
        'Sure! Think of translating "Hello world" from English to French. The encoder would process each word and understand the relationships between them, then the decoder would generate "Bonjour le monde" while paying attention to the most relevant parts of the input.',
    },
  ],

  multimodal: [
    {
      role: 'user' as const,
      content: [
        { type: 'text' as const, text: 'What do you see in this image?' },
        {
          type: 'image' as const,
          image: new URL('https://example.com/test-image.jpg'),
        },
      ],
    },
    {
      role: 'assistant' as const,
      content:
        'I can see a beautiful sunset over mountains with orange and pink colors in the sky.',
    },
  ],

  withTools: [
    { role: 'user' as const, content: 'What is the weather like in San Francisco?' },
    {
      role: 'assistant' as const,
      content: [
        {
          type: 'tool-getWeather' as const,
          toolCallId: 'call-weather-123',
          state: 'input-available',
          input: { location: 'San Francisco, CA' },
        },
      ],
    },
    {
      role: 'assistant' as const,
      content: [
        {
          type: 'tool-getWeather' as const,
          toolCallId: 'call-weather-123',
          toolName: 'getWeather',
          state: 'output-available',
          output: {
            location: 'San Francisco, CA',
            temperature: 68,
            condition: 'partly cloudy',
            humidity: 65,
            windSpeed: 12,
          },
        },
      ],
    },
    {
      role: 'assistant' as const,
      content:
        "The weather in San Francisco is currently 68°F and partly cloudy, with 65% humidity and wind speeds of 12 mph. It's a nice day!",
    },
  ],

  systemPrompted: [
    {
      role: 'system' as const,
      content:
        'You are a helpful customer service representative for TechCorp. Always be polite and professional.',
    },
    { role: 'user' as const, content: "I'm having trouble with my order" },
    {
      role: 'assistant' as const,
      content:
        "I'm sorry to hear you're experiencing issues with your order. I'd be happy to help you resolve this. Could you please provide me with your order number?",
    },
  ],

  longConversation: Array.from({ length: 20 }, (_, i) => [
    {
      role: 'user' as const,
      content: `This is message ${i + 1} from the user. ${i % 2 === 0 ? 'Can you help me?' : 'What do you think about this?'}`,
    },
    {
      role: 'assistant' as const,
      content: `This is response ${i + 1} from the assistant. ${i % 2 === 0 ? "I'd be happy to help!" : "That's an interesting question."}`,
    },
  ]).flat(),
};

/**
 * Sample schemas for structured generation
 */
export const schemaFixtures = {
  userProfile: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      age: { type: 'number', minimum: 0, maximum: 150 },
      interests: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['name', 'email'],
  },

  productReview: {
    type: 'object',
    properties: {
      rating: { type: 'number', minimum: 1, maximum: 5 },
      title: { type: 'string', maxLength: 100 },
      content: { type: 'string', maxLength: 1000 },
      sentiment: {
        type: 'string',
        enum: ['positive', 'negative', 'neutral'],
      },
      categories: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['quality', 'price', 'shipping', 'customer_service', 'features'],
        },
      },
    },
    required: ['rating', 'title', 'content', 'sentiment'],
  },

  meetingSummary: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      attendees: {
        type: 'array',
        items: { type: 'string' },
      },
      keyPoints: {
        type: 'array',
        items: { type: 'string' },
      },
      actionItems: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            task: { type: 'string' },
            assignee: { type: 'string' },
            dueDate: { type: 'string', format: 'date' },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
            },
          },
          required: ['task', 'assignee'],
        },
      },
      nextMeeting: { type: 'string', format: 'date-time' },
    },
    required: ['title', 'attendees', 'keyPoints'],
  },

  codeAnalysis: {
    type: 'object',
    properties: {
      language: { type: 'string' },
      complexity: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
      },
      issues: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['bug', 'performance', 'security', 'style', 'maintainability'],
            },
            severity: {
              type: 'string',
              enum: ['info', 'warning', 'error', 'critical'],
            },
            line: { type: 'number' },
            description: { type: 'string' },
            suggestion: { type: 'string' },
          },
          required: ['type', 'severity', 'description'],
        },
      },
      suggestions: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['language', 'complexity'],
  },
};

/**
 * Sample generated objects matching the schemas
 */
export const objectFixtures = {
  userProfile: {
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    age: 28,
    interests: ['technology', 'photography', 'hiking', 'cooking'],
  },

  productReview: {
    rating: 4,
    title: 'Great product, fast shipping!',
    content:
      'I ordered this product last week and it arrived quickly. The quality exceeded my expectations and the price was reasonable. Would definitely recommend to others.',
    sentiment: 'positive',
    categories: ['quality', 'price', 'shipping'],
  },

  meetingSummary: {
    title: 'Q4 Planning Meeting',
    attendees: ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson'],
    keyPoints: [
      'Reviewed Q3 performance metrics',
      'Discussed budget allocation for Q4',
      'Identified key initiatives for next quarter',
      'Addressed team capacity concerns',
    ],
    actionItems: [
      {
        task: 'Finalize Q4 budget proposal',
        assignee: 'Alice Johnson',
        dueDate: '2024-09-30',
        priority: 'high',
      },
      {
        task: 'Schedule team capacity planning session',
        assignee: 'Bob Smith',
        dueDate: '2024-09-25',
        priority: 'medium',
      },
    ],
    nextMeeting: '2024-10-01T14:00:00Z',
  },

  codeAnalysis: {
    language: 'typescript',
    complexity: 'medium',
    issues: [
      {
        type: 'performance',
        severity: 'warning',
        line: 42,
        description: 'Inefficient array iteration in hot path',
        suggestion: 'Consider using a for loop instead of Array.forEach for better performance',
      },
      {
        type: 'maintainability',
        severity: 'info',
        line: 15,
        description: 'Function has too many parameters',
        suggestion: 'Consider using an options object to group related parameters',
      },
    ],
    suggestions: [
      'Add JSDoc comments for better documentation',
      'Consider extracting utility functions to separate modules',
      'Add unit tests for edge cases',
    ],
  },
};

/**
 * RAG document fixtures
 */
export const ragFixtures = {
  documents: [
    {
      id: 'doc-1',
      title: 'Getting Started with AI',
      content:
        'Artificial Intelligence (AI) is a broad field of computer science focused on creating systems that can perform tasks that typically require human intelligence. This includes learning, reasoning, problem-solving, perception, and language understanding.',
      metadata: {
        source: 'documentation',
        category: 'basics',
        lastUpdated: '2024-01-15',
        author: 'AI Team',
      },
      embedding: Array.from({ length: 1536 }, () => Math.random()),
    },
    {
      id: 'doc-2',
      title: 'Machine Learning Fundamentals',
      content:
        'Machine Learning is a subset of AI that focuses on the development of algorithms and statistical models that enable computers to improve their performance on a specific task through experience, without being explicitly programmed.',
      metadata: {
        source: 'documentation',
        category: 'ml',
        lastUpdated: '2024-01-20',
        author: 'ML Team',
      },
      embedding: Array.from({ length: 1536 }, () => Math.random()),
    },
    {
      id: 'doc-3',
      title: 'Natural Language Processing',
      content:
        'Natural Language Processing (NLP) is a branch of AI that helps computers understand, interpret and manipulate human language. NLP draws from many disciplines, including computer science and computational linguistics.',
      metadata: {
        source: 'documentation',
        category: 'nlp',
        lastUpdated: '2024-01-25',
        author: 'NLP Team',
      },
      embedding: Array.from({ length: 1536 }, () => Math.random()),
    },
    {
      id: 'doc-4',
      title: 'Deep Learning Overview',
      content:
        'Deep Learning is a subset of machine learning that uses neural networks with multiple layers to model and understand complex patterns in data. It has been particularly successful in areas like image recognition, natural language processing, and game playing.',
      metadata: {
        source: 'documentation',
        category: 'deep-learning',
        lastUpdated: '2024-02-01',
        author: 'Deep Learning Team',
      },
      embedding: Array.from({ length: 1536 }, () => Math.random()),
    },
  ],

  queries: [
    {
      text: 'What is artificial intelligence?',
      expectedDocIds: ['doc-1'],
      category: 'definition',
    },
    {
      text: 'How does machine learning work?',
      expectedDocIds: ['doc-2', 'doc-1'],
      category: 'explanation',
    },
    {
      text: 'Tell me about NLP applications',
      expectedDocIds: ['doc-3'],
      category: 'application',
    },
    {
      text: 'What is the difference between ML and DL?',
      expectedDocIds: ['doc-2', 'doc-4'],
      category: 'comparison',
    },
  ],
};

/**
 * Tool call fixtures
 */
export const toolFixtures = {
  weatherTool: {
    description: 'Get current weather information for a location',
    inputSchema: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City and state, e.g. San Francisco, CA',
        },
        unit: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          default: 'fahrenheit',
        },
      },
      required: ['location'],
    },
    sampleCall: {
      toolCallId: 'call-weather-456',
      toolName: 'getWeather',
      args: { location: 'New York, NY', unit: 'fahrenheit' },
    },
    sampleResult: {
      location: 'New York, NY',
      temperature: 72,
      condition: 'sunny',
      humidity: 45,
      windSpeed: 8,
      forecast: [
        { day: 'Today', high: 75, low: 62, condition: 'sunny' },
        { day: 'Tomorrow', high: 73, low: 60, condition: 'partly cloudy' },
      ],
    },
  },

  calculatorTool: {
    description: 'Perform mathematical calculations',
    inputSchema: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: 'Mathematical expression to evaluate, e.g. "2 + 3 * 4"',
        },
      },
      required: ['expression'],
    },
    sampleCall: {
      toolCallId: 'call-calc-789',
      toolName: 'calculator',
      args: { expression: '(15 * 2) + 8 / 4' },
    },
    sampleResult: {
      expression: '(15 * 2) + 8 / 4',
      result: 32,
      steps: ['15 * 2 = 30', '8 / 4 = 2', '30 + 2 = 32'],
    },
  },

  searchTool: {
    description: 'Search the web for current information',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query',
        },
        maxResults: {
          type: 'number',
          default: 5,
          description: 'Maximum number of results to return',
        },
      },
      required: ['query'],
    },
    sampleCall: {
      toolCallId: 'call-search-101',
      toolName: 'webSearch',
      args: { query: 'latest AI developments 2024', maxResults: 3 },
    },
    sampleResult: {
      query: 'latest AI developments 2024',
      results: [
        {
          title: 'Major AI Breakthroughs in 2024',
          url: 'https://example.com/ai-2024',
          snippet: 'This year has seen significant advances in AI...',
        },
        {
          title: 'New AI Models Released This Year',
          url: 'https://example.com/new-models',
          snippet: 'Several new language models have been released...',
        },
      ],
      totalResults: 3,
    },
  },
};

/**
 * Error fixtures for testing error handling
 */
export const errorFixtures = {
  apiError: new Error('API request failed'),
  rateLimitError: Object.assign(new Error('Rate limit exceeded'), {
    name: 'AI_RateLimitError',
    code: 'RATE_LIMIT_EXCEEDED',
  }),
  timeoutError: Object.assign(new Error('Request timeout'), {
    name: 'AI_TimeoutError',
    code: 'TIMEOUT',
  }),
  quotaError: Object.assign(new Error('API quota exceeded'), {
    name: 'AI_QuotaError',
    code: 'QUOTA_EXCEEDED',
  }),
  validationError: Object.assign(new Error('Invalid input parameters'), {
    name: 'AI_ValidationError',
    code: 'VALIDATION_ERROR',
    details: {
      field: 'temperature',
      message: 'Must be between 0 and 2',
    },
  }),
};

/**
 * Usage and cost fixtures
 */
export const usageFixtures = {
  small: {
    inputTokens: 50,
    outputTokens: 25,
    totalTokens: 75,
    estimatedCost: 0.0015,
  },

  medium: {
    inputTokens: 500,
    outputTokens: 300,
    totalTokens: 800,
    estimatedCost: 0.016,
  },

  large: {
    inputTokens: 2000,
    outputTokens: 1500,
    totalTokens: 3500,
    estimatedCost: 0.07,
  },

  veryLarge: {
    inputTokens: 8000,
    outputTokens: 4000,
    totalTokens: 12000,
    estimatedCost: 0.24,
  },
};

/**
 * Configuration fixtures
 */
export const configFixtures = {
  basic: {
    model: 'mock/model',
    temperature: TEMPS.BALANCED,
    maxOutputTokens: TOKENS.SHORT,
  },

  precise: {
    model: 'mock/precise-model',
    temperature: TEMPS.VERY_LOW,
    maxOutputTokens: TOKENS.MEDIUM,
    topP: TOP_P.DETERMINISTIC,
  },

  creative: {
    model: 'mock/creative-model',
    temperature: TEMPS.CREATIVE + 0.3, // 1.2 for very high creativity
    maxOutputTokens: 1500, // Between MEDIUM and LONG
    topP: TOP_P.FOCUSED,
    frequencyPenalty: 0.5,
  },

  structured: {
    model: 'mock/structured-model',
    temperature: TEMPS.PRECISE,
    maxOutputTokens: TOKENS.LONG,
    responseFormat: { type: 'json_object' },
  },
};
