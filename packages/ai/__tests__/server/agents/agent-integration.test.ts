/**
 * AI SDK v5 Agent Integration Tests
 * Comprehensive tests for all advanced agent features working together
 */

import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

import type { ModelMessage } from 'ai';
import { tool } from 'ai';
import { z } from 'zod/v4';

// Import all advanced agent features
import { AgentCommunicationManager } from '../../../src/server/agents/agent-communication';
import { agentConfigurationTemplates } from '../../../src/server/agents/agent-configuration-templates';
import { AgentMemoryManager } from '../../../src/server/agents/agent-memory';
import { AgentObservabilityManager } from '../../../src/server/agents/agent-observability';
import { DynamicToolManager } from '../../../src/server/agents/tool-management-dynamic';

// Setup minimal test environment
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('OPENAI_API_KEY', 'test-key');
vi.stubEnv('ANTHROPIC_API_KEY', 'test-key');

// Mock AI SDK providers
vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn().mockReturnValue('mocked-openai-model'),
}));

vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: vi.fn().mockReturnValue('mocked-anthropic-model'),
}));

// Mock observability
vi.mock('@repo/observability/server/next', () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));

// Mock AI SDK tool function
vi.mock('ai', () => ({
  tool: vi.fn(),
}));

describe('agent Integration Tests', () => {
  let memoryManager: AgentMemoryManager;
  let communicationManager: AgentCommunicationManager;
  let toolManager: DynamicToolManager;
  let observabilityManager: AgentObservabilityManager;

  beforeEach(() => {
    memoryManager = new AgentMemoryManager('integration-agent', {
      maxEntries: 1000,
      retentionDays: 7,
      searchEnabled: true,
      persistenceEnabled: false,
    });

    communicationManager = new AgentCommunicationManager();

    toolManager = new DynamicToolManager({
      cacheEnabled: true,
      performanceTracking: true,
      autoOptimization: true,
    });

    observabilityManager = new AgentObservabilityManager({
      enableTracing: true,
      enablePerformanceTracking: true,
      enableHealthChecks: true,
      traceLevel: 'info',
      retentionDays: 7,
      maxTraceEvents: 1000,
      performanceSnapshotInterval: 60000,
      healthCheckInterval: 300000,
      alertThresholds: {
        maxExecutionTime: 60000,
        maxTokenUsage: 10000,
        minSuccessRate: 0.8,
        maxErrorRate: 0.2,
      },
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('multi-Agent Customer Support Scenario', () => {
    test('should coordinate multiple agents for customer support', async () => {
      // Set up customer support scenario with specialized agents
      const supportAgent = 'customer-support-agent';
      const knowledgeAgent = 'knowledge-base-agent';
      const escalationAgent = 'escalation-agent';

      // Register agents with capabilities
      communicationManager.registerAgent(supportAgent, [
        {
          name: 'customer_interaction',
          description: 'Handle customer inquiries',
          cost: 1,
          quality: 0.9,
          availability: 1.0,
          requirements: [],
          outputs: ['response'],
        },
      ]);

      communicationManager.registerAgent(knowledgeAgent, [
        {
          name: 'knowledge_search',
          description: 'Search knowledge base',
          cost: 2,
          quality: 0.95,
          availability: 0.9,
          requirements: ['database_access'],
          outputs: ['knowledge'],
        },
      ]);

      communicationManager.registerAgent(escalationAgent, [
        {
          name: 'technical_support',
          description: 'Handle complex technical issues',
          cost: 5,
          quality: 0.85,
          availability: 0.7,
          requirements: ['expert_knowledge'],
          outputs: ['solution'],
        },
      ]);

      // Start observability tracing for the support agent
      const traceId = observabilityManager.startTrace(supportAgent, 'support-session-1');

      // Simulate customer inquiry
      const customerMessage: ModelMessage = {
        role: 'user',
        content: "I'm having trouble connecting to your API. The authentication keeps failing.",
      };

      memoryManager.addMessage(customerMessage);
      memoryManager.addMemory(
        'conversation',
        'Customer reports API authentication issues',
        { priority: 'high', category: 'technical' },
        0.9,
        ['api', 'authentication', 'technical_issue'],
      );

      // Support agent requests knowledge search
      const knowledgeRequestId = await communicationManager.sendMessage({
        from: supportAgent,
        to: knowledgeAgent,
        type: 'request',
        priority: 'high',
        subject: 'API Authentication Issue',
        content: 'Customer experiencing authentication failures. Need troubleshooting steps.',
        metadata: { sessionId: 'support-session-1', issue: 'api_auth' },
        requiresResponse: true,
      });

      // Knowledge agent receives and processes request
      const knowledgeMessages = communicationManager.receiveMessages(knowledgeAgent);
      expect(knowledgeMessages).toHaveLength(1);
      expect(knowledgeMessages[0].subject).toBe('API Authentication Issue');

      // Knowledge agent responds with troubleshooting steps
      await communicationManager.sendMessage({
        from: knowledgeAgent,
        to: supportAgent,
        type: 'response',
        priority: 'high',
        subject: 'Re: API Authentication Issue',
        content: JSON.stringify({
          steps: [
            'Check API key format',
            'Verify endpoint URL',
            'Test with curl command',
            'Check rate limiting',
          ],
          difficulty: 'intermediate',
        }),
        metadata: {
          replyTo: knowledgeRequestId,
          confidence: 0.9,
        },
      });

      // Support agent receives knowledge response
      const supportMessages = communicationManager.receiveMessages(supportAgent);
      expect(supportMessages).toHaveLength(1);

      const knowledgeResponse = JSON.parse(supportMessages[0].content);
      expect(knowledgeResponse.steps).toHaveLength(4);

      // Store knowledge in memory for future reference
      memoryManager.addMemory(
        'knowledge',
        'API authentication troubleshooting steps',
        { source: 'knowledge_base', confidence: 0.9 },
        0.8,
        ['api', 'authentication', 'troubleshooting'],
      );

      // Check escalation behavior based on difficulty
      expect(['basic', 'intermediate', 'advanced']).toContain(knowledgeResponse.difficulty);

      // Get initial task count for comparison
      const initialTaskCount = communicationManager.getActiveTaskCount();
      expect(typeof initialTaskCount).toBe('number');

      // Handle escalation based on difficulty
      const isAdvanced = knowledgeResponse.difficulty === 'advanced';
      let escalationResult = null;

      // Prepare escalation task parameters regardless of difficulty
      const escalationTaskConfig = {
        type: 'escalation',
        protocol: 'leader_follower',
        participants: [supportAgent, escalationAgent],
        coordinator: escalationAgent,
        objective: 'Resolve complex API authentication issue',
        constraints: { deadline: Date.now() + 3600000 }, // 1 hour
        metadata: { priority: 'high', sessionId: 'support-session-1' },
      };

      // Execute escalation task only for advanced scenarios - restructure to avoid conditional
      const escalationTaskId = isAdvanced
        ? await communicationManager.createCoordinationTask(escalationTaskConfig)
        : null;
      escalationResult = escalationTaskId
        ? await communicationManager.executeCoordinationTask(escalationTaskId)
        : null;

      // Verify escalation behavior
      const currentTaskCount = communicationManager.getActiveTaskCount();

      // Verify escalation creation aligns with difficulty level
      const hasEscalationResult = escalationResult !== null;
      expect(hasEscalationResult).toBe(isAdvanced);

      // Verify task count behavior
      const taskCountChanged = currentTaskCount !== initialTaskCount;
      expect(taskCountChanged).toBe(isAdvanced);

      // For advanced cases with escalation results, verify status
      const escalationStatus = escalationResult?.status;
      const validStatuses = ['active', 'completed'];

      // Verify escalation status for advanced cases - avoid conditional expect
      const statusIsValid = hasEscalationResult ? validStatuses.includes(escalationStatus) : true; // No status to check if no escalation

      // Always verify status validity - will be true for non-escalated cases
      expect(statusIsValid).toBeTruthy();

      // Record observability events
      observabilityManager.recordEvent({
        agentId: supportAgent,
        sessionId: 'support-session-1',
        type: 'knowledge_retrieved',
        level: 'info',
        message: 'Knowledge base consultation completed',
        data: {
          knowledge_agent: knowledgeAgent,
          confidence: 0.9,
          steps_provided: 4,
        },
        tags: ['knowledge', 'collaboration'],
      });

      // Generate customer response using relevant context
      const relevantContext = memoryManager.getRelevantContext(
        'API authentication troubleshooting',
        5,
      );
      expect(relevantContext.length).toBeGreaterThan(0);

      const responseMessage: ModelMessage = {
        role: 'assistant',
        content: `I can help you with the API authentication issue. Here are the troubleshooting steps: ${knowledgeResponse.steps.join(', ')}. Let me know if you need further assistance.`,
      };

      memoryManager.addMessage(responseMessage);

      // Complete trace
      observabilityManager.stopTrace(traceId, {
        steps: [{ stepNumber: 1, result: 'Customer inquiry processed' }],
        finalResult: { text: responseMessage.content, finishReason: 'stop' },
        totalTokensUsed: 150,
        executionTime: 5000,
        stoppedBy: 'completed',
      });

      // Verify integration worked correctly
      const conversationHistory = memoryManager.getConversationHistory();
      expect(conversationHistory).toHaveLength(2);
      expect(conversationHistory[0]).toStrictEqual(customerMessage);
      expect(conversationHistory[1]).toStrictEqual(responseMessage);

      const memories = memoryManager.searchMemories(undefined, 'authentication', 10);
      expect(memories.length).toBeGreaterThan(0);

      const communicationMetrics = communicationManager.getCommunicationMetrics();
      expect(communicationMetrics.totalMessages).toBeGreaterThan(1);
      expect(communicationMetrics.totalAgents).toBe(3);

      const traceEvents = observabilityManager.getTraceEvents(supportAgent);
      expect(traceEvents.length).toBeGreaterThan(0);
    });
  });

  describe('research and Development Workflow', () => {
    test('should coordinate research agents using configuration templates', async () => {
      // Create research assistant using configuration template
      const researchTemplate = agentConfigurationTemplates.researchAssistant;
      const researchAgentId = 'research-agent-1';

      // Set up memory with research context
      const researchMemory = new AgentMemoryManager(researchAgentId, researchTemplate.memoryConfig);
      researchMemory.setVariable('research_topic', 'AI Safety and Alignment');
      researchMemory.setVariable('research_depth', 'comprehensive');
      researchMemory.pushContext({
        phase: 'literature_review',
        focus: 'recent_papers',
        timeline: '2023-2024',
      });

      // Create specialized tools for research
      const webSearchTool = tool({
        description: 'Search the web for academic papers and articles',
        inputSchema: z.object({
          query: z.string(),
          timeframe: z.string().optional(),
          sources: z.array(z.string()).optional(),
        }),
        execute: async ({ query, timeframe, sources }) => {
          return {
            results: [
              {
                title: `AI Safety Research: ${query}`,
                url: 'https://arxiv.org/paper/123',
                abstract: 'Comprehensive study on AI safety methodologies...',
                authors: ['Dr. Smith', 'Dr. Johnson'],
                publishedDate: '2024-01-15',
                relevanceScore: 0.95,
              },
            ],
            totalFound: 150,
            searchTime: 1200,
          };
        },
      });

      const paperAnalysisTool = tool({
        description: 'Analyze research papers for key insights',
        inputSchema: z.object({
          paperUrl: z.string(),
          analysisType: z.enum(['summary', 'methodology', 'conclusions']),
        }),
        execute: async ({ paperUrl, analysisType }) => {
          return {
            analysis: `${analysisType} analysis of paper at ${paperUrl}`,
            keyPoints: [
              'Novel approach to AI alignment',
              'Empirical validation on large models',
              'Promising results for safety measures',
            ],
            confidence: 0.88,
            processingTime: 3000,
          };
        },
      });

      // Register tools with metadata
      toolManager.registerTool(webSearchTool, {
        id: 'web_search_academic',
        name: 'Academic Web Search',
        description: 'Search for academic papers and research',
        category: 'research',
        version: '1.0.0',
        author: 'system',
        tags: ['search', 'academic', 'papers'],
        complexity: 'moderate',
        reliability: 0.9,
        performance: 0.85,
        cost: 2,
        dependencies: [],
        conflicts: [],
        requirements: { internet_access: true },
        isActive: true,
        usage: {
          callCount: 0,
          successfulCalls: 0,
          failedCalls: 0,
          successRate: 0,
          averageExecutionTime: 0,
          lastUsed: 0,
        },
        isLoaded: true,
        loadedAt: Date.now(),
      });

      toolManager.registerTool(paperAnalysisTool, {
        id: 'paper_analysis',
        name: 'Paper Analysis Tool',
        description: 'Analyze research papers for insights',
        category: 'analysis',
        version: '1.0.0',
        author: 'system',
        tags: ['analysis', 'papers', 'research'],
        complexity: 'complex',
        reliability: 0.85,
        performance: 0.8,
        cost: 4,
        dependencies: [],
        conflicts: [],
        requirements: { computation_power: 'high' },
        isActive: true,
        usage: {
          callCount: 0,
          successfulCalls: 0,
          failedCalls: 0,
          successRate: 0,
          averageExecutionTime: 0,
          lastUsed: 0,
        },
        isLoaded: true,
        loadedAt: Date.now(),
      });

      // Start observability tracing for research workflow
      const traceId = observabilityManager.startTrace(researchAgentId, 'research-session-1');

      // Execute research workflow
      const executionContext = {
        agentId: researchAgentId,
        sessionId: 'research-session-1',
        stepNumber: 1,
        previousResults: [],
        availableTools: ['web_search_academic', 'paper_analysis'],
        executionLimits: { maxCalls: 10, timeout: 30000 },
      };

      // Step 1: Search for relevant papers
      observabilityManager.recordEvent({
        agentId: researchAgentId,
        sessionId: 'research-session-1',
        type: 'step_start',
        level: 'info',
        message: 'Starting literature search',
        data: { step: 'literature_search', topic: 'AI Safety and Alignment' },
        tags: ['research', 'search'],
      });

      const searchResult = await toolManager.executeTool(
        'web_search_academic',
        {
          query: 'AI Safety and Alignment 2024',
          timeframe: '2023-2024',
          sources: ['arxiv', 'google_scholar'],
        },
        executionContext,
      );

      expect(searchResult.success).toBeTruthy();
      expect(searchResult.result.results).toHaveLength(1);

      // Store search results in memory
      researchMemory.addMemory(
        'tool_result',
        'Literature search completed',
        {
          tool: 'web_search_academic',
          results_count: searchResult.result.totalFound,
          execution_time: searchResult.executionTime,
        },
        0.8,
        ['literature', 'search', 'ai_safety'],
      );

      // Step 2: Analyze key papers
      const analysisResult = await toolManager.executeTool(
        'paper_analysis',
        {
          paperUrl: searchResult.result.results[0].url,
          analysisType: 'summary',
        },
        { ...executionContext, stepNumber: 2 },
      );

      expect(analysisResult.success).toBeTruthy();
      expect(analysisResult.result.keyPoints).toHaveLength(3);

      // Store analysis in memory
      researchMemory.addMemory(
        'knowledge',
        'Paper analysis insights',
        {
          paper_url: searchResult.result.results[0].url,
          analysis_type: 'summary',
          confidence: analysisResult.result.confidence,
        },
        0.9,
        ['analysis', 'insights', 'ai_safety'],
      );

      // Record performance metrics
      observabilityManager.recordPerformanceSnapshot({
        agentId: researchAgentId,
        sessionId: 'research-session-1',
        timestamp: Date.now(),
        metrics: {
          executionTime: searchResult.executionTime + analysisResult.executionTime,
          tokenUsage: {
            inputTokens: 200,
            outputTokens: 300,
            totalTokens: 500,
          },
          stepCount: 2,
          toolCallCount: 2,
          successRate: 1.0,
          errorRate: 0.0,
          averageStepTime: (searchResult.executionTime + analysisResult.executionTime) / 2,
          memoryUsage: 75,
          cacheHitRate: 0.0,
        },
        resourceUsage: {
          cpuTime: 5000,
          memoryMB: 256,
          networkRequests: 3,
          diskOperations: 2,
        },
      });

      // Create comprehensive research summary
      const relevantResearchContext = researchMemory.getRelevantContext(
        'AI Safety research findings and methodologies',
        10,
      );

      expect(relevantResearchContext.length).toBeGreaterThan(0);

      // Generate research report
      const researchSummary = {
        topic: researchMemory.getVariable('research_topic'),
        findings: analysisResult.result.keyPoints,
        sources: [searchResult.result.results[0]],
        insights: relevantResearchContext.map(ctx => ctx.content),
        recommendations: [
          'Focus on empirical validation approaches',
          'Investigate novel alignment methodologies',
          'Consider safety measures for large models',
        ],
      };

      researchMemory.addMemory('decision', 'Research summary completed', researchSummary, 1.0, [
        'summary',
        'research',
        'completed',
      ]);

      // Complete trace with comprehensive results
      observabilityManager.stopTrace(traceId, {
        steps: [
          { stepNumber: 1, result: 'Literature search completed' },
          { stepNumber: 2, result: 'Paper analysis completed' },
        ],
        finalResult: {
          text: `Research completed on ${researchSummary.topic}`,
          finishReason: 'stop',
        },
        totalTokensUsed: 500,
        executionTime: searchResult.executionTime + analysisResult.executionTime,
        stoppedBy: 'completed',
      });

      // Verify workflow integration
      const researchMetrics = researchMemory.getMemoryMetrics();
      expect(researchMetrics.totalMemories).toBeGreaterThan(2);
      expect(researchMetrics.knowledge).toBeGreaterThan(0);
      expect(researchMetrics.tool_result).toBeGreaterThan(0);

      const toolMetrics = toolManager.generateUsageReport();
      expect(toolMetrics.totalExecutions).toBe(2);
      expect(toolMetrics.overallSuccessRate).toBe(1.0);

      const observabilityEvents = observabilityManager.getTraceEvents(researchAgentId);
      expect(observabilityEvents.length).toBeGreaterThan(0);

      const performanceMetrics = observabilityManager.getPerformanceMetrics(researchAgentId);
      expect(performanceMetrics.snapshots.length).toBeGreaterThan(0);
    });
  });

  describe('code Development and Review Workflow', () => {
    test('should coordinate code development agents with full observability', async () => {
      // Create code development agent using configuration template
      const codeTemplate = agentConfigurationTemplates.codeDevelopment;
      const leadDevAgentId = 'lead-dev-agent';
      const reviewerAgentId = 'code-reviewer-agent';
      const qaAgentId = 'qa-testing-agent';

      // Register agents with specialized capabilities
      communicationManager.registerAgent(leadDevAgentId, [
        {
          name: 'code_generation',
          description: 'Generate high-quality code',
          cost: 4,
          quality: 0.9,
          availability: 0.8,
          requirements: ['development_environment'],
          outputs: ['code', 'documentation'],
        },
      ]);

      communicationManager.registerAgent(reviewerAgentId, [
        {
          name: 'code_review',
          description: 'Review code for quality and security',
          cost: 3,
          quality: 0.95,
          availability: 0.9,
          requirements: ['code_analysis_tools'],
          outputs: ['review_feedback', 'security_report'],
        },
      ]);

      communicationManager.registerAgent(qaAgentId, [
        {
          name: 'automated_testing',
          description: 'Generate and run automated tests',
          cost: 2,
          quality: 0.85,
          availability: 0.95,
          requirements: ['testing_framework'],
          outputs: ['test_results', 'coverage_report'],
        },
      ]);

      // Set up memory for development context
      const devMemory = new AgentMemoryManager(leadDevAgentId, codeTemplate.memoryConfig);
      devMemory.setVariable('project_type', 'typescript_library');
      devMemory.setVariable('coding_standards', 'airbnb_eslint');
      devMemory.setVariable('test_coverage_target', 0.9);

      devMemory.pushContext({
        task: 'implement_feature',
        feature: 'user_authentication',
        framework: 'next.js',
        deadline: Date.now() + 86400000, // 24 hours
      });

      // Create coordination task for feature development
      const developmentTaskId = await communicationManager.createCoordinationTask({
        type: 'collaboration',
        protocol: 'leader_follower',
        participants: [leadDevAgentId, reviewerAgentId, qaAgentId],
        coordinator: leadDevAgentId,
        objective: 'Implement and validate user authentication feature',
        constraints: {
          deadline: Date.now() + 86400000,
          quality_gate: 0.9,
          test_coverage: 0.9,
        },
        metadata: {
          priority: 'high',
          feature: 'user_authentication',
          framework: 'next.js',
        },
      });

      // Start observability for all agents
      const leadDevTrace = observabilityManager.startTrace(leadDevAgentId, 'dev-session-1');
      const reviewerTrace = observabilityManager.startTrace(reviewerAgentId, 'review-session-1');
      const qaTrace = observabilityManager.startTrace(qaAgentId, 'qa-session-1');

      // Execute coordination task
      const task = await communicationManager.executeCoordinationTask(developmentTaskId);
      expect(task.status).toBeOneOf(['active', 'completed']);

      // Lead developer starts implementation
      observabilityManager.recordEvent({
        agentId: leadDevAgentId,
        sessionId: 'dev-session-1',
        type: 'step_start',
        level: 'info',
        message: 'Starting feature implementation',
        data: {
          feature: 'user_authentication',
          framework: 'next.js',
          estimated_complexity: 'high',
        },
        tags: ['development', 'implementation'],
      });

      // Simulate code generation
      const generatedCode = {
        files: [
          {
            path: 'src/lib/auth.ts',
            content: 'export class AuthService { /* implementation */ }',
            complexity: 'moderate',
          },
          {
            path: 'src/components/LoginForm.tsx',
            content: 'export function LoginForm() { /* React component */ }',
            complexity: 'simple',
          },
        ],
        tests: [
          {
            path: 'src/lib/auth.test.ts',
            content: 'describe("AuthService", () => { /* tests */ })',
            coverage: 0.95,
          },
        ],
        documentation: 'Authentication system implementation guide',
      };

      devMemory.addMemory(
        'tool_result',
        'Code generation completed',
        {
          files_generated: generatedCode.files.length,
          tests_generated: generatedCode.tests.length,
          estimated_complexity: 'moderate',
        },
        0.9,
        ['code_generation', 'authentication', 'typescript'],
      );

      // Send code for review
      const reviewRequestId = await communicationManager.sendMessage({
        from: leadDevAgentId,
        to: reviewerAgentId,
        type: 'request',
        priority: 'high',
        subject: 'Code Review: User Authentication Feature',
        content: JSON.stringify({
          files: generatedCode.files,
          requirements: ['security_check', 'code_quality', 'performance'],
          deadline: Date.now() + 7200000, // 2 hours
        }),
        metadata: {
          taskId: developmentTaskId,
          feature: 'user_authentication',
          reviewType: 'security_and_quality',
        },
        requiresResponse: true,
      });

      // Reviewer processes the request
      const reviewMessages = communicationManager.receiveMessages(reviewerAgentId);
      expect(reviewMessages).toHaveLength(1);

      observabilityManager.recordEvent({
        agentId: reviewerAgentId,
        sessionId: 'review-session-1',
        type: 'step_start',
        level: 'info',
        message: 'Starting code review process',
        data: {
          files_to_review: generatedCode.files.length,
          review_type: 'security_and_quality',
          estimated_time: 3600000, // 1 hour
        },
        tags: ['code_review', 'security', 'quality'],
      });

      // Simulate code review results
      const reviewResults = {
        overall_score: 0.87,
        security_issues: [
          {
            severity: 'medium',
            file: 'src/lib/auth.ts',
            issue: 'Missing input validation',
            recommendation: 'Add schema validation for user inputs',
          },
        ],
        quality_issues: [
          {
            severity: 'low',
            file: 'src/components/LoginForm.tsx',
            issue: 'Missing error handling',
            recommendation: 'Add comprehensive error handling',
          },
        ],
        performance_notes: ['Consider implementing connection pooling'],
        approved: false, // Needs fixes
      };

      // Send review feedback
      await communicationManager.sendMessage({
        from: reviewerAgentId,
        to: leadDevAgentId,
        type: 'response',
        priority: 'high',
        subject: 'Re: Code Review: User Authentication Feature',
        content: JSON.stringify(reviewResults),
        metadata: {
          replyTo: reviewRequestId,
          requiresRevision: true,
          approvalStatus: 'changes_requested',
        },
      });

      // Lead developer receives feedback and implements fixes
      const feedbackMessages = communicationManager.receiveMessages(leadDevAgentId);
      expect(feedbackMessages).toHaveLength(1);

      const feedback = JSON.parse(feedbackMessages[0].content);
      expect(feedback.approved).toBeFalsy();
      expect(feedback.security_issues.length).toBeGreaterThan(0);

      // Store review feedback in memory
      devMemory.addMemory(
        'observation',
        'Code review feedback received',
        {
          overall_score: feedback.overall_score,
          issues_found: feedback.security_issues.length + feedback.quality_issues.length,
          needs_revision: true,
        },
        0.8,
        ['code_review', 'feedback', 'revision_needed'],
      );

      // Implement fixes based on feedback
      observabilityManager.recordEvent({
        agentId: leadDevAgentId,
        sessionId: 'dev-session-1',
        type: 'step_start',
        level: 'info',
        message: 'Implementing review feedback',
        data: {
          issues_to_fix: feedback.security_issues.length + feedback.quality_issues.length,
          revision_round: 1,
        },
        tags: ['revision', 'fixes', 'implementation'],
      });

      // After fixes, request QA testing
      const qaRequestId = await communicationManager.sendMessage({
        from: leadDevAgentId,
        to: qaAgentId,
        type: 'request',
        priority: 'normal',
        subject: 'QA Testing: User Authentication Feature',
        content: JSON.stringify({
          code: generatedCode,
          tests: generatedCode.tests,
          coverage_target: 0.9,
          test_types: ['unit', 'integration', 'security'],
        }),
        metadata: {
          taskId: developmentTaskId,
          revision: 1,
        },
        requiresResponse: true,
      });

      // QA agent processes testing request
      const qaMessages = communicationManager.receiveMessages(qaAgentId);
      expect(qaMessages).toHaveLength(1);

      observabilityManager.recordEvent({
        agentId: qaAgentId,
        sessionId: 'qa-session-1',
        type: 'step_start',
        level: 'info',
        message: 'Starting automated testing',
        data: {
          test_types: ['unit', 'integration', 'security'],
          coverage_target: 0.9,
        },
        tags: ['testing', 'qa', 'automation'],
      });

      // Simulate test results
      const testResults = {
        unit_tests: { passed: 45, failed: 2, coverage: 0.92 },
        integration_tests: { passed: 12, failed: 0, coverage: 0.88 },
        security_tests: { passed: 8, failed: 1, coverage: 0.85 },
        overall_coverage: 0.91,
        performance_metrics: {
          average_response_time: 120,
          max_response_time: 300,
          memory_usage: 'acceptable',
        },
        recommendation: 'Fix failing tests before production deployment',
      };

      // Record comprehensive performance data
      observabilityManager.recordPerformanceSnapshot({
        agentId: leadDevAgentId,
        sessionId: 'dev-session-1',
        timestamp: Date.now(),
        metrics: {
          executionTime: 15000, // 15 seconds for development
          tokenUsage: {
            inputTokens: 800,
            outputTokens: 1200,
            totalTokens: 2000,
          },
          stepCount: 5,
          toolCallCount: 3,
          successRate: 0.85, // Some issues found
          errorRate: 0.15,
          averageStepTime: 3000,
          memoryUsage: 85,
          cacheHitRate: 0.3,
        },
        resourceUsage: {
          cpuTime: 12000,
          memoryMB: 512,
          networkRequests: 8,
          diskOperations: 15,
        },
      });

      // Complete all traces
      observabilityManager.stopTrace(leadDevTrace, {
        steps: [
          { stepNumber: 1, result: 'Feature implementation started' },
          { stepNumber: 2, result: 'Code generated' },
          { stepNumber: 3, result: 'Review feedback received' },
          { stepNumber: 4, result: 'Fixes implemented' },
          { stepNumber: 5, result: 'QA testing initiated' },
        ],
        finalResult: {
          text: 'User authentication feature development completed with testing',
          finishReason: 'stop',
        },
        totalTokensUsed: 2000,
        executionTime: 15000,
        stoppedBy: 'completed',
      });

      observabilityManager.stopTrace(reviewerTrace, {
        steps: [{ stepNumber: 1, result: 'Code review completed' }],
        finalResult: {
          text: 'Code review provided with improvement suggestions',
          finishReason: 'stop',
        },
        totalTokensUsed: 500,
        executionTime: 8000,
        stoppedBy: 'completed',
      });

      observabilityManager.stopTrace(qaTrace, {
        steps: [{ stepNumber: 1, result: 'Automated testing completed' }],
        finalResult: { text: 'Test suite executed with coverage analysis', finishReason: 'stop' },
        totalTokensUsed: 300,
        executionTime: 5000,
        stoppedBy: 'completed',
      });

      // Verify comprehensive integration
      const devMemoryMetrics = devMemory.getMemoryMetrics();
      expect(devMemoryMetrics.totalMemories).toBeGreaterThan(2);
      expect(devMemoryMetrics.tool_result).toBeGreaterThan(0);
      expect(devMemoryMetrics.observation).toBeGreaterThan(0);

      const communicationMetrics = communicationManager.getCommunicationMetrics();
      expect(communicationMetrics.totalMessages).toBeGreaterThan(3);
      expect(communicationMetrics.totalAgents).toBe(3);
      expect(communicationMetrics.activeTasks).toBeGreaterThan(0);

      const observabilityMetrics = observabilityManager.getPerformanceMetrics(leadDevAgentId);
      expect(observabilityMetrics.snapshots.length).toBeGreaterThan(0);
      expect(observabilityMetrics.aggregated.averageExecutionTime).toBeGreaterThan(0);

      // Verify coordination task completion
      const completedTask = communicationManager.getCoordinationTask(developmentTaskId);
      expect(completedTask).toBeDefined();
      expect(completedTask!.participants).toStrictEqual([
        leadDevAgentId,
        reviewerAgentId,
        qaAgentId,
      ]);
    });
  });

  describe('data Analysis and Reporting Workflow', () => {
    test('should execute end-to-end data analysis with comprehensive tracking', async () => {
      // Create data analysis agent using configuration template
      const dataTemplate = agentConfigurationTemplates.dataAnalysis;
      const analystAgentId = 'data-analyst-agent';
      const visualizerAgentId = 'data-visualizer-agent';

      // Set up memory for data analysis context
      const analysisMemory = new AgentMemoryManager(analystAgentId, dataTemplate.memoryConfig);
      analysisMemory.setVariable('dataset_type', 'user_behavior_analytics');
      analysisMemory.setVariable('analysis_objective', 'identify_usage_patterns');
      analysisMemory.setVariable('reporting_format', 'executive_dashboard');

      analysisMemory.pushContext({
        project: 'user_engagement_optimization',
        timeframe: 'last_30_days',
        stakeholders: ['product_team', 'marketing_team', 'executives'],
        compliance: ['gdpr', 'ccpa'],
      });

      // Register agents for data workflow
      communicationManager.registerAgent(analystAgentId, [
        {
          name: 'statistical_analysis',
          description: 'Perform statistical analysis on datasets',
          cost: 3,
          quality: 0.92,
          availability: 0.85,
          requirements: ['data_access', 'statistical_tools'],
          outputs: ['insights', 'metrics', 'correlations'],
        },
      ]);

      communicationManager.registerAgent(visualizerAgentId, [
        {
          name: 'data_visualization',
          description: 'Create charts and visual reports',
          cost: 2,
          quality: 0.88,
          availability: 0.9,
          requirements: ['visualization_tools'],
          outputs: ['charts', 'dashboards', 'reports'],
        },
      ]);

      // Create data processing tools
      const dataProcessorTool = tool({
        description: 'Process and analyze large datasets',
        inputSchema: z.object({
          dataset: z.string(),
          analysisType: z.enum(['descriptive', 'predictive', 'prescriptive']),
          metrics: z.array(z.string()).optional(),
        }),
        execute: async ({ dataset, analysisType, metrics = [] }) => {
          return {
            summary: {
              recordCount: 50000,
              timeRange: '2024-01-01 to 2024-01-31',
              completeness: 0.95,
            },
            insights: [
              'Peak usage occurs between 2-4 PM daily',
              'Mobile users show 40% higher engagement',
              'Feature adoption rate varies by user segment',
            ],
            metrics: {
              engagement_rate: 0.68,
              retention_rate: 0.82,
              conversion_rate: 0.15,
              churn_rate: 0.08,
            },
            correlations: [
              { feature: 'notification_frequency', correlation: 0.65, significance: 0.01 },
              { feature: 'session_duration', correlation: 0.72, significance: 0.001 },
            ],
            processingTime: 4500,
          };
        },
      });

      const chartGeneratorTool = tool({
        description: 'Generate charts and visualizations',
        inputSchema: z.object({
          data: z.object({}).passthrough(),
          chartType: z.enum(['line', 'bar', 'pie', 'scatter', 'heatmap']),
          title: z.string(),
        }),
        execute: async ({ data, chartType, title }) => {
          return {
            chartId: `chart_${chartType}_${Date.now()}`,
            imageUrl: `https://charts.example.com/generated/${chartType}.png`,
            dataPoints: Object.keys(data).length,
            title,
            accessibility: {
              altText: `${chartType} chart showing ${title}`,
              colorBlindFriendly: true,
            },
            generationTime: 2000,
          };
        },
      });

      // Register tools
      toolManager.registerTool(dataProcessorTool, {
        id: 'data_processor',
        name: 'Data Processor',
        description: 'Advanced data processing and analysis',
        category: 'analytics',
        version: '2.0.0',
        author: 'data_team',
        tags: ['analytics', 'processing', 'statistics'],
        complexity: 'complex',
        reliability: 0.92,
        performance: 0.88,
        cost: 4,
        dependencies: [],
        conflicts: [],
        requirements: { memory: 'high', cpu: 'high' },
        isActive: true,
        usage: {
          callCount: 0,
          successfulCalls: 0,
          failedCalls: 0,
          successRate: 0,
          averageExecutionTime: 0,
          lastUsed: 0,
        },
        isLoaded: true,
        loadedAt: Date.now(),
      });

      toolManager.registerTool(chartGeneratorTool, {
        id: 'chart_generator',
        name: 'Chart Generator',
        description: 'Generate professional data visualizations',
        category: 'visualization',
        version: '1.5.0',
        author: 'viz_team',
        tags: ['charts', 'visualization', 'reporting'],
        complexity: 'moderate',
        reliability: 0.9,
        performance: 0.85,
        cost: 2,
        dependencies: [],
        conflicts: [],
        requirements: { graphics: 'medium' },
        isActive: true,
        usage: {
          callCount: 0,
          successfulCalls: 0,
          failedCalls: 0,
          successRate: 0,
          averageExecutionTime: 0,
          lastUsed: 0,
        },
        isLoaded: true,
        loadedAt: Date.now(),
      });

      // Start comprehensive observability
      const analysisTrace = observabilityManager.startTrace(analystAgentId, 'analysis-session-1');
      const vizTrace = observabilityManager.startTrace(visualizerAgentId, 'viz-session-1');

      // Execute data analysis workflow
      const executionContext = {
        agentId: analystAgentId,
        sessionId: 'analysis-session-1',
        stepNumber: 1,
        previousResults: [],
        availableTools: ['data_processor', 'chart_generator'],
        executionLimits: { maxCalls: 15, timeout: 60000 },
      };

      // Step 1: Process dataset
      observabilityManager.recordEvent({
        agentId: analystAgentId,
        sessionId: 'analysis-session-1',
        type: 'step_start',
        level: 'info',
        message: 'Starting data analysis workflow',
        data: {
          dataset_type: 'user_behavior_analytics',
          analysis_objective: 'identify_usage_patterns',
          expected_duration: 30000,
        },
        tags: ['data_analysis', 'workflow_start'],
      });

      const processingResult = await toolManager.executeTool(
        'data_processor',
        {
          dataset: 'user_behavior_jan_2024',
          analysisType: 'descriptive',
          metrics: ['engagement_rate', 'retention_rate', 'conversion_rate'],
        },
        executionContext,
      );

      expect(processingResult.success).toBeTruthy();
      expect(processingResult.result.insights).toHaveLength(3);
      expect(processingResult.result.metrics).toBeDefined();

      // Store analysis results in memory
      analysisMemory.addMemory(
        'tool_result',
        'Data processing completed',
        {
          record_count: processingResult.result.summary.recordCount,
          completeness: processingResult.result.summary.completeness,
          insights_generated: processingResult.result.insights.length,
          processing_time: processingResult.executionTime,
        },
        0.95,
        ['data_processing', 'analytics', 'completed'],
      );

      // Store key insights as knowledge
      processingResult.result.insights.forEach((insight, index) => {
        analysisMemory.addMemory(
          'knowledge',
          insight,
          {
            source: 'data_analysis',
            confidence: 0.9,
            insight_order: index + 1,
          },
          0.85,
          ['insight', 'user_behavior'],
        );
      });

      // Step 2: Create coordination task for visualization
      const vizTaskId = await communicationManager.createCoordinationTask({
        type: 'collaboration',
        protocol: 'peer_to_peer',
        participants: [analystAgentId, visualizerAgentId],
        objective: 'Create executive dashboard with key insights',
        constraints: {
          chart_types: ['line', 'bar', 'pie'],
          max_charts: 5,
          accessibility_required: true,
        },
        metadata: {
          data_source: 'user_behavior_jan_2024',
          report_type: 'executive_dashboard',
        },
      });

      // Send visualization request
      const vizRequestId = await communicationManager.sendMessage({
        from: analystAgentId,
        to: visualizerAgentId,
        type: 'request',
        priority: 'normal',
        subject: 'Create Executive Dashboard Visualizations',
        content: JSON.stringify({
          analysisResults: processingResult.result,
          chartRequirements: [
            { type: 'line', data: 'engagement_trends', title: 'User Engagement Over Time' },
            { type: 'bar', data: 'feature_adoption', title: 'Feature Adoption Rates' },
            { type: 'pie', data: 'user_segments', title: 'User Segment Distribution' },
          ],
          accessibility: true,
        }),
        metadata: {
          taskId: vizTaskId,
          deadline: Date.now() + 10800000, // 3 hours
        },
        requiresResponse: true,
      });

      // Visualizer processes the request
      const vizMessages = communicationManager.receiveMessages(visualizerAgentId);
      expect(vizMessages).toHaveLength(1);

      observabilityManager.recordEvent({
        agentId: visualizerAgentId,
        sessionId: 'viz-session-1',
        type: 'step_start',
        level: 'info',
        message: 'Starting visualization generation',
        data: {
          charts_requested: 3,
          accessibility_required: true,
          data_points: processingResult.result.summary.recordCount,
        },
        tags: ['visualization', 'charts', 'dashboard'],
      });

      // Generate visualizations
      const charts = [];
      for (const chartReq of JSON.parse(vizMessages[0].content).chartRequirements) {
        const chartResult = await toolManager.executeTool(
          'chart_generator',
          {
            data: processingResult.result.metrics,
            chartType: chartReq.type,
            title: chartReq.title,
          },
          {
            ...executionContext,
            agentId: visualizerAgentId,
            sessionId: 'viz-session-1',
          },
        );

        expect(chartResult.success).toBeTruthy();
        charts.push(chartResult.result);
      }

      expect(charts).toHaveLength(3);

      // Send dashboard back to analyst
      await communicationManager.sendMessage({
        from: visualizerAgentId,
        to: analystAgentId,
        type: 'response',
        priority: 'normal',
        subject: 'Re: Executive Dashboard Visualizations',
        content: JSON.stringify({
          dashboard: {
            title: 'User Behavior Analytics Dashboard',
            charts,
            summary: processingResult.result.insights,
            metrics: processingResult.result.metrics,
            accessibility_compliant: true,
          },
          completion_time: Date.now(),
        }),
        metadata: {
          replyTo: vizRequestId,
          taskId: vizTaskId,
          status: 'completed',
        },
      });

      // Analyst receives completed dashboard
      const dashboardMessages = communicationManager.receiveMessages(analystAgentId);
      expect(dashboardMessages).toHaveLength(1);

      const completedDashboard = JSON.parse(dashboardMessages[0].content);
      expect(completedDashboard.dashboard.charts).toHaveLength(3);

      // Store final results
      analysisMemory.addMemory(
        'decision',
        'Analysis and reporting workflow completed',
        {
          dashboard_created: true,
          charts_generated: completedDashboard.dashboard.charts.length,
          insights_count: completedDashboard.dashboard.summary.length,
          accessibility_compliant: completedDashboard.dashboard.accessibility_compliant,
        },
        1.0,
        ['workflow_complete', 'dashboard', 'reporting'],
      );

      // Record comprehensive performance metrics
      observabilityManager.recordPerformanceSnapshot({
        agentId: analystAgentId,
        sessionId: 'analysis-session-1',
        timestamp: Date.now(),
        metrics: {
          executionTime: processingResult.executionTime + charts.length * 2000, // Estimated total time
          tokenUsage: {
            inputTokens: 600,
            outputTokens: 900,
            totalTokens: 1500,
          },
          stepCount: 4, // Analysis + 3 chart generations
          toolCallCount: 4,
          successRate: 1.0,
          errorRate: 0.0,
          averageStepTime: (processingResult.executionTime + charts.length * 2000) / 4,
          memoryUsage: 90,
          cacheHitRate: 0.2,
        },
        resourceUsage: {
          cpuTime: 20000,
          memoryMB: 1024,
          networkRequests: 10,
          diskOperations: 8,
        },
      });

      // Complete all traces
      observabilityManager.stopTrace(analysisTrace, {
        steps: [
          { stepNumber: 1, result: 'Data processing completed' },
          { stepNumber: 2, result: 'Insights extracted' },
          { stepNumber: 3, result: 'Visualization requested' },
          { stepNumber: 4, result: 'Dashboard completed' },
        ],
        finalResult: {
          text: 'Executive dashboard created with user behavior insights',
          finishReason: 'stop',
        },
        totalTokensUsed: 1500,
        executionTime: processingResult.executionTime + charts.length * 2000,
        stoppedBy: 'completed',
      });

      observabilityManager.stopTrace(vizTrace, {
        steps: charts.map((chart, index) => ({
          stepNumber: index + 1,
          result: `Chart ${chart.chartId} generated`,
        })),
        finalResult: {
          text: 'Dashboard visualizations completed',
          finishReason: 'stop',
        },
        totalTokensUsed: 600,
        executionTime: charts.length * 2000,
        stoppedBy: 'completed',
      });

      // Verify comprehensive integration
      const memoryMetrics = analysisMemory.getMemoryMetrics();
      expect(memoryMetrics.totalMemories).toBeGreaterThan(5); // Tool results + insights + decision
      expect(memoryMetrics.knowledge).toBeGreaterThan(2); // Insights stored as knowledge
      expect(memoryMetrics.tool_result).toBeGreaterThan(0);
      expect(memoryMetrics.decision).toBeGreaterThan(0);

      const toolUsageReport = toolManager.generateUsageReport();
      expect(toolUsageReport.totalExecutions).toBe(4); // 1 data processing + 3 chart generations
      expect(toolUsageReport.overallSuccessRate).toBe(1.0);
      expect(toolUsageReport.topPerformingTools.length).toBeGreaterThan(0);

      const commMetrics = communicationManager.getCommunicationMetrics();
      expect(commMetrics.totalMessages).toBeGreaterThan(2);
      expect(commMetrics.totalAgents).toBe(2);
      expect(commMetrics.activeTasks).toBeGreaterThan(0);

      const perfMetrics = observabilityManager.getPerformanceMetrics(analystAgentId);
      expect(perfMetrics.snapshots.length).toBeGreaterThan(0);
      expect(perfMetrics.aggregated.successRate).toBe(1.0);

      // Verify coordination task was completed
      const task = communicationManager.getCoordinationTask(vizTaskId);
      expect(task).toBeDefined();
      expect(task!.objective).toBe('Create executive dashboard with key insights');
    });
  });

  describe('system Health and Monitoring', () => {
    test('should provide comprehensive system health monitoring across all features', () => {
      // Set up multiple agents with different health states
      const agentIds = ['healthy-agent', 'degraded-agent', 'stressed-agent'];

      agentIds.forEach(agentId => {
        communicationManager.registerAgent(agentId, []);
      });

      // Simulate different health conditions
      observabilityManager.updateHealthStatus('healthy-agent', {
        status: 'healthy',
        healthScore: 95,
        issues: [],
        recommendations: [],
      });

      observabilityManager.updateHealthStatus('degraded-agent', {
        status: 'degraded',
        healthScore: 65,
        issues: [
          {
            severity: 'medium',
            category: 'performance',
            message: 'Response times higher than normal',
            timestamp: Date.now(),
          },
        ],
        recommendations: ['Consider scaling resources'],
      });

      observabilityManager.updateHealthStatus('stressed-agent', {
        status: 'unhealthy',
        healthScore: 30,
        issues: [
          {
            severity: 'high',
            category: 'connectivity',
            message: 'Frequent connection timeouts',
            timestamp: Date.now(),
          },
          {
            severity: 'high',
            category: 'memory',
            message: 'Memory usage at 95%',
            timestamp: Date.now(),
          },
        ],
        recommendations: ['Immediate intervention required', 'Restart agent'],
      });

      // Generate comprehensive health report
      const healthReport = observabilityManager.generateHealthReport();

      expect(healthReport.overall.totalAgents).toBe(3);
      expect(healthReport.overall.healthyAgents).toBe(1);
      expect(healthReport.overall.degradedAgents).toBe(1);
      expect(healthReport.overall.unhealthyAgents).toBe(1);
      expect(healthReport.recommendations.length).toBeGreaterThan(0);

      // Verify individual agent health
      const healthyAgent = healthReport.agents.find(a => a.agentId === 'healthy-agent');
      expect(healthyAgent?.status).toBe('healthy');
      expect(healthyAgent?.healthScore).toBe(95);

      const degradedAgent = healthReport.agents.find(a => a.agentId === 'degraded-agent');
      expect(degradedAgent?.status).toBe('degraded');
      expect(degradedAgent?.issues).toHaveLength(1);

      const stressedAgent = healthReport.agents.find(a => a.agentId === 'stressed-agent');
      expect(stressedAgent?.status).toBe('unhealthy');
      expect(stressedAgent?.issues).toHaveLength(2);

      // Verify system-wide recommendations
      expect(healthReport.recommendations).toContain(
        '1 agents are unhealthy and require immediate attention',
      );

      // Test communication system health
      const commMetrics = communicationManager.getCommunicationMetrics();
      expect(commMetrics.totalAgents).toBe(3);
      expect(commMetrics.averageQueueSize).toBeGreaterThanOrEqual(0);

      // Test tool system health
      const toolUsageReport = toolManager.generateUsageReport();
      expect(toolUsageReport.totalTools).toBeGreaterThanOrEqual(0);
      expect(toolUsageReport.overallSuccessRate).toBeGreaterThanOrEqual(0);

      // Create comprehensive system snapshot
      const systemSnapshot = {
        timestamp: Date.now(),
        health: healthReport,
        communication: commMetrics,
        tools: toolUsageReport,
        memory: {
          // Would include memory statistics from active agents
          totalActiveAgents: agentIds.length,
        },
      };

      expect(systemSnapshot.health.overall.totalAgents).toBe(3);
      expect(systemSnapshot.communication.totalAgents).toBe(3);
      expect(systemSnapshot.tools).toBeDefined();
    });
  });
});
