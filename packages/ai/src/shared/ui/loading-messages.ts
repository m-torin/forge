/**
 * Contextual loading messages system for AI applications
 * Provides intelligent loading messages based on user query analysis
 */

export interface LoadingContext {
  isCodeRelated: boolean;
  isQuestion: boolean;
  isCreativeWriting: boolean;
  isDataAnalysis: boolean;
  isResearch: boolean;
  hasAttachments: boolean;
  mentionsTools: boolean;
  isComplexRequest: boolean;
  isTechnicalQuery: boolean;
  needsCalculation: boolean;
  // Additional context flags
  isTranslation?: boolean;
  isSummarization?: boolean;
  isConversational?: boolean;
  isDebugQuery?: boolean;
  isExplanation?: boolean;
}

export interface LoadingMessageConfig {
  // Message pools for different contexts
  messages?: {
    code?: string[];
    question?: string[];
    creative?: string[];
    data?: string[];
    research?: string[];
    calculation?: string[];
    tools?: string[];
    complex?: string[];
    technical?: string[];
    translation?: string[];
    summarization?: string[];
    conversation?: string[];
    debug?: string[];
    explanation?: string[];
    default?: string[];
  };
  // Duration thresholds
  thresholds?: {
    short?: number; // Default: 1000ms
    medium?: number; // Default: 3000ms
    long?: number; // Default: 5000ms
  };
  // Custom analyzer function
  analyzer?: (message: string) => Partial<LoadingContext>;
}

/**
 * Analyze user message to determine context
 */
export function analyzeUserMessage(
  message: string,
  customAnalyzer?: (message: string) => Partial<LoadingContext>,
): LoadingContext {
  // Base analysis
  const baseContext = {
    isCodeRelated:
      /\b(code|function|debug|error|bug|implement|program|script|api|class|method|variable|const|let|var|python|javascript|typescript|react|node|compile|syntax|import|export|async|await|promise)\b/i.test(
        message,
      ),
    isQuestion:
      message.includes('?') ||
      /\b(what|why|how|when|where|who|which|can you|could you|would you|explain|tell me|is it|are there|do you)\b/i.test(
        message,
      ),
    isCreativeWriting:
      /\b(write|story|poem|essay|article|blog|creative|draft|compose|generate text|narrative|fiction|prose|verse)\b/i.test(
        message,
      ),
    isDataAnalysis:
      /\b(analyze|data|chart|graph|statistics|metrics|numbers|calculate|sum|average|mean|median|trend|correlation|regression|dataset|csv|excel)\b/i.test(
        message,
      ),
    isResearch:
      /\b(research|find|search|look up|information about|tell me about|latest|recent|news|study|paper|article|source)\b/i.test(
        message,
      ),
    hasAttachments: false, // This should be set by the calling code
    mentionsTools:
      /\b(weather|document|create|update|search|perplexity|web|internet|tool|function|api|bash|command|terminal)\b/i.test(
        message,
      ),
    isComplexRequest:
      message.length > 200 || message.split('\n').length > 3 || message.split(/[.!?]/).length > 5,
    isTechnicalQuery:
      /\b(technical|architecture|system|design|pattern|algorithm|optimize|performance|scalability|infrastructure|deployment|security)\b/i.test(
        message,
      ),
    needsCalculation:
      /\b(calculate|compute|solve|equation|math|formula|arithmetic|algebra|calculus|probability|statistics)\b/i.test(
        message,
      ),
    isTranslation:
      /\b(translate|translation|convert to|in spanish|in french|in german|in chinese|in japanese|language)\b/i.test(
        message,
      ),
    isSummarization:
      /\b(summarize|summary|brief|tldr|tl;dr|key points|main points|overview|synopsis)\b/i.test(
        message,
      ),
    isConversational:
      /\b(chat|talk|discuss|conversation|hello|hi|hey|thanks|thank you|please|sorry)\b/i.test(
        message,
      ) && message.length < 100,
    isDebugQuery:
      /\b(debug|trace|stack|error|exception|crash|issue|problem|fix|troubleshoot|diagnose)\b/i.test(
        message,
      ),
    isExplanation:
      /\b(explain|clarify|elaborate|describe|what does|how does|why does|walkthrough|tutorial)\b/i.test(
        message,
      ),
  };

  // Apply custom analysis if provided
  if (customAnalyzer) {
    const customContext = customAnalyzer(message);
    return { ...baseContext, ...customContext };
  }

  return baseContext;
}

/**
 * Default message pools for different contexts
 */
const DEFAULT_MESSAGE_POOLS = {
  code: [
    'Analyzing your code request...',
    'Parsing the requirements...',
    'Understanding the context...',
    'Checking syntax patterns...',
    'Building code solution...',
    'Structuring the implementation...',
  ],
  question: [
    'Thinking about your question...',
    'Processing your query...',
    'Considering the best answer...',
    'Gathering relevant information...',
    'Formulating a response...',
    'Analyzing the question...',
  ],
  creative: [
    'Getting creative...',
    'Sparking imagination...',
    'Gathering inspiration...',
    'Crafting your content...',
    'Weaving words together...',
    'Creating something special...',
  ],
  data: [
    'Processing the data...',
    'Crunching numbers...',
    'Analyzing patterns...',
    'Computing statistics...',
    'Examining trends...',
    'Calculating results...',
  ],
  research: [
    'Searching for information...',
    'Looking into this topic...',
    'Gathering insights...',
    'Researching the subject...',
    'Finding relevant details...',
    'Exploring available resources...',
  ],
  calculation: [
    'Running calculations...',
    'Computing results...',
    'Processing numbers...',
    'Solving equations...',
    'Performing mathematical operations...',
    'Working through the math...',
  ],
  tools: [
    'Preparing tools...',
    'Setting up resources...',
    'Initializing functions...',
    'Loading capabilities...',
    'Configuring tools...',
    'Getting tools ready...',
  ],
  complex: [
    'Breaking down your request...',
    'Processing multiple aspects...',
    'Analyzing complexity...',
    'Working through the details...',
    'Handling your comprehensive request...',
    'Organizing the response...',
  ],
  technical: [
    'Analyzing technical requirements...',
    'Processing technical details...',
    'Examining specifications...',
    'Working through technical aspects...',
    'Evaluating technical approach...',
    'Considering implementation details...',
  ],
  translation: [
    'Translating content...',
    'Converting languages...',
    'Processing translation...',
    'Working on language conversion...',
    'Preparing translation...',
    'Interpreting text...',
  ],
  summarization: [
    'Creating summary...',
    'Extracting key points...',
    'Condensing information...',
    'Identifying main ideas...',
    'Preparing overview...',
    'Distilling content...',
  ],
  conversation: [
    'Processing...',
    'Thinking...',
    'Considering...',
    'Working on it...',
    'One moment...',
    'Let me see...',
  ],
  debug: [
    'Analyzing the issue...',
    'Debugging the problem...',
    'Tracing the error...',
    'Examining the code...',
    'Investigating the issue...',
    'Diagnosing the problem...',
  ],
  explanation: [
    'Preparing explanation...',
    'Breaking it down...',
    'Organizing the explanation...',
    'Structuring the answer...',
    'Clarifying the concept...',
    'Detailing the explanation...',
  ],
  default: [
    'Processing your request...',
    'Working on it...',
    'Thinking about this...',
    'Analyzing your input...',
    'Preparing response...',
    'One moment please...',
  ],
};

/**
 * Get contextual loading message based on context and duration
 */
export function getContextualLoadingMessage(
  context: LoadingContext,
  duration: number,
  config: LoadingMessageConfig = {},
): string {
  const thresholds = {
    short: config.thresholds?.short ?? 1000,
    medium: config.thresholds?.medium ?? 3000,
    long: config.thresholds?.long ?? 5000,
  };

  const messages = {
    ...DEFAULT_MESSAGE_POOLS,
    ...config.messages,
  };

  // Select appropriate message pool based on context priority
  let messagePool: string[] = messages.default || DEFAULT_MESSAGE_POOLS.default;

  if (context.isDebugQuery && messages.debug) {
    messagePool = messages.debug;
  } else if (context.isCodeRelated && messages.code) {
    messagePool = messages.code;
  } else if (context.isTechnicalQuery && messages.technical) {
    messagePool = messages.technical;
  } else if (context.isExplanation && messages.explanation) {
    messagePool = messages.explanation;
  } else if (context.isTranslation && messages.translation) {
    messagePool = messages.translation;
  } else if (context.isSummarization && messages.summarization) {
    messagePool = messages.summarization;
  } else if (context.isCreativeWriting && messages.creative) {
    messagePool = messages.creative;
  } else if (context.isDataAnalysis && messages.data) {
    messagePool = messages.data;
  } else if (context.isResearch && messages.research) {
    messagePool = messages.research;
  } else if (context.needsCalculation && messages.calculation) {
    messagePool = messages.calculation;
  } else if (context.mentionsTools && messages.tools) {
    messagePool = messages.tools;
  } else if (context.isComplexRequest && messages.complex) {
    messagePool = messages.complex;
  } else if (context.isQuestion && messages.question) {
    messagePool = messages.question;
  } else if (context.isConversational && messages.conversation) {
    messagePool = messages.conversation;
  }

  // Duration-based message selection
  if (duration < thresholds.short) {
    // Short duration - use simple messages
    return messagePool[Math.floor(Math.random() * messagePool.length)];
  } else if (duration < thresholds.medium) {
    // Medium duration - add more context
    const baseMessage = messagePool[Math.floor(Math.random() * messagePool.length)];
    if (context.isComplexRequest) {
      return `${baseMessage} This might take a moment...`;
    }
    return baseMessage;
  } else if (duration < thresholds.long) {
    // Long duration - acknowledge the wait
    if (context.isComplexRequest) {
      return 'Processing your comprehensive request. Almost there...';
    }
    if (context.isTechnicalQuery) {
      return 'Working through the technical details. Please wait...';
    }
    return 'This is taking a bit longer. Thank you for your patience...';
  } else {
    // Very long duration - apologetic messages
    const longMessages = [
      'This is taking longer than expected. Thank you for waiting...',
      'Still working on your request. Complex tasks take time...',
      'Processing a detailed response for you...',
      'Taking extra care with your request...',
    ];
    return longMessages[Math.floor(Math.random() * longMessages.length)];
  }
}

/**
 * Tool-specific loading messages
 */
export const toolLoadingMessages: Record<string, string[]> = {
  weather: [
    'Checking current conditions...',
    'Getting weather data...',
    'Looking at the forecast...',
    'Retrieving weather information...',
    'Checking meteorological data...',
  ],
  document: [
    'Preparing document...',
    'Setting up document structure...',
    'Creating your document...',
    'Organizing document content...',
    'Building document...',
  ],
  code: [
    'Analyzing code structure...',
    'Writing code solution...',
    'Checking syntax...',
    'Building implementation...',
    'Generating code...',
  ],
  search: [
    'Searching for information...',
    'Scanning knowledge base...',
    'Finding relevant results...',
    'Querying database...',
    'Looking for matches...',
  ],
  web: [
    'Searching the web...',
    'Gathering online information...',
    'Finding reliable sources...',
    'Browsing for results...',
    'Fetching web data...',
  ],
  bash: [
    'Preparing command...',
    'Setting up environment...',
    'Running command...',
    'Executing operation...',
    'Processing command...',
  ],
  api: [
    'Calling API...',
    'Fetching data...',
    'Making request...',
    'Retrieving information...',
    'Processing API response...',
  ],
};

/**
 * Create a loading message manager with custom configuration
 */
export function createLoadingMessageManager(config: LoadingMessageConfig = {}) {
  return {
    analyze: (message: string) => analyzeUserMessage(message, config.analyzer),
    getMessage: (context: LoadingContext, duration: number) =>
      getContextualLoadingMessage(context, duration, config),
    getToolMessage: (tool: string) => {
      const messages = toolLoadingMessages[tool] || toolLoadingMessages.api;
      return messages[Math.floor(Math.random() * messages.length)];
    },
  };
}

/**
 * React hook for loading messages (if using in React context)
 * This is a type definition - actual implementation would be in a React-specific package
 */
export interface UseLoadingMessagesOptions extends LoadingMessageConfig {
  message: string;
  startTime?: number;
  updateInterval?: number;
}

// Export convenience functions
export function getRandomLoadingMessage(pool: string[] = DEFAULT_MESSAGE_POOLS.default): string {
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getLoadingMessageForDuration(
  duration: number,
  context?: Partial<LoadingContext>,
): string {
  const fullContext: LoadingContext = {
    isCodeRelated: false,
    isQuestion: false,
    isCreativeWriting: false,
    isDataAnalysis: false,
    isResearch: false,
    hasAttachments: false,
    mentionsTools: false,
    isComplexRequest: false,
    isTechnicalQuery: false,
    needsCalculation: false,
    ...context,
  };

  return getContextualLoadingMessage(fullContext, duration);
}
