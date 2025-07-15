// Centralized AI package mocks for all tests in the monorepo
import { vi } from 'vitest';

// Mock ai package
vi.mock('ai', () => ({
  streamText: vi.fn().mockResolvedValue({
    textStream: {
      [Symbol.asyncIterator]: async function* () {
        yield 'Mock streamed text';
      },
    },
    text: 'Mock response text',
    usage: { promptTokens: 10, completionTokens: 20 },
  }),
  generateText: vi.fn().mockResolvedValue({
    text: 'Mock generated text',
    usage: { promptTokens: 10, completionTokens: 20 },
  }),
  generateObject: vi.fn().mockResolvedValue({
    object: { key: 'value' },
    usage: { promptTokens: 10, completionTokens: 20 },
  }),
  embed: vi.fn().mockResolvedValue({
    embedding: [0.1, 0.2, 0.3],
    usage: { promptTokens: 10 },
  }),
  embedMany: vi.fn().mockResolvedValue({
    embeddings: [
      [0.1, 0.2, 0.3],
      [0.4, 0.5, 0.6],
    ],
    usage: { promptTokens: 20 },
  }),
  createStreamableUI: vi.fn(),
  createStreamableValue: vi.fn(),
  readStreamableValue: vi.fn(),
  createAI: vi.fn(),
  getMutableAIState: vi.fn(),
  getAIState: vi.fn(),
  render: vi.fn(),
}));

// Mock ai/react
vi.mock('ai/react', () => ({
  useChat: vi.fn(() => ({
    messages: [],
    input: '',
    setInput: vi.fn(),
    setMessages: vi.fn(),
    append: vi.fn().mockResolvedValue(undefined),
    reload: vi.fn(),
    stop: vi.fn(),
    isLoading: false,
    error: null,
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
  })),
  useCompletion: vi.fn(() => ({
    completion: '',
    input: '',
    setInput: vi.fn(),
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    stop: vi.fn(),
    isLoading: false,
    error: null,
    complete: vi.fn(),
  })),
  useAssistant: vi.fn(() => ({
    messages: [],
    input: '',
    setInput: vi.fn(),
    submitMessage: vi.fn(),
    status: 'idle',
    error: null,
    threadId: null,
    stop: vi.fn(),
  })),
}));

// Mock ai/mcp-stdio
vi.mock('ai/mcp-stdio', () => ({
  createMCPStdioProvider: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    execute: vi.fn(),
    getTools: vi.fn(() => []),
    getTool: vi.fn(),
  })),
}));

// Mock AI SDK providers
vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(() => ({
    chat: vi.fn(),
    completion: vi.fn(),
    embedding: vi.fn(),
  })),
  createOpenAI: vi.fn(() => ({
    chat: vi.fn(),
    completion: vi.fn(),
    embedding: vi.fn(),
  })),
}));

vi.mock('@ai-sdk/google', () => ({
  google: vi.fn(() => ({
    chat: vi.fn(),
    completion: vi.fn(),
    embedding: vi.fn(),
  })),
  createGoogleGenerativeAI: vi.fn(() => ({
    chat: vi.fn(),
    completion: vi.fn(),
    embedding: vi.fn(),
  })),
}));

vi.mock('@ai-sdk/perplexity', () => ({
  perplexity: vi.fn(() => ({
    chat: vi.fn(),
    completion: vi.fn(),
  })),
  createPerplexity: vi.fn(() => ({
    chat: vi.fn(),
    completion: vi.fn(),
  })),
}));

// Mock Stripe AI SDK
vi.mock('@stripe/agent-toolkit/ai-sdk', () => ({
  createStripeToolkit: vi.fn(() => ({
    tools: [],
    execute: vi.fn(),
  })),
}));

// Export helper functions for test setup
export const mockAIStreamResponse = (chunks: string[]) => {
  return {
    textStream: {
      [Symbol.asyncIterator]: async function* () {
        for (const chunk of chunks) {
          yield chunk;
        }
      },
    },
    text: chunks.join(''),
    usage: { promptTokens: 10, completionTokens: 20 },
  };
};

export const mockAIChatMessages = (messages: Array<{ role: string; content: string }>) => {
  return messages.map((msg, index) => ({
    id: `msg-${index}`,
    role: msg.role,
    content: msg.content,
    createdAt: new Date(),
  }));
};

export const resetAIMocks = () => {
  vi.clearAllMocks();
};

// Mock AI server tools modules
vi.mock('@/server/tools/enhanced-factory', () => ({
  createEnhancedTool: vi.fn().mockResolvedValue({ tool: {}, metadata: {} }),
  ToolBuilder: vi.fn().mockImplementation(() => ({
    withDescription: vi.fn().mockReturnThis(),
    withParameters: vi.fn().mockReturnThis(),
    withExecution: vi.fn().mockReturnThis(),
    build: vi.fn().mockReturnValue({}),
  })),
  EnhancedToolConfig: { safeParse: vi.fn().mockReturnValue({ success: true }) },
  addToolMiddleware: vi.fn().mockReturnValue({ middleware: {} }),
  createToolInterceptor: vi.fn().mockReturnValue({ execute: vi.fn() }),
  middlewareChain: vi.fn().mockReturnValue(() => {}),
  validateToolInput: vi.fn().mockResolvedValue({ success: true, data: {} }),
  sanitizeToolOutput: vi.fn().mockReturnValue({}),
  createInputValidator: vi.fn().mockReturnValue(() => {}),
  createCachedTool: vi.fn().mockReturnValue({ tool: {}, cache: {} }),
  toolMemoization: vi.fn().mockReturnValue(() => {}),
  invalidateToolCache: vi.fn().mockResolvedValue({ invalidated: true }),
  compositeTools: vi.fn().mockReturnValue({ execute: vi.fn() }),
  chainTools: vi.fn().mockReturnValue({ execute: vi.fn() }),
  parallelTools: vi.fn().mockReturnValue({ execute: vi.fn() }),
  versionedTool: vi.fn().mockReturnValue({ getCurrentVersion: vi.fn(), getVersion: vi.fn() }),
  checkToolCompatibility: vi.fn().mockResolvedValue({ compatible: true, migrations: [] }),
  migrateToolVersion: vi.fn().mockResolvedValue({ migrated: true }),
  instrumentTool: vi.fn().mockReturnValue({ tool: {}, metrics: {} }),
  getToolMetrics: vi.fn().mockResolvedValue({ executionCount: 0, averageLatency: 0, errorRate: 0 }),
  createToolDashboard: vi.fn().mockResolvedValue({ dashboard: {}, url: '' }),
  createToolTest: vi.fn().mockReturnValue({ run: vi.fn() }),
  runToolSuite: vi.fn().mockResolvedValue({ passed: 0, failed: 0, summary: {} }),
  validateToolQuality: vi.fn().mockResolvedValue({ score: 100, issues: [], recommendations: [] }),
  deployTool: vi.fn().mockResolvedValue({ deployed: true, deploymentId: '' }),
  retireTool: vi.fn().mockResolvedValue({ retired: true, sunsetDate: new Date() }),
  manageToolLifecycle: vi.fn().mockResolvedValue({ stage: '', nextActions: [] }),
}));

vi.mock('@/server/tools/bulk-tools', () => ({
  bulkInsert: vi.fn().mockResolvedValue({ inserted: 0 }),
  bulkUpdate: vi.fn().mockResolvedValue({ updated: 0 }),
  bulkDelete: vi.fn().mockResolvedValue({ deleted: 0 }),
  bulkStream: vi.fn().mockReturnValue({ stream: {} }),
  paginateBulk: vi.fn().mockReturnValue({ pages: [] }),
  streamBulkData: vi.fn().mockReturnValue({ stream: {} }),
  bulkWithRetry: vi.fn().mockResolvedValue({ success: true }),
  handleBulkErrors: vi.fn().mockReturnValue({ handled: true }),
}));

vi.mock('@/server/tools/metadata-tools', () => ({
  extractMetadata: vi.fn().mockResolvedValue({ metadata: {} }),
  validateMetadata: vi.fn().mockResolvedValue({ valid: true }),
  transformMetadata: vi.fn().mockReturnValue({ transformed: {} }),
  enrichMetadata: vi.fn().mockResolvedValue({ enriched: {} }),
  getCachedMetadata: vi.fn().mockResolvedValue({ cached: {} }),
  clearMetadataCache: vi.fn().mockResolvedValue({ cleared: true }),
  processMetadataBatch: vi.fn().mockResolvedValue({ processed: [] }),
  syncMetadata: vi.fn().mockResolvedValue({ synced: true }),
  backupMetadata: vi.fn().mockResolvedValue({ backed: true }),
  restoreMetadata: vi.fn().mockResolvedValue({ restored: true }),
  analyzeMetadata: vi.fn().mockResolvedValue({ analysis: {} }),
  optimizeMetadata: vi.fn().mockResolvedValue({ optimized: {} }),
  compressMetadata: vi.fn().mockReturnValue({ compressed: {} }),
  decompressMetadata: vi.fn().mockReturnValue({ decompressed: {} }),
  searchMetadata: vi.fn().mockResolvedValue({ results: [] }),
  indexMetadata: vi.fn().mockResolvedValue({ indexed: true }),
  exportMetadata: vi.fn().mockResolvedValue({ exported: {} }),
  importMetadata: vi.fn().mockResolvedValue({ imported: {} }),
  validateMetadataSchema: vi.fn().mockReturnValue({ valid: true }),
  migrateMetadata: vi.fn().mockResolvedValue({ migrated: true }),
}));

vi.mock('@/server/tools/range-tools', () => ({
  createRange: vi.fn().mockReturnValue({ range: {} }),
  validateRange: vi.fn().mockReturnValue({ valid: true }),
  RangeSchema: { safeParse: vi.fn().mockReturnValue({ success: true }) },
  numericRange: vi.fn().mockReturnValue({ range: [] }),
  expandRange: vi.fn().mockReturnValue({ expanded: [] }),
  compressRange: vi.fn().mockReturnValue({ compressed: [] }),
  processRangeData: vi.fn().mockResolvedValue({ processed: [] }),
  filterByRange: vi.fn().mockReturnValue({ filtered: [] }),
  mergeRanges: vi.fn().mockReturnValue({ merged: [] }),
  intersectRanges: vi.fn().mockReturnValue({ intersection: [] }),
  subtractRanges: vi.fn().mockReturnValue({ difference: [] }),
  validateRangeOverlap: vi.fn().mockReturnValue({ overlaps: false }),
  optimizeRanges: vi.fn().mockReturnValue({ optimized: [] }),
  createRangeIterator: vi.fn().mockReturnValue({ iterator: {} }),
  rangeToArray: vi.fn().mockReturnValue({ array: [] }),
  arrayToRange: vi.fn().mockReturnValue({ range: {} }),
  formatRange: vi.fn().mockReturnValue({ formatted: '' }),
  parseRange: vi.fn().mockReturnValue({ parsed: {} }),
  calculateRangeSize: vi.fn().mockReturnValue({ size: 0 }),
  isInRange: vi.fn().mockReturnValue({ inRange: false }),
  getRandomFromRange: vi.fn().mockReturnValue({ random: 0 }),
  splitRange: vi.fn().mockReturnValue({ split: [] }),
  joinRanges: vi.fn().mockReturnValue({ joined: {} }),
}));

vi.mock('@/server/tools/factory', () => ({
  tool: vi.fn().mockReturnValue({ tool: {} }),
  commonSchemas: { string: {}, number: {}, boolean: {} },
}));

vi.mock('@/server/tools/specifications', () => ({
  ToolSchemas: { basic: {}, advanced: {} },
  ToolSpecifications: { version: '1.0.0' },
  createToolFromSpec: vi.fn().mockReturnValue({ tool: {} }),
}));

vi.mock('@/server/tools/registry', () => ({
  registerTool: vi.fn().mockReturnValue({ registered: true }),
  getTool: vi.fn().mockReturnValue({ tool: {} }),
  listTools: vi.fn().mockReturnValue({ tools: [] }),
  unregisterTool: vi.fn().mockReturnValue({ unregistered: true }),
}));

vi.mock('@/server/tools/types', () => ({
  ToolType: { BASIC: 'basic', ADVANCED: 'advanced' },
  createToolType: vi.fn().mockReturnValue({ type: {} }),
}));

vi.mock('@/server/tools/execution-framework', () => ({
  createExecutionFramework: vi.fn().mockReturnValue({ framework: {} }),
  executeWithFramework: vi.fn().mockResolvedValue({ result: {} }),
  FrameworkConfig: { safeParse: vi.fn().mockReturnValue({ success: true }) },
}));

// Mock AI server artifacts
vi.mock('@/server/artifacts/index', () => ({
  ArtifactSchema: { safeParse: vi.fn().mockReturnValue({ success: true }) },
  DocumentArtifact: { safeParse: vi.fn().mockReturnValue({ success: true }) },
  manageArtifacts: vi.fn().mockResolvedValue({ data: [] }),
  retrieveArtifact: vi.fn().mockResolvedValue({ found: true, artifact: { id: 'test' } }),
  searchArtifacts: vi.fn().mockResolvedValue({ artifacts: [] }),
  getArtifactHistory: vi.fn().mockResolvedValue({ versions: [] }),
  rollbackArtifact: vi.fn().mockResolvedValue({ success: true }),
  processArtifact: vi.fn().mockResolvedValue({ processed: true }),
  convertArtifact: vi.fn().mockResolvedValue({ converted: true }),
  collaborateOnArtifact: vi.fn().mockResolvedValue({ success: true }),
  getArtifactPermissions: vi.fn().mockResolvedValue({ permissions: [] }),
  getArtifactMetrics: vi.fn().mockResolvedValue({ metrics: {} }),
  exportArtifact: vi.fn().mockResolvedValue({ exported: true }),
  importArtifact: vi.fn().mockResolvedValue({ imported: true }),
  validateArtifact: vi.fn().mockResolvedValue({ valid: true }),
  optimizeArtifact: vi.fn().mockResolvedValue({ optimized: true }),
  secureArtifact: vi.fn().mockResolvedValue({ secured: true }),
  createArtifactBackup: vi.fn().mockResolvedValue({ backedUp: true }),
  restoreArtifact: vi.fn().mockResolvedValue({ restored: true }),
  scheduleArtifactMaintenance: vi.fn().mockResolvedValue({ scheduled: true }),
  getArtifactHealth: vi.fn().mockResolvedValue({ healthy: true }),
  upgradeArtifact: vi.fn().mockResolvedValue({ upgraded: true }),
  createArtifactTemplate: vi.fn().mockResolvedValue({ template: {} }),
  applyArtifactTemplate: vi.fn().mockResolvedValue({ applied: true }),
  manageArtifactDependencies: vi.fn().mockResolvedValue({ dependencies: [] }),
  integrateArtifactSystems: vi.fn().mockResolvedValue({ integrated: true }),
}));

// Mock AI server workflows
vi.mock('@/server/workflows/vector-rag', () => ({
  initializeRAG: vi.fn().mockResolvedValue({ initialized: true }),
  processDocuments: vi.fn().mockResolvedValue({ processed: [] }),
  vectorSearch: vi.fn().mockResolvedValue({ results: [] }),
  generateRAGResponse: vi.fn().mockResolvedValue({ response: 'Generated response' }),
  multiQueryRAG: vi.fn().mockResolvedValue({ results: [] }),
  evaluateRAG: vi.fn().mockResolvedValue({ metrics: {} }),
  optimizeRAGParameters: vi.fn().mockResolvedValue({ optimized: true }),
  orchestrateRAGWorkflow: vi.fn().mockResolvedValue({ result: {} }),
  manageRAGContext: vi.fn().mockResolvedValue({ context: {} }),
  createRAGPipeline: vi.fn().mockResolvedValue({ pipeline: {} }),
  indexDocuments: vi.fn().mockResolvedValue({ indexed: true }),
  retrieveDocuments: vi.fn().mockResolvedValue({ documents: [] }),
  rerankDocuments: vi.fn().mockResolvedValue({ reranked: [] }),
  augmentQuery: vi.fn().mockResolvedValue({ augmented: 'query' }),
  generateResponse: vi.fn().mockResolvedValue({ response: 'response' }),
  evaluateRelevance: vi.fn().mockResolvedValue({ relevance: 0.8 }),
  optimizeRetrieval: vi.fn().mockResolvedValue({ optimized: true }),
  manageRAGMemory: vi.fn().mockResolvedValue({ memory: {} }),
  trackRAGMetrics: vi.fn().mockResolvedValue({ metrics: {} }),
  exportRAGData: vi.fn().mockResolvedValue({ exported: true }),
}));

// Mock AI shared UI loading messages
vi.mock('@/shared/ui/loading-messages', () => ({
  getRandomLoadingMessage: vi.fn().mockReturnValue('Loading...'),
  getLoadingMessages: vi.fn().mockReturnValue(['Loading...', 'Please wait...']),
  adaptiveMessages: vi.fn().mockReturnValue(['Loading...', 'Processing...']),
  contextualMessages: vi.fn().mockReturnValue(['Loading...', 'Working on it...']),
  progressiveMessages: vi.fn().mockReturnValue(['Starting...', 'In progress...', 'Almost done...']),
  timedMessages: vi.fn().mockReturnValue('This might take a moment...'),
  personalityMessages: vi.fn().mockReturnValue(['Loading...', 'Hang tight...']),
  casualMessages: vi.fn().mockReturnValue(['Loading...', 'Just a moment...']),
  professionalMessages: vi.fn().mockReturnValue(['Processing request...', 'Please wait...']),
  humorousMessages: vi.fn().mockReturnValue(['Loading awesomeness...', 'Thinking hard...']),
  encouragingMessages: vi.fn().mockReturnValue(['Almost there...', 'Making progress...']),
  updateLoadingState: vi.fn().mockReturnValue({ progress: 0.5, message: 'Loading...' }),
  resetLoadingState: vi.fn().mockReturnValue({ progress: 0, message: 'Starting...' }),
  getLoadingProgress: vi.fn().mockReturnValue(0.5),
  translateMessage: vi.fn().mockResolvedValue('Procesando...'),
  customizeMessage: vi.fn().mockReturnValue('Custom loading message'),
  addAriaLabels: vi.fn().mockReturnValue({ message: 'Loading...', ariaLabel: 'Loading content' }),
  screenReaderOptimized: vi.fn().mockReturnValue(['Loading step 1', 'Loading step 2']),
  generateLoadingSequence: vi
    .fn()
    .mockReturnValue(['Starting...', 'Processing...', 'Finalizing...']),
  createLoadingTheme: vi
    .fn()
    .mockReturnValue({ primary: 'Loading...', secondary: 'Please wait...' }),
  validateLoadingConfig: vi.fn().mockReturnValue({ valid: true, config: {} }),
  optimizeLoadingExperience: vi.fn().mockReturnValue({ optimized: true, suggestions: [] }),
}));

// Mock AI server models
vi.mock('@/server/models/selection', () => ({
  selectModel: vi.fn().mockReturnValue({ model: 'gpt-4', provider: 'openai' }),
  ModelSelector: vi.fn().mockReturnValue({ select: vi.fn() }),
  validateModelSelection: vi.fn().mockReturnValue({ valid: true }),
  getAvailableModels: vi.fn().mockReturnValue(['gpt-4', 'claude-3', 'llama-2']),
  compareModels: vi.fn().mockReturnValue({ comparison: {} }),
  optimizeModelChoice: vi.fn().mockReturnValue({ optimized: true }),
  createModelConfig: vi.fn().mockReturnValue({ config: {} }),
  switchModel: vi.fn().mockResolvedValue({ switched: true }),
  getModelCapabilities: vi.fn().mockReturnValue({ capabilities: [] }),
  benchmarkModel: vi.fn().mockResolvedValue({ performance: {} }),
}));

// Mock AI server providers
vi.mock('@/server/providers/anthropic', () => ({
  createAnthropicProvider: vi.fn().mockReturnValue({ provider: 'anthropic' }),
  configureClaude: vi.fn().mockReturnValue({ configured: true }),
  ClaudeModel: vi.fn().mockReturnValue({ model: 'claude-3' }),
  validateAnthropicConfig: vi.fn().mockReturnValue({ valid: true }),
  optimizeAnthropicSettings: vi.fn().mockReturnValue({ optimized: true }),
  handleAnthropicErrors: vi.fn().mockReturnValue({ handled: true }),
  getAnthropicUsage: vi.fn().mockResolvedValue({ usage: {} }),
  streamClaude: vi.fn().mockReturnValue({ stream: {} }),
  batchClaude: vi.fn().mockResolvedValue({ results: [] }),
  monitorAnthropicHealth: vi.fn().mockResolvedValue({ healthy: true }),
}));

vi.mock('@/server/providers/ai-sdk-utils', () => ({
  createAISDKProvider: vi.fn().mockReturnValue({ provider: 'ai-sdk' }),
  configureAISDK: vi.fn().mockReturnValue({ configured: true }),
  validateConfig: vi.fn().mockReturnValue({ valid: true, errors: [] }),
  mergeConfigurations: vi.fn().mockReturnValue({ merged: true }),
  optimizeAISDKSettings: vi.fn().mockReturnValue({ optimized: true }),
  handleAISDKErrors: vi.fn().mockReturnValue({ handled: true }),
  getAISDKUsage: vi.fn().mockResolvedValue({ usage: {} }),
  streamAISDK: vi.fn().mockReturnValue({ stream: {} }),
  batchAISDK: vi.fn().mockResolvedValue({ results: [] }),
  monitorAISDKHealth: vi.fn().mockResolvedValue({ healthy: true }),
}));
