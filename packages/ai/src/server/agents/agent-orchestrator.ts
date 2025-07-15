/**
 * AI SDK v5 Agent Orchestrator
 * High-level orchestration patterns for complex agent workflows
 */

import { logError, logInfo, logWarn } from '@repo/observability/server/next';
import type { LanguageModel } from 'ai';
import type { PrepareStepCallback } from './agent-controls';
import {
  executeMultiStepAgent,
  type MultiStepConfig,
  type MultiStepResult,
} from './multi-step-execution';
import type { StepCondition } from './step-conditions';

/**
 * Agent definition for orchestration
 */
export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  model: LanguageModel;
  tools: Record<string, any>;
  system?: string;
  maxSteps?: number;
  stopWhen?: StepCondition[];
  prepareStep?: PrepareStepCallback;
  temperature?: number;
  maxOutputTokens?: number;
}

/**
 * Workflow node types
 */
export type WorkflowNodeType = 'agent' | 'parallel' | 'sequential' | 'conditional' | 'loop';

/**
 * Workflow node definition
 */
export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  name: string;
  agentId?: string;
  children?: WorkflowNode[];
  condition?: (context: WorkflowContext) => boolean | Promise<boolean>;
  maxIterations?: number;
  prompt?: string | ((context: WorkflowContext) => string);
}

/**
 * Workflow execution context
 */
export interface WorkflowContext {
  results: Record<string, MultiStepResult>;
  variables: Record<string, any>;
  metadata: Record<string, any>;
  startTime: number;
  currentNodeId?: string;
}

/**
 * Workflow definition
 */
export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  agents: AgentDefinition[];
  workflow: WorkflowNode;
  initialContext?: Record<string, any>;
}

/**
 * Workflow execution result
 */
export interface WorkflowExecutionResult {
  workflowId: string;
  success: boolean;
  results: Record<string, MultiStepResult>;
  finalContext: WorkflowContext;
  executionTime: number;
  totalTokensUsed: number;
  totalSteps: number;
  error?: Error;
}

/**
 * Agent Orchestrator class for managing complex workflows
 */
export class AgentOrchestrator {
  private agents = new Map<string, AgentDefinition>();
  private executionHistory: WorkflowExecutionResult[] = [];

  /**
   * Register an agent definition
   */
  registerAgent(agent: AgentDefinition): void {
    this.agents.set(agent.id, agent);

    logInfo('Agent Orchestrator: Agent registered', {
      operation: 'agent_orchestrator_register',
      metadata: {
        agentId: agent.id,
        agentName: agent.name,
        toolCount: Object.keys(agent.tools).length,
        hasStopConditions: !!agent.stopWhen?.length,
        hasPrepareStep: !!agent.prepareStep,
      },
    });
  }

  /**
   * Get registered agent by ID
   */
  getAgent(agentId: string): AgentDefinition | undefined {
    return this.agents.get(agentId);
  }

  /**
   * List all registered agents
   */
  listAgents(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }

  /**
   * Execute a single agent
   */
  async executeAgent(
    agentId: string,
    prompt: string,
    overrides: Partial<MultiStepConfig> = {},
  ): Promise<MultiStepResult> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    logInfo('Agent Orchestrator: Executing single agent', {
      operation: 'agent_orchestrator_execute_single',
      metadata: { agentId, agentName: agent.name },
    });

    const config: MultiStepConfig = {
      model: agent.model,
      tools: agent.tools,
      maxSteps: agent.maxSteps,
      stopWhen: agent.stopWhen,
      prepareStep: agent.prepareStep,
      system: agent.system,
      temperature: agent.temperature,
      maxOutputTokens: agent.maxOutputTokens,
      ...overrides,
    };

    return executeMultiStepAgent(prompt, config);
  }

  /**
   * Execute a complete workflow
   */
  async executeWorkflow(
    workflow: WorkflowDefinition,
    initialPrompt: string,
    initialVariables: Record<string, any> = {},
  ): Promise<WorkflowExecutionResult> {
    const startTime = Date.now();

    logInfo('Agent Orchestrator: Starting workflow execution', {
      operation: 'agent_orchestrator_workflow_start',
      metadata: {
        workflowId: workflow.id,
        workflowName: workflow.name,
        agentCount: workflow.agents.length,
      },
    });

    // Register workflow agents
    for (const agent of workflow.agents) {
      this.registerAgent(agent);
    }

    const context: WorkflowContext = {
      results: {},
      variables: { ...workflow.initialContext, ...initialVariables, initialPrompt },
      metadata: {},
      startTime,
    };

    try {
      await this.executeWorkflowNode(workflow.workflow, context);

      const executionTime = Date.now() - startTime;
      const totalTokensUsed = Object.values(context.results).reduce(
        (sum, result) => sum + result.totalTokensUsed,
        0,
      );
      const totalSteps = Object.values(context.results).reduce(
        (sum, result) => sum + result.steps.length,
        0,
      );

      const result: WorkflowExecutionResult = {
        workflowId: workflow.id,
        success: true,
        results: context.results,
        finalContext: context,
        executionTime,
        totalTokensUsed,
        totalSteps,
      };

      this.executionHistory.push(result);

      logInfo('Agent Orchestrator: Workflow execution completed', {
        operation: 'agent_orchestrator_workflow_complete',
        metadata: {
          workflowId: workflow.id,
          executionTime,
          totalTokensUsed,
          totalSteps,
          resultCount: Object.keys(context.results).length,
        },
      });

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const totalTokensUsed = Object.values(context.results).reduce(
        (sum, result) => sum + result.totalTokensUsed,
        0,
      );

      const result: WorkflowExecutionResult = {
        workflowId: workflow.id,
        success: false,
        results: context.results,
        finalContext: context,
        executionTime,
        totalTokensUsed,
        totalSteps: 0,
        error: error instanceof Error ? error : new Error(String(error)),
      };

      this.executionHistory.push(result);

      logError('Agent Orchestrator: Workflow execution failed', {
        operation: 'agent_orchestrator_workflow_error',
        metadata: {
          workflowId: workflow.id,
          executionTime,
          currentNodeId: context.currentNodeId,
        },
        error: result.error,
      });

      throw result.error;
    }
  }

  /**
   * Execute a workflow node recursively
   */
  private async executeWorkflowNode(node: WorkflowNode, context: WorkflowContext): Promise<void> {
    context.currentNodeId = node.id;

    logInfo('Agent Orchestrator: Executing workflow node', {
      operation: 'agent_orchestrator_node_execute',
      metadata: {
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
      },
    });

    switch (node.type) {
      case 'agent':
        await this.executeAgentNode(node, context);
        break;
      case 'parallel':
        await this.executeParallelNode(node, context);
        break;
      case 'sequential':
        await this.executeSequentialNode(node, context);
        break;
      case 'conditional':
        await this.executeConditionalNode(node, context);
        break;
      case 'loop':
        await this.executeLoopNode(node, context);
        break;
      default:
        throw new Error(`Unknown workflow node type: ${(node as any).type}`);
    }
  }

  /**
   * Execute an agent node
   */
  private async executeAgentNode(node: WorkflowNode, context: WorkflowContext): Promise<void> {
    if (!node.agentId) {
      throw new Error(`Agent node ${node.id} missing agentId`);
    }

    const prompt = typeof node.prompt === 'function' ? node.prompt(context) : node.prompt || '';
    const result = await this.executeAgent(node.agentId, prompt);
    context.results[node.id] = result;
  }

  /**
   * Execute a parallel node
   */
  private async executeParallelNode(node: WorkflowNode, context: WorkflowContext): Promise<void> {
    if (!node.children?.length) {
      throw new Error(`Parallel node ${node.id} has no children`);
    }

    const parallelPromises = node.children.map(child => this.executeWorkflowNode(child, context));
    await Promise.all(parallelPromises);
  }

  /**
   * Execute a sequential node
   */
  private async executeSequentialNode(node: WorkflowNode, context: WorkflowContext): Promise<void> {
    if (!node.children?.length) {
      throw new Error(`Sequential node ${node.id} has no children`);
    }

    for (const child of node.children) {
      await this.executeWorkflowNode(child, context);
    }
  }

  /**
   * Execute a conditional node
   */
  private async executeConditionalNode(
    node: WorkflowNode,
    context: WorkflowContext,
  ): Promise<void> {
    if (!node.condition) {
      throw new Error(`Conditional node ${node.id} missing condition`);
    }

    const shouldExecute = await node.condition(context);

    logInfo('Agent Orchestrator: Conditional node evaluation', {
      operation: 'agent_orchestrator_conditional',
      metadata: {
        nodeId: node.id,
        shouldExecute,
        hasChildren: !!node.children?.length,
      },
    });

    if (shouldExecute && node.children?.length) {
      for (const child of node.children) {
        await this.executeWorkflowNode(child, context);
      }
    }
  }

  /**
   * Execute a loop node
   */
  private async executeLoopNode(node: WorkflowNode, context: WorkflowContext): Promise<void> {
    if (!node.children?.length) {
      throw new Error(`Loop node ${node.id} has no children`);
    }

    const maxIterations = node.maxIterations || 10;
    let iteration = 0;

    while (iteration < maxIterations) {
      if (node.condition && !(await node.condition(context))) {
        logInfo('Agent Orchestrator: Loop condition false, breaking', {
          operation: 'agent_orchestrator_loop_break',
          metadata: { nodeId: node.id, iteration },
        });
        break;
      }

      logInfo('Agent Orchestrator: Loop iteration', {
        operation: 'agent_orchestrator_loop_iteration',
        metadata: { nodeId: node.id, iteration, maxIterations },
      });

      for (const child of node.children) {
        await this.executeWorkflowNode(child, context);
      }

      iteration++;
    }

    if (iteration >= maxIterations) {
      logWarn('Agent Orchestrator: Loop reached maximum iterations', {
        operation: 'agent_orchestrator_loop_max',
        metadata: { nodeId: node.id, maxIterations },
      });
    }
  }

  /**
   * Get execution history
   */
  getExecutionHistory(): WorkflowExecutionResult[] {
    return [...this.executionHistory];
  }

  /**
   * Clear execution history
   */
  clearExecutionHistory(): void {
    this.executionHistory = [];
    logInfo('Agent Orchestrator: Execution history cleared', {
      operation: 'agent_orchestrator_history_clear',
    });
  }

  /**
   * Get orchestrator statistics
   */
  getStatistics(): {
    totalWorkflowsExecuted: number;
    successfulWorkflows: number;
    failedWorkflows: number;
    totalExecutionTime: number;
    totalTokensUsed: number;
    averageExecutionTime: number;
    averageTokensPerWorkflow: number;
  } {
    const successful = this.executionHistory.filter(r => r.success);
    const failed = this.executionHistory.filter(r => !r.success);
    const totalExecutionTime = this.executionHistory.reduce((sum, r) => sum + r.executionTime, 0);
    const totalTokensUsed = this.executionHistory.reduce((sum, r) => sum + r.totalTokensUsed, 0);

    return {
      totalWorkflowsExecuted: this.executionHistory.length,
      successfulWorkflows: successful.length,
      failedWorkflows: failed.length,
      totalExecutionTime,
      totalTokensUsed,
      averageExecutionTime: totalExecutionTime / Math.max(this.executionHistory.length, 1),
      averageTokensPerWorkflow: totalTokensUsed / Math.max(this.executionHistory.length, 1),
    };
  }
}

/**
 * Global agent orchestrator instance
 */
export const globalAgentOrchestrator = new AgentOrchestrator();

/**
 * Utility functions for creating common workflow patterns
 */
export const workflowPatterns = {
  /**
   * Create a simple sequential workflow
   */
  createSequentialWorkflow(
    id: string,
    name: string,
    agents: Array<{ agentId: string; prompt: string }>,
  ): WorkflowDefinition {
    return {
      id,
      name,
      description: `Sequential workflow with ${agents.length} agents`,
      agents: [],
      workflow: {
        id: 'root',
        type: 'sequential',
        name: 'Sequential Root',
        children: agents.map((agent, index) => ({
          id: `agent_${index}`,
          type: 'agent' as const,
          name: `Agent ${index + 1}`,
          agentId: agent.agentId,
          prompt: agent.prompt,
        })),
      },
    };
  },

  /**
   * Create a parallel workflow
   */
  createParallelWorkflow(
    id: string,
    name: string,
    agents: Array<{ agentId: string; prompt: string }>,
  ): WorkflowDefinition {
    return {
      id,
      name,
      description: `Parallel workflow with ${agents.length} agents`,
      agents: [],
      workflow: {
        id: 'root',
        type: 'parallel',
        name: 'Parallel Root',
        children: agents.map((agent, index) => ({
          id: `agent_${index}`,
          type: 'agent' as const,
          name: `Agent ${index + 1}`,
          agentId: agent.agentId,
          prompt: agent.prompt,
        })),
      },
    };
  },

  /**
   * Create a conditional workflow based on first agent's result
   */
  createConditionalWorkflow(
    id: string,
    name: string,
    decisionAgent: { agentId: string; prompt: string },
    conditionalAgents: Array<{ condition: string; agentId: string; prompt: string }>,
  ): WorkflowDefinition {
    return {
      id,
      name,
      description: `Conditional workflow with decision agent and ${conditionalAgents.length} conditional branches`,
      agents: [],
      workflow: {
        id: 'root',
        type: 'sequential',
        name: 'Conditional Root',
        children: [
          {
            id: 'decision',
            type: 'agent',
            name: 'Decision Agent',
            agentId: decisionAgent.agentId,
            prompt: decisionAgent.prompt,
          },
          ...conditionalAgents.map((agent, index) => ({
            id: `conditional_${index}`,
            type: 'conditional' as const,
            name: `Conditional ${index + 1}`,
            condition: (context: WorkflowContext) => {
              const decisionResult = context.results.decision?.finalResult?.text || '';
              return decisionResult.toLowerCase().includes(agent.condition.toLowerCase());
            },
            children: [
              {
                id: `conditional_agent_${index}`,
                type: 'agent' as const,
                name: `Conditional Agent ${index + 1}`,
                agentId: agent.agentId,
                prompt: agent.prompt,
              },
            ],
          })),
        ],
      },
    };
  },
} as const;
