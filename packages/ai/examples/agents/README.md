# AI Agent Examples

This directory contains comprehensive, production-ready examples demonstrating
the AI agent capabilities built on top of AI SDK v5. These examples showcase how
to use all the features together in real-world scenarios.

## Features Demonstrated

All examples integrate the following agent features:

- **🧠 Memory Management**: Long-term memory, conversation history, and context
  persistence
- **💬 Agent Communication**: Inter-agent messaging and coordination protocols
- **🔧 Advanced Tool Management**: Dynamic tool loading, performance tracking,
  and optimization
- **📊 Observability**: Comprehensive monitoring, tracing, and debugging
  capabilities
- **⚙️ Configuration Templates**: Pre-built templates for common use cases

## Examples

### 1. Customer Support Agent (`customer-support-agent.ts`)

A production-ready customer support agent that provides intelligent, empathetic
customer service.

**Key Features:**

- Sentiment analysis and tone adaptation
- Customer history and preference tracking
- Knowledge base search and ticket management
- Escalation handling and team coordination
- Comprehensive performance monitoring

**Usage:**

```typescript
import {
  CustomerSupportAgent,
  demonstrateCustomerSupportAgent
} from "./customer-support-agent";

// Create agent
const supportAgent = new CustomerSupportAgent("support-agent-001");

// Handle customer inquiry
const result = await supportAgent.handleCustomerInquiry(
  "customer-123",
  "I can't log into my account and I'm frustrated!",
  "session-001",
  { channel: "web_chat", emotionalState: "frustrated" }
);

// Or run demonstration
await demonstrateCustomerSupportAgent();
```

**Demonstrates:**

- Emotional intelligence and personalized responses
- Tool integration (knowledge base, customer lookup, ticketing)
- Memory persistence across customer interactions
- Performance monitoring and optimization
- Team coordination for complex issues

### 2. Research Assistant Agent (`research-assistant-agent.ts`)

A comprehensive research assistant that conducts multi-step research workflows
with academic rigor.

**Key Features:**

- Academic database search and web research
- Source credibility analysis and citation generation
- Data analysis and insight synthesis
- Long-term research project tracking
- Collaborative research coordination

**Usage:**

```typescript
import {
  ResearchAssistantAgent,
  demonstrateResearchAssistant
} from "./research-assistant-agent";

// Create agent
const researchAgent = new ResearchAssistantAgent("research-agent-001");

// Conduct research
const result = await researchAgent.conductResearch(
  "Impact of AI on Software Development",
  "research-session-001",
  {
    depth: "comprehensive",
    sources: ["academic", "web"],
    citationStyle: "APA",
    specificQuestions: [
      "What is the measured productivity impact?",
      "What are the adoption barriers?"
    ]
  }
);

// Or run demonstration
await demonstrateResearchAssistant();
```

**Demonstrates:**

- Multi-step research workflows
- Source evaluation and synthesis
- Academic citation generation
- Research session persistence
- Collaborative research coordination

### 3. Multi-Agent Development Team (`multi-agent-collaboration.ts`)

A sophisticated team of specialized agents that collaborate to complete software
development projects.

**Team Members:**

- **Product Manager**: Requirements analysis and project coordination
- **Architect**: System design and technical planning
- **Developer**: Code implementation and testing
- **QA Agent**: Quality assurance and testing
- **DevOps Agent**: Deployment and infrastructure management

**Usage:**

```typescript
import {
  MultiAgentDevelopmentTeam,
  demonstrateMultiAgentCollaboration
} from "./multi-agent-collaboration";

// Create development team
const team = new MultiAgentDevelopmentTeam();

// Execute project
const result = await team.executeProject(
  {
    name: "E-Commerce Analytics Dashboard",
    description: "A comprehensive analytics dashboard...",
    requirements: ["Real-time tracking", "Multi-tenant support"],
    timeline: "6 weeks",
    complexity: "moderate"
  },
  "project-session-001"
);

// Or run demonstration
await demonstrateMultiAgentCollaboration();
```

**Demonstrates:**

- Inter-agent coordination and task distribution
- Specialized agent roles and capabilities
- Project lifecycle management
- Collaborative decision-making
- Team performance monitoring

## Running the Examples

### Prerequisites

1. Install dependencies:

```bash
pnpm install
```

2. Set up environment variables:

```bash
# Copy and customize environment variables
cp .env.example .env.local

# Required variables:
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### Running Individual Examples

Each example can be run independently:

```typescript
// In your code
import { demonstrateCustomerSupportAgent } from "./examples/agents/customer-support-agent";
import { demonstrateResearchAssistant } from "./examples/agents/research-assistant-agent";
import { demonstrateMultiAgentCollaboration } from "./examples/agents/multi-agent-collaboration";

// Run demonstrations
await demonstrateCustomerSupportAgent();
await demonstrateResearchAssistant();
await demonstrateMultiAgentCollaboration();
```

### Creating Custom Agents

You can extend these examples or create your own agents:

```typescript
import {
  AgentMemoryManager,
  createMemoryAwareAgent,
  AgentCommunicationManager,
  createCommunicationAwareAgent,
  DynamicToolManager,
  AgentObservabilityManager,
  createObservableAgent
} from "@repo/ai/server/agents";

// Create custom agent with all advanced features
class CustomAgent {
  constructor(agentId: string) {
    // Set up memory
    this.memoryManager = new AgentMemoryManager(agentId, {
      maxEntries: 1000,
      retentionDays: 30,
      persistenceEnabled: true
    });

    // Set up communication
    this.communicationManager = new AgentCommunicationManager();

    // Set up tools
    this.toolManager = new DynamicToolManager({
      performanceTracking: true,
      autoOptimization: true
    });

    // Set up observability
    this.observabilityManager = new AgentObservabilityManager({
      enableTracing: true,
      enablePerformanceTracking: true
    });

    // Create the comprehensive agent
    this.agent = createObservableAgent(
      createCommunicationAwareAgent(
        createMemoryAwareAgent(baseAgent, memoryConfig),
        this.communicationManager,
        capabilities
      ),
      this.observabilityManager
    );
  }
}
```

## Architecture Overview

### Memory System

- **Persistent Storage**: Long-term memory across sessions
- **Context Retrieval**: Intelligent context selection for prompts
- **Memory Consolidation**: Automatic cleanup and optimization
- **State Snapshots**: Full agent state backup and restore

### Communication System

- **Inter-Agent Messaging**: Reliable message passing between agents
- **Coordination Protocols**: Leader-follower, consensus, auction patterns
- **Capability Matching**: Automatic routing based on agent capabilities
- **Team Analytics**: Performance monitoring and optimization

### Tool Management

- **Dynamic Loading**: Runtime tool discovery and loading
- **Performance Tracking**: Comprehensive tool execution metrics
- **Auto-Optimization**: Automatic tool selection optimization
- **Caching System**: Intelligent tool result caching

### Observability

- **Distributed Tracing**: Full execution trace across agents
- **Performance Monitoring**: Real-time performance metrics
- **Health Checks**: Automated agent health monitoring
- **Debug Context**: Rich debugging information for troubleshooting

## Production Considerations

### Performance

- **Memory Management**: Configure appropriate memory limits and retention
- **Tool Caching**: Enable caching for frequently used tools
- **Connection Pooling**: Use connection pooling for database operations
- **Auto-Scaling**: Implement auto-scaling based on agent load

### Security

- **API Key Management**: Secure storage and rotation of API keys
- **Access Control**: Role-based access control for agent operations
- **Data Encryption**: Encrypt sensitive data in memory and storage
- **Audit Logging**: Comprehensive audit trails for all operations

### Monitoring

- **Health Checks**: Regular health checks and automated recovery
- **Performance Metrics**: Monitor response times and throughput
- **Error Tracking**: Centralized error logging and alerting
- **Usage Analytics**: Track agent usage patterns and optimization opportunities

### Scalability

- **Horizontal Scaling**: Deploy multiple agent instances
- **Load Balancing**: Distribute requests across agent instances
- **Database Scaling**: Use read replicas and sharding as needed
- **Resource Management**: Monitor and manage CPU/memory usage

## Best Practices

1. **Memory Management**
   - Set appropriate retention periods for different memory types
   - Use memory consolidation to prevent memory bloat
   - Implement regular memory cleanup procedures

2. **Tool Design**
   - Design tools to be stateless and idempotent
   - Implement proper error handling and retries
   - Use caching for expensive operations

3. **Communication Patterns**
   - Use appropriate coordination protocols for different scenarios
   - Implement timeout and retry mechanisms
   - Monitor communication patterns for optimization

4. **Observability**
   - Implement comprehensive logging and tracing
   - Set up alerting for critical failures
   - Regular performance analysis and optimization

5. **Testing**
   - Test individual agents and multi-agent interactions
   - Use comprehensive test scenarios
   - Implement chaos engineering for resilience testing

## Troubleshooting

### Common Issues

1. **Memory Issues**
   - Check memory configuration and limits
   - Review memory consolidation settings
   - Monitor memory usage patterns

2. **Communication Failures**
   - Verify agent registration and capabilities
   - Check message queue health
   - Review coordination protocol configurations

3. **Tool Performance**
   - Check tool execution metrics
   - Review caching configuration
   - Optimize tool selection algorithms

4. **Observability Gaps**
   - Verify tracing configuration
   - Check health check intervals
   - Review alerting thresholds

### Debug Tools

Use the built-in debug utilities:

```typescript
import { debugUtils } from "@repo/ai/server/agents";

// Generate debug report
const debugReport = agent.generateDebugReport(sessionId);
console.log(debugUtils.formatDebugContext(debugReport));

// Export agent state
const agentState = agent.exportAgentState(sessionId);
console.log(JSON.stringify(agentState, null, 2));

// Performance analysis
const metrics = agent.getPerformanceMetrics();
console.log("Performance:", metrics);
```

## Contributing

When contributing to these examples:

1. Follow the established patterns and architectures
2. Include comprehensive error handling
3. Add proper observability and monitoring
4. Write tests for new functionality
5. Update documentation for any changes

## License

These examples are part of the AI package and follow the same licensing terms.
