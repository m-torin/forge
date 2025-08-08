/**
 * AI SDK v5 Agent Communication and Coordination Tests
 * Comprehensive tests for inter-agent communication and coordination protocols
 */

import { afterEach, beforeEach, describe, expect, vi } from 'vitest';
import {
  AgentCommunicationManager,
  communicationUtils,
  createCommunicationAwareAgent,
  globalCommunicationManager,
  type AgentCapability,
  type AgentMessage,
} from '../../../src/server/agents/agent-communication';

// Mock observability
vi.mock('@repo/observability/server/next', () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));

describe('agent Communication and Coordination', () => {
  let communicationManager: AgentCommunicationManager;

  beforeEach(() => {
    communicationManager = new AgentCommunicationManager();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('message Management', () => {
    test('should send and receive messages between agents', async () => {
      const messageId = await communicationManager.sendMessage({
        from: 'agent1',
        to: 'agent2',
        type: 'request',
        priority: 'normal',
        subject: 'Test Request',
        content: 'Can you help with task X?',
        metadata: { taskId: 'task123' },
        requiresResponse: true,
      });

      expect(messageId).toBeDefined();
      expect(typeof messageId).toBe('string');
      expect(messageId).toMatch(/^msg_\d+_[a-z0-9]+$/);

      const receivedMessages = communicationManager.receiveMessages('agent2');
      expect(receivedMessages).toHaveLength(1);
      expect(receivedMessages[0].from).toBe('agent1');
      expect(receivedMessages[0].to).toBe('agent2');
      expect(receivedMessages[0].subject).toBe('Test Request');
      expect(receivedMessages[0].requiresResponse).toBeTruthy();
    });

    test('should handle broadcast messages to all agents', async () => {
      // Register multiple agents
      communicationManager.registerAgent('agent1', []);
      communicationManager.registerAgent('agent2', []);
      communicationManager.registerAgent('agent3', []);

      await communicationManager.sendMessage({
        from: 'system',
        to: 'broadcast',
        type: 'notification',
        priority: 'high',
        subject: 'System Announcement',
        content: 'System maintenance scheduled',
        metadata: {},
      });

      // All agents should receive the broadcast message
      expect(communicationManager.receiveMessages('agent1')).toHaveLength(1);
      expect(communicationManager.receiveMessages('agent2')).toHaveLength(1);
      expect(communicationManager.receiveMessages('agent3')).toHaveLength(1);

      // Sender should not receive their own broadcast
      expect(communicationManager.receiveMessages('system')).toHaveLength(0);
    });

    test('should filter messages by type and priority', async () => {
      await communicationManager.sendMessage({
        from: 'agent1',
        to: 'agent2',
        type: 'request',
        priority: 'high',
        subject: 'High Priority Request',
        content: 'Urgent task',
        metadata: {},
      });

      await communicationManager.sendMessage({
        from: 'agent1',
        to: 'agent2',
        type: 'notification',
        priority: 'low',
        subject: 'Low Priority Notification',
        content: 'FYI message',
        metadata: {},
      });

      const highPriorityMessages = communicationManager.receiveMessages('agent2', {
        priority: 'high',
      });
      expect(highPriorityMessages).toHaveLength(1);
      expect(highPriorityMessages[0].subject).toBe('High Priority Request');

      const requestMessages = communicationManager.receiveMessages('agent2', {
        type: 'request',
      });
      expect(requestMessages).toHaveLength(1);
      expect(requestMessages[0].type).toBe('request');
    });

    test('should sort messages by priority and timestamp', async () => {
      const baseTime = Date.now();

      await communicationManager.sendMessage({
        from: 'agent1',
        to: 'agent2',
        type: 'request',
        priority: 'low',
        subject: 'Low Priority',
        content: 'Low priority task',
        metadata: {},
      });

      await communicationManager.sendMessage({
        from: 'agent1',
        to: 'agent2',
        type: 'request',
        priority: 'urgent',
        subject: 'Urgent Priority',
        content: 'Urgent task',
        metadata: {},
      });

      await communicationManager.sendMessage({
        from: 'agent1',
        to: 'agent2',
        type: 'request',
        priority: 'high',
        subject: 'High Priority',
        content: 'High priority task',
        metadata: {},
      });

      const messages = communicationManager.receiveMessages('agent2');
      expect(messages).toHaveLength(3);
      expect(messages[0].priority).toBe('urgent');
      expect(messages[1].priority).toBe('high');
      expect(messages[2].priority).toBe('low');
    });

    test('should acknowledge and remove processed messages', async () => {
      const messageId = await communicationManager.sendMessage({
        from: 'agent1',
        to: 'agent2',
        type: 'request',
        priority: 'normal',
        subject: 'Test Message',
        content: 'Test content',
        metadata: {},
      });

      let messages = communicationManager.receiveMessages('agent2');
      expect(messages).toHaveLength(1);

      communicationManager.acknowledgeMessages('agent2', [messageId]);

      messages = communicationManager.receiveMessages('agent2');
      expect(messages).toHaveLength(0);
    });
  });

  describe('communication Channels', () => {
    test('should create and manage communication channels', () => {
      const channelId = communicationManager.createChannel(
        'project-team',
        'Project Team Channel',
        ['agent1', 'agent2', 'agent3'],
        true,
        { project: 'alpha' },
      );

      expect(channelId).toBe('project-team');
    });

    test('should subscribe agents to channels', () => {
      const channelId = communicationManager.createChannel('dev-team', 'Development Team', [
        'agent1',
        'agent2',
      ]);

      communicationManager.subscribeToChannel('agent3', channelId);

      // Verify subscription by checking channel existence and basic functionality
      expect(channelId).toBeDefined();
      expect(typeof channelId).toBe('string');
      expect(channelId).toBe('dev-team');
    });
  });

  describe('agent Registration and Status', () => {
    test('should register agents with capabilities', () => {
      const capabilities: AgentCapability[] = [
        {
          name: 'web_search',
          description: 'Search the web for information',
          cost: 2,
          quality: 0.9,
          availability: 0.95,
          requirements: ['internet_access'],
          outputs: ['search_results'],
        },
        {
          name: 'data_analysis',
          description: 'Analyze data and provide insights',
          cost: 3,
          quality: 0.85,
          availability: 0.8,
          requirements: ['computation_resources'],
          outputs: ['analysis_report'],
        },
      ];

      communicationManager.registerAgent('data-agent', capabilities, {
        specialization: 'data_science',
      });

      const suitableAgents = communicationManager.findSuitableAgents(['web_search'], 5);

      expect(suitableAgents).toHaveLength(1);
      expect(suitableAgents[0].agentId).toBe('data-agent');
      expect(suitableAgents[0].capabilities).toHaveLength(2);
    });

    test('should update agent status and track availability', () => {
      communicationManager.registerAgent('worker-agent', []);

      communicationManager.updateAgentStatus('worker-agent', {
        status: 'busy',
        currentLoad: 0.7,
      });

      // Busy agents should not be included in suitable agents for new tasks
      const suitableAgents = communicationManager.findSuitableAgents([], 5);
      expect(suitableAgents.some(a => a.agentId === 'worker-agent')).toBeFalsy();
    });

    test('should find suitable agents based on requirements', () => {
      const searchCapabilities: AgentCapability[] = [
        {
          name: 'web_search',
          description: 'Web search capability',
          cost: 1,
          quality: 0.9,
          availability: 1.0,
          requirements: [],
          outputs: ['results'],
        },
      ];

      const analysisCapabilities: AgentCapability[] = [
        {
          name: 'data_analysis',
          description: 'Data analysis capability',
          cost: 2,
          quality: 0.8,
          availability: 0.9,
          requirements: [],
          outputs: ['insights'],
        },
      ];

      communicationManager.registerAgent('search-agent', searchCapabilities);
      communicationManager.registerAgent('analysis-agent', analysisCapabilities);

      const searchAgents = communicationManager.findSuitableAgents(['web_search'], 5);
      expect(searchAgents).toHaveLength(1);
      expect(searchAgents[0].agentId).toBe('search-agent');

      const analysisAgents = communicationManager.findSuitableAgents(['data_analysis'], 5);
      expect(analysisAgents).toHaveLength(1);
      expect(analysisAgents[0].agentId).toBe('analysis-agent');

      const noMatch = communicationManager.findSuitableAgents(['nonexistent_capability'], 5);
      expect(noMatch).toHaveLength(0);
    });
  });

  describe('coordination Tasks', () => {
    test('should create coordination tasks', async () => {
      const taskId = await communicationManager.createCoordinationTask({
        type: 'collaboration',
        protocol: 'leader_follower',
        participants: ['agent1', 'agent2', 'agent3'],
        coordinator: 'agent1',
        objective: 'Complete project analysis',
        constraints: { deadline: Date.now() + 86400000 }, // 24 hours
        metadata: { priority: 'high' },
      });

      expect(taskId).toBeDefined();
      expect(typeof taskId).toBe('string');
      expect(taskId).toMatch(/^task_\d+_[a-z0-9]+$/);

      const task = communicationManager.getCoordinationTask(taskId);
      expect(task).toBeDefined();
      expect(task!.status).toBe('pending');
      expect(task!.participants).toStrictEqual(['agent1', 'agent2', 'agent3']);
      expect(task!.protocol).toBe('leader_follower');
    });

    test('should execute leader-follower coordination protocol', async () => {
      const taskId = await communicationManager.createCoordinationTask({
        type: 'delegation',
        protocol: 'leader_follower',
        participants: ['leader', 'follower1', 'follower2'],
        coordinator: 'leader',
        objective: 'Execute coordinated task',
        constraints: {},
        metadata: {},
      });

      const task = await communicationManager.executeCoordinationTask(taskId);

      expect(task.status).toBeOneOf(['active', 'completed', 'failed']);

      // Leader should receive delegation message
      const leaderMessages = communicationManager.receiveMessages('leader', {
        type: 'delegation',
      });
      expect(leaderMessages.length).toBeGreaterThan(0);
    });

    test('should execute consensus coordination protocol', async () => {
      const taskId = await communicationManager.createCoordinationTask({
        type: 'negotiation',
        protocol: 'consensus',
        participants: ['agent1', 'agent2', 'agent3'],
        objective: 'Reach consensus on approach',
        constraints: {},
        metadata: {},
      });

      const task = await communicationManager.executeCoordinationTask(taskId);

      expect(task.status).toBeOneOf(['active', 'completed', 'failed']);

      // All participants should receive proposal requests
      const agent1Messages = communicationManager.receiveMessages('agent1', {
        type: 'request',
      });
      const agent2Messages = communicationManager.receiveMessages('agent2', {
        type: 'request',
      });
      const agent3Messages = communicationManager.receiveMessages('agent3', {
        type: 'request',
      });

      expect(agent1Messages.length).toBeGreaterThan(0);
      expect(agent2Messages.length).toBeGreaterThan(0);
      expect(agent3Messages.length).toBeGreaterThan(0);
    });

    test('should execute auction coordination protocol', async () => {
      const taskId = await communicationManager.createCoordinationTask({
        type: 'collaboration',
        protocol: 'auction',
        participants: ['bidder1', 'bidder2', 'bidder3'],
        objective: 'Complete task through auction',
        constraints: {},
        metadata: {},
      });

      const task = await communicationManager.executeCoordinationTask(taskId);

      expect(task.status).toBeOneOf(['active', 'completed', 'failed']);

      // All participants should receive bid requests
      const bidderMessages = communicationManager.receiveMessages('bidder1', {
        type: 'request',
      });
      expect(bidderMessages.length).toBeGreaterThan(0);
      expect(bidderMessages[0].content).toContain('bid');
    });
  });

  describe('communication Metrics', () => {
    test('should provide comprehensive communication metrics', async () => {
      // Set up test data
      communicationManager.registerAgent('agent1', []);
      communicationManager.registerAgent('agent2', []);
      communicationManager.createChannel('test-channel', 'Test Channel', ['agent1', 'agent2']);

      await communicationManager.sendMessage({
        from: 'agent1',
        to: 'agent2',
        type: 'request',
        priority: 'normal',
        subject: 'Test',
        content: 'Test content',
        metadata: {},
      });

      await communicationManager.createCoordinationTask({
        type: 'collaboration',
        protocol: 'peer_to_peer',
        participants: ['agent1', 'agent2'],
        objective: 'Test task',
        constraints: {},
        metadata: {},
      });

      const metrics = communicationManager.getCommunicationMetrics();

      expect(metrics.totalMessages).toBeGreaterThan(0);
      expect(metrics.totalChannels).toBeGreaterThan(0);
      expect(metrics.totalAgents).toBe(2);
      expect(metrics.activeAgents).toBe(0); // No agents marked as busy
      expect(metrics.activeTasks).toBeGreaterThan(0);
      expect(typeof metrics.averageQueueSize).toBe('number');
    });
  });

  describe('communication-Aware Agent Wrapper', () => {
    test('should create communication-aware agents', () => {
      const baseAgent = {
        id: 'comm-test-agent',
        name: 'Communication Test Agent',
        description: 'Agent for testing communication features',
        model: 'test-model' as any,
        tools: {} as any,
      };

      const capabilities: AgentCapability[] = [
        communicationUtils.createCapability('messaging', 'Send and receive messages', {
          quality: 0.9,
          availability: 1.0,
        }),
      ];

      const commAwareAgent = createCommunicationAwareAgent(
        baseAgent,
        communicationManager,
        capabilities,
      );

      expect(commAwareAgent.id).toBe('comm-test-agent');
      expect(commAwareAgent.communication).toBe(communicationManager);

      // Verify agent was registered
      const suitableAgents = communicationManager.findSuitableAgents(['messaging'], 5);
      expect(suitableAgents.some(a => a.agentId === 'comm-test-agent')).toBeTruthy();
    });
  });

  describe('communication Utilities', () => {
    test('should create standard capability definitions', () => {
      const capability = communicationUtils.createCapability(
        'test_capability',
        'Test capability description',
        {
          cost: 2.5,
          quality: 0.85,
          availability: 0.9,
          requirements: ['req1', 'req2'],
          outputs: ['output1'],
        },
      );

      expect(capability.name).toBe('test_capability');
      expect(capability.description).toBe('Test capability description');
      expect(capability.cost).toBe(2.5);
      expect(capability.quality).toBe(0.85);
      expect(capability.availability).toBe(0.9);
      expect(capability.requirements).toStrictEqual(['req1', 'req2']);
      expect(capability.outputs).toStrictEqual(['output1']);
    });

    test('should create message templates', () => {
      const message = communicationUtils.createMessage(
        'sender',
        'receiver',
        'request',
        'Test Subject',
        'Test Content',
        {
          priority: 'high',
          metadata: { key: 'value' },
          requiresResponse: true,
          expiresIn: 3600000, // 1 hour
        },
      );

      expect(message.from).toBe('sender');
      expect(message.to).toBe('receiver');
      expect(message.type).toBe('request');
      expect(message.subject).toBe('Test Subject');
      expect(message.priority).toBe('high');
      expect(message.requiresResponse).toBeTruthy();
      expect(message.expiresAt).toBeGreaterThan(Date.now());
      expect(message.metadata).toStrictEqual({ key: 'value' });
    });

    test('should parse coordination tasks from messages', () => {
      const taskData = {
        id: 'test-task',
        type: 'collaboration',
        protocol: 'consensus',
        participants: ['agent1', 'agent2'],
      };

      const message: AgentMessage = {
        id: 'msg1',
        from: 'system',
        to: 'agent1',
        type: 'coordination',
        priority: 'normal',
        subject: 'Coordination Task',
        content: JSON.stringify(taskData),
        metadata: { taskId: 'test-task' },
        timestamp: Date.now(),
        tags: [],
      };

      const parsedTask = communicationUtils.parseCoordinationTask(message);
      expect(parsedTask).toBeDefined();
      expect(parsedTask!.id).toBe('test-task');
      expect(parsedTask!.protocol).toBe('consensus');
    });

    test('should handle invalid coordination task parsing', () => {
      const invalidMessage: AgentMessage = {
        id: 'msg1',
        from: 'system',
        to: 'agent1',
        type: 'notification',
        priority: 'normal',
        subject: 'Not a coordination task',
        content: 'Regular message content',
        metadata: {},
        timestamp: Date.now(),
        tags: [],
      };

      const parsedTask = communicationUtils.parseCoordinationTask(invalidMessage);
      expect(parsedTask).toBeNull();
    });
  });

  describe('error Handling and Edge Cases', () => {
    test('should handle sending messages to non-existent agents gracefully', async () => {
      const messageId = await communicationManager.sendMessage({
        from: 'agent1',
        to: 'nonexistent-agent',
        type: 'request',
        priority: 'normal',
        subject: 'Test',
        content: 'This should not cause errors',
        metadata: {},
      });

      expect(messageId).toBeDefined();

      // Message should still be queued even if recipient doesn't exist yet
      const messages = communicationManager.receiveMessages('nonexistent-agent');
      expect(messages).toHaveLength(1);
    });

    test('should handle coordination task execution failures', async () => {
      const taskId = await communicationManager.createCoordinationTask({
        type: 'collaboration',
        protocol: 'leader_follower',
        participants: [], // Empty participants should cause issues
        objective: 'Test failing task',
        constraints: {},
        metadata: {},
      });

      const task = await communicationManager.executeCoordinationTask(taskId);

      // Task should complete (possibly with failure status) without throwing
      expect(task).toBeDefined();
      expect(task.id).toBe(taskId);
    });

    test('should handle message filtering edge cases', () => {
      // Test with empty message queue
      const messages = communicationManager.receiveMessages('empty-agent', {
        type: 'request',
        priority: 'high',
        since: Date.now(),
      });

      expect(messages).toHaveLength(0);
    });

    test('should handle agent capability scoring edge cases', () => {
      // Register agent with no capabilities
      communicationManager.registerAgent('no-cap-agent', []);

      const suitableAgents = communicationManager.findSuitableAgents(['any_requirement'], 5);
      expect(suitableAgents).toHaveLength(0);
    });
  });

  describe('global Communication Manager', () => {
    test('should provide a global communication manager instance', () => {
      expect(globalCommunicationManager).toBeInstanceOf(AgentCommunicationManager);

      // Should be able to use global instance
      globalCommunicationManager.registerAgent('global-test-agent', []);
      const metrics = globalCommunicationManager.getCommunicationMetrics();
      expect(metrics.totalAgents).toBeGreaterThan(0);
    });
  });
});
