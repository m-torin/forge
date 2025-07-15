/**
 * Real-World Customer Support Agent Example
 *
 * This example demonstrates a production-ready customer support agent that uses
 * all advanced agent features: memory, communication, tool management,
 * observability, and configuration templates.
 */

import type { CoreMessage } from 'ai';
import { tool } from 'ai';
import { z } from 'zod/v4';

// Import all advanced agent features
import {
  AdvancedToolManager,
  type ToolExecutionContext,
} from '../../src/server/agents/advanced-tool-management';
import {
  AgentCommunicationManager,
  communicationUtils,
  createCommunicationAwareAgent,
  type AgentCapability,
} from '../../src/server/agents/agent-communication';
import {
  agentConfigurationTemplates,
  configurationUtils,
} from '../../src/server/agents/agent-configuration-templates';
import {
  AgentMemoryManager,
  createMemoryAwareAgent,
  memoryUtils,
} from '../../src/server/agents/agent-memory';
import {
  AgentObservabilityManager,
  createObservableAgent,
  debugUtils,
  type AgentMonitoringConfig,
} from '../../src/server/agents/agent-observability';

/**
 * Customer Support Agent Implementation
 *
 * Features:
 * - Long-term memory of customer preferences and history
 * - Communication with other support agents and supervisors
 * - Dynamic tool loading for different support scenarios
 * - Comprehensive observability and performance tracking
 * - Template-based configuration for consistency
 */
export class CustomerSupportAgent {
  private agent: any;
  private memoryManager: AgentMemoryManager;
  private communicationManager: AgentCommunicationManager;
  private toolManager: AdvancedToolManager;
  private observabilityManager: AgentObservabilityManager;

  constructor(agentId: string, customConfig?: Partial<AgentMonitoringConfig>) {
    // Initialize all managers
    this.setupManagers(agentId, customConfig);

    // Create the comprehensive agent
    this.createAgent(agentId);

    // Initialize support tools
    this.initializeSupportTools();

    // Register agent capabilities
    this.registerAgentCapabilities(agentId);
  }

  private setupManagers(agentId: string, customConfig?: Partial<AgentMonitoringConfig>) {
    // Memory manager for customer history and preferences
    const supportTemplate = agentConfigurationTemplates.customerSupport;
    this.memoryManager = new AgentMemoryManager(agentId, {
      ...supportTemplate.memoryConfig,
      maxEntries: 1000, // Extended for customer history
      retentionDays: 90, // Keep customer data for 3 months
      persistenceEnabled: true, // Persist across sessions
    });

    // Communication manager for team coordination
    this.communicationManager = new AgentCommunicationManager();

    // Tool manager for dynamic support tool loading
    this.toolManager = new AdvancedToolManager({
      cacheEnabled: true,
      performanceTracking: true,
      autoOptimization: true,
      cacheTtl: 3600000, // 1 hour cache
      maxCacheSize: 50,
    });

    // Observability manager for monitoring and debugging
    const monitoringConfig: AgentMonitoringConfig = {
      ...supportTemplate.monitoringConfig,
      enableTracing: true,
      traceLevel: 'info',
      alertThresholds: {
        maxExecutionTime: 30000, // 30 seconds for support responses
        maxTokenUsage: 5000, // Reasonable token usage
        minSuccessRate: 0.9, // High success rate expected
        maxErrorRate: 0.1, // Low error tolerance
      },
      ...customConfig,
    };
    this.observabilityManager = new AgentObservabilityManager(monitoringConfig);
  }

  private createAgent(agentId: string) {
    // Start with base agent configuration
    const baseAgent = {
      id: agentId,
      name: 'Customer Support Agent',
      description: 'AI-powered customer support agent with advanced capabilities',
    };

    // Layer on all advanced features
    this.agent = createObservableAgent(
      createCommunicationAwareAgent(
        createMemoryAwareAgent(baseAgent, this.memoryManager.getConfig()),
        this.communicationManager,
        this.getSupportCapabilities(),
      ),
      this.observabilityManager,
    );
  }

  private getSupportCapabilities(): AgentCapability[] {
    return [
      communicationUtils.createCapability(
        'knowledge_base_search',
        'Search internal knowledge base for solutions',
        { cost: 1, quality: 0.95, availability: 0.99 },
      ),
      communicationUtils.createCapability(
        'ticket_management',
        'Create, update, and manage support tickets',
        { cost: 2, quality: 0.9, availability: 0.98 },
      ),
      communicationUtils.createCapability(
        'customer_data_lookup',
        'Retrieve customer account and purchase history',
        { cost: 1, quality: 0.98, availability: 0.95 },
      ),
      communicationUtils.createCapability(
        'escalation_routing',
        'Route complex issues to appropriate specialists',
        { cost: 1, quality: 0.85, availability: 1.0 },
      ),
      communicationUtils.createCapability(
        'sentiment_analysis',
        'Analyze customer sentiment and adjust response tone',
        { cost: 1, quality: 0.8, availability: 0.99 },
      ),
    ];
  }

  private initializeSupportTools() {
    // Knowledge Base Search Tool
    const kbSearchTool = tool({
      description: 'Search the knowledge base for support articles and solutions',
      inputSchema: z.object({
        query: z.string().describe('Search query for knowledge base'),
        category: z.enum(['billing', 'technical', 'account', 'product']).optional(),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      }),
      execute: async ({ query, category: _category, priority: _priority }) => {
        // Simulate knowledge base search
        const articles = [
          {
            id: 'kb-001',
            title: 'Password Reset Instructions',
            content:
              'To reset your password: 1) Go to login page, 2) Click "Forgot Password", 3) Check your email',
            category: 'account',
            relevance: 0.95,
            lastUpdated: '2024-01-15',
          },
          {
            id: 'kb-002',
            title: 'Billing Cycle Information',
            content: 'Your billing cycle runs from the 1st to the last day of each month',
            category: 'billing',
            relevance: 0.88,
            lastUpdated: '2024-01-10',
          },
        ];

        return {
          results: articles.filter(
            article =>
              article.content.toLowerCase().includes(query.toLowerCase()) ||
              article.title.toLowerCase().includes(query.toLowerCase()),
          ),
          totalResults: articles.length,
          searchTime: Math.random() * 200 + 50, // 50-250ms
        };
      },
    });

    this.toolManager.registerTool(kbSearchTool, {
      id: 'kb_search',
      name: 'Knowledge Base Search',
      description: 'Searches support knowledge base',
      category: 'support',
      version: '2.1.0',
      author: 'support-team',
      tags: ['knowledge', 'search', 'support'],
      complexity: 'simple',
      reliability: 0.99,
      performance: 0.95,
      cost: 1,
      dependencies: [],
      conflicts: [],
      requirements: { network: 'low' },
      isActive: true,
    });

    // Customer Data Lookup Tool
    const customerLookupTool = tool({
      description: 'Look up customer account information and history',
      inputSchema: z.object({
        customerId: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        includeHistory: z.boolean().default(true),
      }),
      execute: async ({ customerId, email, phone, includeHistory }) => {
        // Simulate customer data lookup
        const customerData = {
          customerId: customerId || 'cust_123456',
          email: email || 'customer@example.com',
          name: 'John Smith',
          phone: phone || '+1-555-0123',
          accountStatus: 'active',
          subscriptionTier: 'premium',
          joinDate: '2023-06-15',
          totalOrders: 12,
          lifetimeValue: 2450.0,
          lastContactDate: '2024-01-10',
          preferredLanguage: 'en',
          timezone: 'UTC-5',
        };

        const history = includeHistory
          ? [
              {
                date: '2024-01-10',
                type: 'support_ticket',
                subject: 'Billing question about subscription',
                status: 'resolved',
                satisfaction: 4.5,
              },
              {
                date: '2023-12-20',
                type: 'purchase',
                description: 'Premium subscription renewal',
                amount: 99.99,
              },
            ]
          : [];

        return {
          customer: customerData,
          history,
          found: true,
        };
      },
    });

    this.toolManager.registerTool(customerLookupTool, {
      id: 'customer_lookup',
      name: 'Customer Data Lookup',
      description: 'Retrieves customer account information',
      category: 'data',
      version: '1.3.0',
      author: 'crm-team',
      tags: ['customer', 'data', 'lookup'],
      complexity: 'simple',
      reliability: 0.98,
      performance: 0.9,
      cost: 2,
      dependencies: [],
      conflicts: [],
      requirements: { security: 'high' },
      isActive: true,
    });

    // Ticket Creation Tool
    const ticketTool = tool({
      description: 'Create and manage support tickets',
      inputSchema: z.object({
        action: z.enum(['create', 'update', 'close']),
        ticketId: z.string().optional(),
        subject: z.string().optional(),
        description: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
        category: z.enum(['billing', 'technical', 'account', 'product']).optional(),
        customerId: z.string().optional(),
        assignedTo: z.string().optional(),
      }),
      execute: async ({
        action,
        ticketId,
        subject,
        description: _description,
        priority,
        category,
        customerId: _customerId,
        assignedTo,
      }) => {
        if (action === 'create') {
          const newTicketId = `TKT-${Date.now()}`;
          return {
            ticketId: newTicketId,
            status: 'created',
            subject: subject || 'Customer Inquiry',
            priority,
            category: category || 'general',
            assignedTo: assignedTo || 'auto-assigned',
            createdAt: new Date().toISOString(),
            estimatedResolution: '24 hours',
          };
        }

        return {
          ticketId: ticketId || 'TKT-existing',
          status: action === 'close' ? 'closed' : 'updated',
          updatedAt: new Date().toISOString(),
        };
      },
    });

    this.toolManager.registerTool(ticketTool, {
      id: 'ticket_management',
      name: 'Ticket Management',
      description: 'Creates and manages support tickets',
      category: 'support',
      version: '3.0.0',
      author: 'support-team',
      tags: ['tickets', 'management', 'tracking'],
      complexity: 'moderate',
      reliability: 0.95,
      performance: 0.85,
      cost: 3,
      dependencies: [],
      conflicts: [],
      requirements: { database: 'required' },
      isActive: true,
    });

    // Sentiment Analysis Tool
    const sentimentTool = tool({
      description: 'Analyze customer message sentiment and suggest response tone',
      inputSchema: z.object({
        message: z.string().describe('Customer message to analyze'),
        context: z.string().optional().describe('Additional context about the interaction'),
      }),
      execute: async ({ message, context: _context }) => {
        // Simple sentiment analysis simulation
        const negativeWords = ['angry', 'frustrated', 'terrible', 'awful', 'hate', 'worst'];
        const positiveWords = ['great', 'excellent', 'love', 'amazing', 'wonderful', 'perfect'];

        const lowerMessage = message.toLowerCase();
        const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;
        const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;

        let sentiment: 'positive' | 'neutral' | 'negative';
        let confidence: number;
        let suggestedTone: string;

        if (positiveCount > negativeCount) {
          sentiment = 'positive';
          confidence = Math.min(0.7 + positiveCount * 0.1, 0.95);
          suggestedTone = 'friendly and appreciative';
        } else if (negativeCount > positiveCount) {
          sentiment = 'negative';
          confidence = Math.min(0.7 + negativeCount * 0.1, 0.95);
          suggestedTone = 'empathetic and solution-focused';
        } else {
          sentiment = 'neutral';
          confidence = 0.6;
          suggestedTone = 'professional and helpful';
        }

        return {
          sentiment,
          confidence,
          suggestedTone,
          keywords: [
            ...negativeWords.filter(w => lowerMessage.includes(w)),
            ...positiveWords.filter(w => lowerMessage.includes(w)),
          ],
          urgencyLevel: negativeCount > 2 ? 'high' : 'medium',
        };
      },
    });

    this.toolManager.registerTool(sentimentTool, {
      id: 'sentiment_analysis',
      name: 'Sentiment Analysis',
      description: 'Analyzes customer sentiment and suggests response tone',
      category: 'analysis',
      version: '1.2.0',
      author: 'ai-team',
      tags: ['sentiment', 'analysis', 'tone'],
      complexity: 'moderate',
      reliability: 0.85,
      performance: 0.9,
      cost: 2,
      dependencies: [],
      conflicts: [],
      requirements: { cpu: 'medium' },
      isActive: true,
    });
  }

  private registerAgentCapabilities(agentId: string) {
    this.communicationManager.registerAgent(agentId, this.getSupportCapabilities(), {
      specialization: 'customer_support',
      experience_level: 'senior',
      languages: ['en', 'es', 'fr'],
      availability_hours: '24/7',
    });
  }

  /**
   * Handle a customer support interaction
   */
  async handleCustomerInquiry(
    customerId: string,
    message: string,
    sessionId: string,
    context?: Record<string, any>,
  ): Promise<{
    response: string;
    actions: Array<{ type: string; data: any }>;
    followUp?: string;
    escalationNeeded?: boolean;
  }> {
    const traceId = this.observabilityManager.startTrace(this.agent.id, sessionId);

    try {
      // Record the inquiry
      this.observabilityManager.recordEvent({
        agentId: this.agent.id,
        sessionId,
        type: 'customer_inquiry',
        level: 'info',
        message: 'Customer inquiry received',
        data: { customerId, messageLength: message.length, context },
        tags: ['customer_support', 'inquiry'],
      });

      // Add to conversation history
      const customerMessage: CoreMessage = { role: 'user', content: message };
      this.memoryManager.addMessage(customerMessage);

      // Retrieve customer context from memory
      const customerContext = this.memoryManager.getRelevantContext(
        `customer ${customerId} inquiry: ${message}`,
        5,
      );

      // Analyze sentiment
      const sentimentResult = await this.toolManager.executeTool(
        'sentiment_analysis',
        { message, context: JSON.stringify(context) },
        this.createExecutionContext(sessionId, 1),
      );

      let urgencyLevel = 'medium';
      let suggestedTone = 'professional and helpful';

      if (sentimentResult.success) {
        urgencyLevel = sentimentResult.result.urgencyLevel;
        suggestedTone = sentimentResult.result.suggestedTone;

        // Store sentiment analysis in memory
        this.memoryManager.addMemory(
          'observation',
          `Customer sentiment: ${sentimentResult.result.sentiment} (confidence: ${sentimentResult.result.confidence})`,
          { customerId, sessionId, analysis: sentimentResult.result },
          0.7,
          ['sentiment', 'customer_analysis'],
        );
      }

      // Look up customer information
      const customerData = await this.toolManager.executeTool(
        'customer_lookup',
        { customerId, includeHistory: true },
        this.createExecutionContext(sessionId, 2),
      );

      // Store customer information in memory
      if (customerData.success && customerData.result.found) {
        this.memoryManager.setVariable('current_customer', customerData.result.customer);

        this.memoryManager.addMemory(
          'knowledge',
          `Customer ${customerData.result.customer.name} (${customerData.result.customer.email}) - ${customerData.result.customer.subscriptionTier} tier, ${customerData.result.customer.totalOrders} orders`,
          { customerId, source: 'customer_lookup' },
          0.9,
          ['customer_info', 'current_session'],
        );
      }

      // Search knowledge base for relevant solutions
      const kbResults = await this.toolManager.executeTool(
        'kb_search',
        {
          query: message,
          priority: urgencyLevel as any,
        },
        this.createExecutionContext(sessionId, 3),
      );

      const actions: Array<{ type: string; data: any }> = [];
      let response = '';
      let followUp: string | undefined;
      let escalationNeeded = false;

      // Generate response based on findings
      if (kbResults.success && kbResults.result.results.length > 0) {
        const relevantArticle = kbResults.result.results[0];

        response = this.generateContextualResponse(
          message,
          relevantArticle,
          customerData.success ? customerData.result.customer : null,
          suggestedTone,
          customerContext,
        );

        actions.push({
          type: 'knowledge_base_used',
          data: { articleId: relevantArticle.id, relevance: relevantArticle.relevance },
        });

        // Store the solution provided
        this.memoryManager.addMemory(
          'knowledge',
          `Provided solution from KB article: ${relevantArticle.title}`,
          { customerId, sessionId, articleId: relevantArticle.id },
          0.8,
          ['solution_provided', 'kb_article'],
        );
      } else {
        // No direct solution found - need to escalate or create ticket
        response = this.generateEscalationResponse(message, suggestedTone);
        escalationNeeded = urgencyLevel === 'high';

        // Create a support ticket
        const ticketResult = await this.toolManager.executeTool(
          'ticket_management',
          {
            action: 'create',
            subject: `Customer inquiry: ${message.substring(0, 50)}...`,
            description: message,
            priority: urgencyLevel as any,
            customerId,
          },
          this.createExecutionContext(sessionId, 4),
        );

        if (ticketResult.success) {
          actions.push({
            type: 'ticket_created',
            data: ticketResult.result,
          });

          followUp = `I've created ticket ${ticketResult.result.ticketId} for your inquiry. You can reference this number in future communications.`;
        }
      }

      // Add response to conversation history
      const assistantMessage: CoreMessage = { role: 'assistant', content: response };
      this.memoryManager.addMessage(assistantMessage);

      // Record successful handling
      this.observabilityManager.recordEvent({
        agentId: this.agent.id,
        sessionId,
        type: 'inquiry_handled',
        level: 'info',
        message: 'Customer inquiry successfully processed',
        data: {
          responseLength: response.length,
          actionsCount: actions.length,
          escalationNeeded,
          urgencyLevel,
        },
        tags: ['customer_support', 'success'],
      });

      return {
        response,
        actions,
        followUp,
        escalationNeeded,
      };
    } catch (error) {
      this.observabilityManager.recordEvent({
        agentId: this.agent.id,
        sessionId,
        type: 'error',
        level: 'error',
        message: 'Error handling customer inquiry',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        tags: ['customer_support', 'error'],
      });

      throw error;
    } finally {
      this.observabilityManager.stopTrace(traceId, {
        steps: [],
        finalResult: { text: 'Inquiry processed', finishReason: 'stop' },
        totalTokensUsed: 500, // Estimated
        executionTime: Date.now() - parseInt(traceId.split('_')[1] || '0'),
        stoppedBy: 'completed',
      });
    }
  }

  private createExecutionContext(sessionId: string, stepNumber: number): ToolExecutionContext {
    return {
      agentId: this.agent.id,
      sessionId,
      stepNumber,
      previousResults: [],
      availableTools: ['kb_search', 'customer_lookup', 'ticket_management', 'sentiment_analysis'],
      executionLimits: {
        maxCalls: 10,
        timeout: 30000,
      },
    };
  }

  private generateContextualResponse(
    inquiry: string,
    kbArticle: any,
    customer: any,
    tone: string,
    _context: any[],
  ): string {
    const greeting = customer ? `Hello ${customer.name}` : 'Hello';
    const personalizedNote =
      customer?.subscriptionTier === 'premium'
        ? ' As a premium member, I want to ensure you get the best possible support.'
        : '';

    return `${greeting},${personalizedNote}

I understand you're asking about: "${inquiry}"

Based on our knowledge base, here's what I can help you with:

${kbArticle.content}

${this.getToneBasedClosing(tone)}

Is there anything else I can help clarify about this?`;
  }

  private generateEscalationResponse(inquiry: string, tone: string): string {
    const empathetic = tone.includes('empathetic');
    const opening = empathetic
      ? 'I understand this situation must be frustrating for you.'
      : 'Thank you for reaching out to us.';

    return `${opening}

Your inquiry about "${inquiry}" requires specialized attention to ensure you get the most accurate and helpful response.

I've created a support ticket for you and will make sure this gets routed to the right specialist who can provide you with a comprehensive solution.

${this.getToneBasedClosing(tone)}

You should hear back from our team within 24 hours, but often much sooner.`;
  }

  private getToneBasedClosing(tone: string): string {
    if (tone.includes('empathetic')) {
      return "I'm here to help make this right for you.";
    } else if (tone.includes('appreciative')) {
      return 'Thank you for being such a valued customer!';
    } else {
      return "I'm here to help if you need anything else.";
    }
  }

  /**
   * Get comprehensive agent performance metrics
   */
  getPerformanceMetrics(): {
    memory: any;
    communication: any;
    tools: any;
    observability: any;
  } {
    return {
      memory: this.memoryManager.getMemoryMetrics(),
      communication: this.communicationManager.getCommunicationMetrics(),
      tools: this.toolManager.generateUsageReport(),
      observability: this.observabilityManager.generateHealthReport(this.agent.id),
    };
  }

  /**
   * Export agent state for backup/analysis
   */
  exportAgentState(sessionId?: string): any {
    return {
      memory: memoryUtils.exportMemory(this.memoryManager),
      observability: this.observabilityManager.exportDebugData(this.agent.id, sessionId),
      performance: this.getPerformanceMetrics(),
      configuration: configurationUtils.generateTemplateDocumentation(
        agentConfigurationTemplates.customerSupport,
      ),
    };
  }

  /**
   * Generate debug information for troubleshooting
   */
  generateDebugReport(sessionId: string): string {
    const debugContext = this.observabilityManager.createDebugContext(this.agent.id, sessionId, {
      currentStep: 0,
      totalSteps: 0,
      conversationHistory: this.memoryManager.getConversationHistory(),
      variableState: { customerId: this.memoryManager.getVariable('current_customer')?.customerId },
      activeTools: ['kb_search', 'customer_lookup', 'ticket_management', 'sentiment_analysis'],
    });

    return debugUtils.formatDebugContext(debugContext);
  }
}

/**
 * Example usage of the Customer Support Agent
 */
export async function demonstrateCustomerSupportAgent() {
  console.log('🤖 Creating Customer Support Agent with Advanced Features...');

  // Create the agent
  const supportAgent = new CustomerSupportAgent('support-agent-001', {
    traceLevel: 'debug', // Detailed logging for demo
  });

  // Simulate customer inquiries
  const inquiries = [
    {
      customerId: 'cust_123456',
      message: "I can't log into my account. I tried resetting my password but the link expired.",
      sessionId: 'session_001',
      context: { channel: 'web_chat', previousAttempts: 2 },
    },
    {
      customerId: 'cust_789012',
      message: "I'm really frustrated! I've been charged twice for my subscription this month.",
      sessionId: 'session_002',
      context: { channel: 'phone', emotionalState: 'angry' },
    },
    {
      customerId: 'cust_345678',
      message: 'Hi! I love your service. Can you help me upgrade to the premium plan?',
      sessionId: 'session_003',
      context: { channel: 'email', customerTier: 'standard' },
    },
  ];

  console.log('\n📞 Processing Customer Inquiries...\n');

  for (const inquiry of inquiries) {
    console.log(`--- Processing inquiry from ${inquiry.customerId} ---`);
    console.log(`Customer: "${inquiry.message}"`);

    try {
      const result = await supportAgent.handleCustomerInquiry(
        inquiry.customerId,
        inquiry.message,
        inquiry.sessionId,
        inquiry.context,
      );

      console.log(`🤖 Agent Response:`);
      console.log(result.response);

      if (result.followUp) {
        console.log(`📋 Follow-up: ${result.followUp}`);
      }

      if (result.escalationNeeded) {
        console.log(`⚠️  Escalation Required: This inquiry needs specialist attention`);
      }

      console.log(`📊 Actions Taken: ${result.actions.map(a => a.type).join(', ')}`);
    } catch (error) {
      console.error(`❌ Error processing inquiry: ${error}`);
    }
  }

  // Show performance metrics
  console.log('📈 Agent Performance Metrics:');
  const metrics = supportAgent.getPerformanceMetrics();

  console.log(
    `🧠 Memory: ${metrics.memory.totalMemories} memories, ${metrics.memory.conversationLength} messages`,
  );
  console.log(
    `💬 Communication: ${metrics.communication.totalMessages} messages, ${metrics.communication.totalAgents} agents`,
  );
  console.log(
    `🔧 Tools: ${metrics.tools.totalExecutions} executions, ${(metrics.tools.overallSuccessRate * 100).toFixed(1)}% success rate`,
  );
  console.log(`🔍 Health: ${metrics.observability.overall.healthyAgents} healthy agents`);

  // Generate debug report for the last session
  console.log('🐛 Debug Report for Last Session:');
  const debugReport = supportAgent.generateDebugReport('session_003');
  console.log(debugReport.substring(0, 500) + '...');

  console.log('✅ Customer Support Agent demonstration completed!');

  return supportAgent;
}

// Export for use in other examples
export default CustomerSupportAgent;
