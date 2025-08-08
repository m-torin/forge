/**
 * AI SDK v5 Agent Communication and Coordination
 * Advanced inter-agent communication and coordination patterns
 */

import { logError, logInfo, logWarn } from '@repo/observability/server/next';
import type { AgentDefinition } from './agent-orchestrator';
import type { MultiStepResult } from './multi-step-execution';

/**
 * Message types for inter-agent communication
 */
export type AgentMessageType =
  | 'request'
  | 'response'
  | 'notification'
  | 'coordination'
  | 'status_update'
  | 'resource_request'
  | 'handoff'
  | 'broadcast'
  | 'delegation';

/**
 * Message priority levels
 */
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Inter-agent message structure
 */
export interface AgentMessage {
  id: string;
  from: string; // sender agent ID
  to: string | string[]; // receiver agent ID(s) or 'broadcast'
  type: AgentMessageType;
  priority: MessagePriority;
  subject: string;
  content: string;
  metadata: Record<string, any>;
  timestamp: number;
  expiresAt?: number;
  requiresResponse?: boolean;
  correlationId?: string;
  parentMessageId?: string;
}

/**
 * Agent communication channel
 */
export interface CommunicationChannel {
  id: string;
  name: string;
  participants: string[]; // agent IDs
  isPrivate: boolean;
  messageHistory: AgentMessage[];
  metadata: Record<string, any>;
  createdAt: number;
}

/**
 * Coordination protocol types
 */
export type CoordinationProtocol =
  | 'leader_follower'
  | 'consensus'
  | 'auction'
  | 'contract_net'
  | 'blackboard'
  | 'hierarchical'
  | 'peer_to_peer';

/**
 * Coordination task definition
 */
export interface CoordinationTask {
  id: string;
  type: 'collaboration' | 'delegation' | 'negotiation' | 'synchronization';
  protocol: CoordinationProtocol;
  participants: string[]; // agent IDs
  coordinator?: string;
  objective: string;
  constraints: Record<string, any>;
  deadline?: number;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'cancelled';
  results: Record<string, MultiStepResult>;
  metadata: Record<string, any>;
}

/**
 * Agent capability description for coordination
 */
export interface AgentCapability {
  name: string;
  description: string;
  cost: number; // resource cost
  quality: number; // quality metric (0-1)
  availability: number; // availability (0-1)
  requirements: string[];
  outputs: string[];
}

/**
 * Agent status for coordination
 */
export interface AgentStatus {
  agentId: string;
  status: 'idle' | 'busy' | 'offline' | 'maintenance';
  currentLoad: number; // 0-1 scale
  capabilities: AgentCapability[];
  lastHeartbeat: number;
  metadata: Record<string, any>;
}

/**
 * Advanced agent communication manager
 */
export class AgentCommunicationManager {
  private messages = new Map<string, AgentMessage>();
  private channels = new Map<string, CommunicationChannel>();
  private agentStatuses = new Map<string, AgentStatus>();
  private coordinationTasks = new Map<string, CoordinationTask>();
  private messageQueue = new Map<string, AgentMessage[]>(); // per-agent queues
  private subscriptions = new Map<string, Set<string>>(); // agent -> channel subscriptions

  constructor() {
    // Create default broadcast channel
    this.createChannel('broadcast', 'Global Broadcast Channel', [], false);

    logInfo('Agent Communication Manager: Initialized', {
      operation: 'agent_communication_init',
    });
  }

  /**
   * Send message between agents
   */
  async sendMessage(message: Omit<AgentMessage, 'id' | 'timestamp'>): Promise<string> {
    const messageId = this.generateMessageId();
    const fullMessage: AgentMessage = {
      ...message,
      id: messageId,
      timestamp: Date.now(),
    };

    this.messages.set(messageId, fullMessage);

    // Add to recipient queues
    const recipients = Array.isArray(message.to) ? message.to : [message.to];

    if (recipients.includes('broadcast')) {
      // Send to all registered agents
      for (const agentId of this.agentStatuses.keys()) {
        if (agentId !== message.from) {
          this.addToQueue(agentId, fullMessage);
        }
      }
    } else {
      recipients.forEach(recipient => {
        this.addToQueue(recipient, fullMessage);
      });
    }

    logInfo('Agent Communication Manager: Message sent', {
      operation: 'agent_message_sent',
      metadata: {
        messageId,
        from: message.from,
        to: message.to,
        type: message.type,
        priority: message.priority,
      },
    });

    return messageId;
  }

  /**
   * Receive messages for an agent
   */
  receiveMessages(
    agentId: string,
    filter?: {
      type?: AgentMessageType;
      priority?: MessagePriority;
      since?: number;
    },
  ): AgentMessage[] {
    const queue = this.messageQueue.get(agentId) || [];
    let messages = [...queue];

    if (filter) {
      if (filter.type) {
        messages = messages.filter(m => m.type === filter.type);
      }
      if (filter.priority) {
        messages = messages.filter(m => m.priority === filter.priority);
      }
      if (filter.since) {
        messages = messages.filter(m => m.timestamp >= (filter.since ?? 0));
      }
    }

    // Sort by priority and timestamp
    messages.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];

      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }

      return a.timestamp - b.timestamp; // Older first for same priority
    });

    return messages;
  }

  /**
   * Mark messages as processed and remove from queue
   */
  acknowledgeMessages(agentId: string, messageIds: string[]): void {
    const queue = this.messageQueue.get(agentId) || [];
    const filteredQueue = queue.filter(m => !messageIds.includes(m.id));
    this.messageQueue.set(agentId, filteredQueue);

    logInfo('Agent Communication Manager: Messages acknowledged', {
      operation: 'agent_messages_acknowledged',
      metadata: { agentId, messageCount: messageIds.length },
    });
  }

  /**
   * Create communication channel
   */
  createChannel(
    id: string,
    name: string,
    participants: string[],
    isPrivate: boolean = true,
    metadata: Record<string, any> = {},
  ): string {
    const channel: CommunicationChannel = {
      id,
      name,
      participants,
      isPrivate,
      messageHistory: [],
      metadata,
      createdAt: Date.now(),
    };

    this.channels.set(id, channel);

    // Subscribe participants to channel
    participants.forEach(agentId => {
      this.subscribeToChannel(agentId, id);
    });

    logInfo('Agent Communication Manager: Channel created', {
      operation: 'agent_channel_created',
      metadata: { channelId: id, participants: participants.length },
    });

    return id;
  }

  /**
   * Subscribe agent to channel
   */
  subscribeToChannel(agentId: string, channelId: string): void {
    if (!this.subscriptions.has(agentId)) {
      this.subscriptions.set(agentId, new Set());
    }
    this.subscriptions.get(agentId)?.add(channelId);

    const channel = this.channels.get(channelId);
    if (channel && !channel.participants.includes(agentId)) {
      channel.participants.push(agentId);
    }
  }

  /**
   * Register agent and its capabilities
   */
  registerAgent(
    agentId: string,
    capabilities: AgentCapability[],
    metadata: Record<string, any> = {},
  ): void {
    const status: AgentStatus = {
      agentId,
      status: 'idle',
      currentLoad: 0,
      capabilities,
      lastHeartbeat: Date.now(),
      metadata,
    };

    this.agentStatuses.set(agentId, status);
    this.messageQueue.set(agentId, []);

    logInfo('Agent Communication Manager: Agent registered', {
      operation: 'agent_registered',
      metadata: { agentId, capabilities: capabilities.length },
    });
  }

  /**
   * Update agent status
   */
  updateAgentStatus(agentId: string, updates: Partial<Omit<AgentStatus, 'agentId'>>): void {
    const status = this.agentStatuses.get(agentId);
    if (status) {
      Object.assign(status, updates, { lastHeartbeat: Date.now() });

      logInfo('Agent Communication Manager: Agent status updated', {
        operation: 'agent_status_updated',
        metadata: { agentId, status: status.status, load: status.currentLoad },
      });
    }
  }

  /**
   * Create coordination task
   */
  async createCoordinationTask(
    task: Omit<CoordinationTask, 'id' | 'status' | 'results'>,
  ): Promise<string> {
    const taskId = this.generateTaskId();
    const fullTask: CoordinationTask = {
      ...task,
      id: taskId,
      status: 'pending',
      results: {},
    };

    this.coordinationTasks.set(taskId, fullTask);

    // Notify participants
    await this.sendMessage({
      from: 'system',
      to: task.participants,
      type: 'coordination',
      priority: 'normal',
      subject: `New coordination task: ${task.objective}`,
      content: JSON.stringify(task),
      metadata: { taskId, protocol: task.protocol },
      requiresResponse: true,
    });

    logInfo('Agent Communication Manager: Coordination task created', {
      operation: 'coordination_task_created',
      metadata: { taskId, protocol: task.protocol, participants: task.participants.length },
    });

    return taskId;
  }

  /**
   * Execute coordination task using specified protocol
   */
  async executeCoordinationTask(taskId: string): Promise<CoordinationTask> {
    const task = this.coordinationTasks.get(taskId);
    if (!task) {
      throw new Error(`Coordination task not found: ${taskId}`);
    }

    task.status = 'active';

    try {
      switch (task.protocol) {
        case 'leader_follower':
          await this.executeLeaderFollowerProtocol(task);
          break;
        case 'consensus':
          await this.executeConsensusProtocol(task);
          break;
        case 'auction':
          await this.executeAuctionProtocol(task);
          break;
        case 'contract_net':
          await this.executeContractNetProtocol(task);
          break;
        case 'peer_to_peer':
          await this.executePeerToPeerProtocol(task);
          break;
        default:
          throw new Error(`Unsupported coordination protocol: ${task.protocol}`);
      }

      task.status = 'completed';
    } catch (error) {
      task.status = 'failed';
      task.metadata.error = error instanceof Error ? error.message : String(error);

      logError('Agent Communication Manager: Coordination task failed', {
        operation: 'coordination_task_failed',
        metadata: { taskId, protocol: task.protocol },
        error: error as Error,
      });
    }

    return task;
  }

  /**
   * Find suitable agents for a task based on capabilities
   */
  findSuitableAgents(
    requirements: string[],
    maxAgents: number = 5,
    excludeAgents: string[] = [],
  ): AgentStatus[] {
    const availableAgents = Array.from(this.agentStatuses.values()).filter(
      status =>
        status.status === 'idle' &&
        status.currentLoad < 0.8 &&
        !excludeAgents.includes(status.agentId),
    );

    const suitableAgents = availableAgents.filter(status => {
      const agentCapabilities = status.capabilities.map(c => c.name);
      return requirements.every(req =>
        agentCapabilities.some(cap => cap.toLowerCase().includes(req.toLowerCase())),
      );
    });

    // Score and sort agents
    const scoredAgents = suitableAgents.map(status => {
      const capabilityScore =
        status.capabilities.reduce((sum, cap) => sum + cap.quality, 0) / status.capabilities.length;
      const availabilityScore =
        status.capabilities.reduce((sum, cap) => sum + cap.availability, 0) /
        status.capabilities.length;
      const loadScore = 1 - status.currentLoad;

      const totalScore = (capabilityScore + availabilityScore + loadScore) / 3;

      return { ...status, score: totalScore };
    });

    return scoredAgents.sort((a, b) => b.score - a.score).slice(0, maxAgents);
  }

  /**
   * Get coordination task status
   */
  getCoordinationTask(taskId: string): CoordinationTask | undefined {
    return this.coordinationTasks.get(taskId);
  }

  /**
   * Get communication metrics
   */
  getCommunicationMetrics(): {
    totalMessages: number;
    totalChannels: number;
    totalAgents: number;
    activeAgents: number;
    activeTasks: number;
    averageQueueSize: number;
  } {
    const totalMessages = this.messages.size;
    const totalChannels = this.channels.size;
    const totalAgents = this.agentStatuses.size;
    const activeAgents = Array.from(this.agentStatuses.values()).filter(
      s => s.status === 'busy',
    ).length;
    const activeTasks = Array.from(this.coordinationTasks.values()).filter(
      t => t.status === 'active',
    ).length;

    const queueSizes = Array.from(this.messageQueue.values()).map(q => q.length);
    const averageQueueSize =
      queueSizes.length > 0
        ? queueSizes.reduce((sum, size) => sum + size, 0) / queueSizes.length
        : 0;

    return {
      totalMessages,
      totalChannels,
      totalAgents,
      activeAgents,
      activeTasks,
      averageQueueSize,
    };
  }

  // Private protocol implementations

  private async executeLeaderFollowerProtocol(task: CoordinationTask): Promise<void> {
    const leader = task.coordinator || task.participants[0];
    const followers = task.participants.filter(p => p !== leader);

    // Leader creates plan and delegates to followers
    await this.sendMessage({
      from: 'system',
      to: leader,
      type: 'delegation',
      priority: 'high',
      subject: 'Lead coordination task',
      content: `You are the leader for task: ${task.objective}. Create a plan and delegate to followers: ${followers.join(', ')}`,
      metadata: { taskId: task.id, role: 'leader' },
      requiresResponse: true,
    });

    // Wait for leader's plan and delegation
    // In a real implementation, this would involve more sophisticated coordination
  }

  private async executeConsensusProtocol(task: CoordinationTask): Promise<void> {
    // All participants propose solutions and vote
    await this.sendMessage({
      from: 'system',
      to: task.participants,
      type: 'request',
      priority: 'normal',
      subject: 'Propose solution for consensus',
      content: `Propose your solution for: ${task.objective}`,
      metadata: { taskId: task.id, protocol: 'consensus', phase: 'proposal' },
      requiresResponse: true,
    });
  }

  private async executeAuctionProtocol(task: CoordinationTask): Promise<void> {
    // Agents bid on the task
    await this.sendMessage({
      from: 'system',
      to: task.participants,
      type: 'request',
      priority: 'normal',
      subject: 'Submit bid for task',
      content: `Submit your bid (cost and quality) for: ${task.objective}`,
      metadata: { taskId: task.id, protocol: 'auction', phase: 'bidding' },
      requiresResponse: true,
    });
  }

  private async executeContractNetProtocol(task: CoordinationTask): Promise<void> {
    // Contract Net Protocol: announce, bid, award, execute
    await this.sendMessage({
      from: 'system',
      to: task.participants,
      type: 'notification',
      priority: 'normal',
      subject: 'Task announcement - Contract Net',
      content: `Task available: ${task.objective}. Submit proposals if interested.`,
      metadata: { taskId: task.id, protocol: 'contract_net', phase: 'announcement' },
      requiresResponse: false,
    });
  }

  private async executePeerToPeerProtocol(task: CoordinationTask): Promise<void> {
    // Peer-to-peer coordination - agents self-organize
    await this.sendMessage({
      from: 'system',
      to: task.participants,
      type: 'coordination',
      priority: 'normal',
      subject: 'Peer-to-peer coordination task',
      content: `Coordinate among yourselves to achieve: ${task.objective}`,
      metadata: { taskId: task.id, protocol: 'peer_to_peer' },
      requiresResponse: false,
    });
  }

  // Utility methods

  private addToQueue(agentId: string, message: AgentMessage): void {
    if (!this.messageQueue.has(agentId)) {
      this.messageQueue.set(agentId, []);
    }
    const queue = this.messageQueue.get(agentId);
    if (queue) {
      queue.push(message);
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }
}

/**
 * Communication-aware agent wrapper
 */
export function createCommunicationAwareAgent<T extends AgentDefinition>(
  agent: T,
  communicationManager: AgentCommunicationManager,
  capabilities: AgentCapability[] = [],
): T & { communication: AgentCommunicationManager } {
  // Register agent with communication manager
  communicationManager.registerAgent(agent.id, capabilities, {
    name: agent.name,
    description: agent.description,
  });

  return {
    ...agent,
    communication: communicationManager,
  };
}

/**
 * Utility functions for agent communication
 */
export const communicationUtils = {
  /**
   * Create standard capability definitions
   */
  createCapability: (
    name: string,
    description: string,
    options: {
      cost?: number;
      quality?: number;
      availability?: number;
      requirements?: string[];
      outputs?: string[];
    } = {},
  ): AgentCapability => ({
    name,
    description,
    cost: options.cost || 1.0,
    quality: options.quality || 0.8,
    availability: options.availability || 0.9,
    requirements: options.requirements || [],
    outputs: options.outputs || [],
  }),

  /**
   * Create message template
   */
  createMessage: (
    from: string,
    to: string | string[],
    type: AgentMessageType,
    subject: string,
    content: string,
    options: {
      priority?: MessagePriority;
      metadata?: Record<string, any>;
      requiresResponse?: boolean;
      expiresIn?: number;
    } = {},
  ): Omit<AgentMessage, 'id' | 'timestamp'> => ({
    from,
    to,
    type,
    priority: options.priority || 'normal',
    subject,
    content,
    metadata: options.metadata || {},
    requiresResponse: options.requiresResponse || false,
    expiresAt: options.expiresIn ? Date.now() + options.expiresIn : undefined,
  }),

  /**
   * Parse coordination task from message
   */
  parseCoordinationTask: (message: AgentMessage): CoordinationTask | null => {
    try {
      if (message.type === 'coordination' && message.metadata.taskId) {
        const taskData = JSON.parse(message.content);
        return taskData as CoordinationTask;
      }
    } catch (_error) {
      logWarn('Failed to parse coordination task from message', {
        operation: 'parse_coordination_task_failed',
        metadata: { messageId: message.id },
      });
    }
    return null;
  },
} as const;

/**
 * Global communication manager instance
 */
export const globalCommunicationManager = new AgentCommunicationManager();
