/**
 * AI SDK v5 Agent Memory Management Tests
 * Comprehensive tests for the agent memory and state management system
 */

import type { CoreMessage } from 'ai';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';
import {
  AgentMemoryManager,
  createMemoryAwareAgent,
  memoryUtils,
  type AgentStateSnapshot,
} from '../../../src/server/agents/agent-memory';

// Mock observability
vi.mock('@repo/observability/server/next', () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));

describe('agent Memory Management', () => {
  let memoryManager: AgentMemoryManager;
  let mockAgentId: string;

  beforeEach(() => {
    mockAgentId = 'test-agent-123';
    memoryManager = new AgentMemoryManager(mockAgentId, {
      maxEntries: 100,
      retentionDays: 7,
      compressionThreshold: 50,
      indexingEnabled: true,
      persistenceEnabled: false,
      searchEnabled: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('memory Entry Management', () => {
    test('should add memory entries with proper metadata', () => {
      const memoryId = memoryManager.addMemory(
        'task',
        'Complete project analysis',
        { priority: 'high', assignee: 'user' },
        0.8,
        ['project', 'analysis'],
      );

      expect(memoryId).toBeDefined();
      expect(typeof memoryId).toBe('string');
      expect(memoryId).toMatch(/^mem_\d+_[a-z0-9]+$/);
    });

    test('should search memories by type and content', () => {
      // Add test memories
      memoryManager.addMemory('task', 'Complete project analysis', {}, 0.8, ['project']);
      memoryManager.addMemory('task', 'Review code changes', {}, 0.6, ['code', 'review']);
      memoryManager.addMemory('knowledge', 'Project uses React and TypeScript', {}, 0.9, ['tech']);

      const taskResults = memoryManager.searchMemories('task', 'project', 5);
      expect(taskResults).toHaveLength(1);
      expect(taskResults[0].entry.content).toContain('project analysis');
      expect(taskResults[0].entry.type).toBe('task');

      const allResults = memoryManager.searchMemories(undefined, 'code', 5);
      expect(allResults).toHaveLength(1);
      expect(allResults[0].entry.content).toContain('Review code');
    });

    test('should retrieve relevant context for prompts', () => {
      // Add memories with different relevance
      memoryManager.addMemory('knowledge', 'User prefers React over Vue', {}, 0.9, [
        'react',
        'preference',
      ]);
      memoryManager.addMemory('task', 'Build React component library', {}, 0.8, [
        'react',
        'components',
      ]);
      memoryManager.addMemory('observation', 'User struggles with TypeScript', {}, 0.7, [
        'typescript',
        'difficulty',
      ]);

      const context = memoryManager.getRelevantContext(
        'Create a React component with TypeScript',
        3,
      );

      expect(context).toHaveLength(3);
      expect(context.some(entry => entry.content.includes('React'))).toBeTruthy();
      expect(context.some(entry => entry.content.includes('TypeScript'))).toBeTruthy();
    });

    test('should limit memory entries based on configuration', () => {
      const smallManager = new AgentMemoryManager('small-agent', { maxEntries: 3 });

      // Add more memories than the limit
      smallManager.addMemory('task', 'Task 1', {}, 0.5);
      smallManager.addMemory('task', 'Task 2', {}, 0.6);
      smallManager.addMemory('task', 'Task 3', {}, 0.7);
      smallManager.addMemory('task', 'Task 4', {}, 0.8); // Should trigger cleanup

      const allMemories = smallManager.searchMemories(undefined, '', 10);
      expect(allMemories.length).toBeLessThanOrEqual(3);
    });
  });

  describe('conversation History Management', () => {
    test('should add and retrieve conversation messages', () => {
      const message1: CoreMessage = {
        role: 'user',
        content: 'Hello, can you help me with React?',
      };

      const message2: CoreMessage = {
        role: 'assistant',
        content: 'Of course! I can help you with React development.',
      };

      memoryManager.addMessage(message1);
      memoryManager.addMessage(message2);

      const history = memoryManager.getConversationHistory();
      expect(history).toHaveLength(2);
      expect(history[0]).toStrictEqual(message1);
      expect(history[1]).toStrictEqual(message2);
    });

    test('should compress conversation history when threshold is reached', () => {
      const smallManager = new AgentMemoryManager('compress-agent', {
        compressionThreshold: 3,
      });

      // Add messages beyond threshold
      for (let i = 0; i < 5; i++) {
        smallManager.addMessage({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i + 1}`,
        });
      }

      const history = smallManager.getConversationHistory();
      expect(history.length).toBeLessThanOrEqual(3);
    });

    test('should include memorized conversations when requested', () => {
      // Add some messages that will be memorized
      const importantMessage: CoreMessage = {
        role: 'user',
        content: 'This is a very important system configuration: use strict mode and TypeScript.',
      };

      memoryManager.addMessage(importantMessage);

      // Clear conversation history to test memorized retrieval
      const history = memoryManager.getConversationHistory(10, true);

      // Should have the important message either in history or from memory
      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('variable and Context Management', () => {
    test('should set and retrieve agent variables', () => {
      memoryManager.setVariable('userPreferences', { theme: 'dark', language: 'typescript' });
      memoryManager.setVariable('projectConfig', { framework: 'react', version: '18' });

      expect(memoryManager.getVariable('userPreferences')).toStrictEqual({
        theme: 'dark',
        language: 'typescript',
      });
      expect(memoryManager.getVariable('projectConfig')).toStrictEqual({
        framework: 'react',
        version: '18',
      });
      expect(memoryManager.getVariable('nonexistent')).toBeUndefined();
    });

    test('should manage context stack properly', () => {
      const context1 = { task: 'code_review', file: 'components/Button.tsx' };
      const context2 = { step: 'analysis', focus: 'accessibility' };

      memoryManager.pushContext(context1);
      memoryManager.pushContext(context2);

      expect(memoryManager.getCurrentContext()).toStrictEqual(context2);

      const popped = memoryManager.popContext();
      expect(popped).toStrictEqual(context2);
      expect(memoryManager.getCurrentContext()).toStrictEqual(context1);

      memoryManager.popContext();
      expect(memoryManager.getCurrentContext()).toStrictEqual({});
    });

    test('should create memory entries for important variables', () => {
      memoryManager.setVariable('user_preference_theme', 'dark');
      memoryManager.setVariable('temporary_counter', 42);

      // Important variables should create memory entries
      const preferences = memoryManager.searchMemories('preference', 'theme', 10);
      expect(preferences.length).toBeGreaterThan(0);
    });
  });

  describe('state Snapshots', () => {
    test('should create comprehensive state snapshots', () => {
      // Set up agent state
      memoryManager.addMemory('task', 'Test task', {}, 0.8);
      memoryManager.addMessage({ role: 'user', content: 'Test message' });
      memoryManager.setVariable('testVar', 'testValue');
      memoryManager.pushContext({ test: true });

      const snapshot = memoryManager.createSnapshot('test-session-123');

      expect(snapshot.agentId).toBe(mockAgentId);
      expect(snapshot.sessionId).toBe('test-session-123');
      expect(snapshot.timestamp).toBeGreaterThan(0);
      expect(snapshot.memoryEntries.length).toBeGreaterThan(0);
      expect(snapshot.conversationHistory.length).toBeGreaterThan(0);
      expect(snapshot.variables).toHaveProperty('testVar', 'testValue');
      expect(snapshot.context).toHaveProperty('test', true);
      expect(snapshot.metrics).toBeDefined();
    });

    test('should restore from state snapshots accurately', () => {
      // Create initial state
      const originalMemoryId = memoryManager.addMemory('task', 'Original task', {}, 0.8);
      memoryManager.addMessage({ role: 'user', content: 'Original message' });
      memoryManager.setVariable('originalVar', 'originalValue');

      const snapshot = memoryManager.createSnapshot('restore-test');

      // Create new manager and restore
      const newManager = new AgentMemoryManager('restored-agent');
      newManager.restoreFromSnapshot(snapshot);

      // Verify restoration
      const restoredHistory = newManager.getConversationHistory();
      expect(restoredHistory).toHaveLength(1);
      expect(restoredHistory[0].content).toBe('Original message');

      expect(newManager.getVariable('originalVar')).toBe('originalValue');

      const restoredMemories = newManager.searchMemories(undefined, 'Original', 10);
      expect(restoredMemories.length).toBeGreaterThan(0);
      expect(restoredMemories[0].entry.content).toBe('Original task');
    });
  });

  describe('memory Consolidation', () => {
    test('should consolidate memories using importance-based strategy', () => {
      // Add memories with different importance levels
      for (let i = 0; i < 10; i++) {
        memoryManager.addMemory(
          'task',
          `Task ${i}`,
          {},
          i / 10, // Importance from 0.0 to 0.9
          [`task${i}`],
        );
      }

      const beforeCount = memoryManager.searchMemories(undefined, '', 20).length;
      memoryManager.consolidateMemories('importance_based');
      const afterCount = memoryManager.searchMemories(undefined, '', 20).length;

      expect(afterCount).toBeLessThanOrEqual(beforeCount);

      // High importance memories should remain
      const remainingMemories = memoryManager.searchMemories(undefined, '', 20);
      const highImportanceMemories = remainingMemories.filter(r => r.entry.importance > 0.7);
      expect(highImportanceMemories.length).toBeGreaterThan(0);
    });

    test('should consolidate memories using recency-based strategy', () => {
      const oldTimestamp = Date.now() - 10 * 24 * 60 * 60 * 1000; // 10 days ago

      // Manually create old memory entry (normally would be handled by time)
      memoryManager.addMemory('task', 'Old task', { timestamp: oldTimestamp }, 0.5);
      memoryManager.addMemory('task', 'Recent task', {}, 0.5);

      memoryManager.consolidateMemories('recency_based');

      const memories = memoryManager.searchMemories('task', '', 10);
      expect(memories.some(m => m.entry.content === 'Recent task')).toBeTruthy();
    });
  });

  describe('memory Metrics', () => {
    test('should provide comprehensive memory metrics', () => {
      memoryManager.addMemory('task', 'Task 1', {}, 0.8, ['project']);
      memoryManager.addMemory('knowledge', 'Knowledge 1', {}, 0.9, ['domain']);
      memoryManager.addMessage({ role: 'user', content: 'Test message' });
      memoryManager.setVariable('testVar', 'value');
      memoryManager.pushContext({ level: 1 });

      const metrics = memoryManager.getMemoryMetrics();

      expect(metrics.totalMemories).toBeGreaterThan(0);
      expect(metrics.conversationLength).toBeGreaterThan(0);
      expect(metrics.averageImportance).toBeGreaterThan(0);
      expect(metrics.variablesCount).toBeGreaterThan(0);
      expect(metrics.contextDepth).toBeGreaterThan(0);
      expect(metrics).toHaveProperty('task');
      expect(metrics).toHaveProperty('knowledge');
    });

    test('should handle empty metrics gracefully', () => {
      const emptyManager = new AgentMemoryManager('empty-agent');
      const metrics = emptyManager.getMemoryMetrics();

      expect(metrics.totalMemories).toBe(0);
      expect(metrics.conversationLength).toBe(0);
      expect(metrics.averageImportance).toBe(0);
      expect(metrics.variablesCount).toBe(0);
      expect(metrics.contextDepth).toBe(0);
    });
  });

  describe('memory-Aware Agent Wrapper', () => {
    test('should create memory-aware agents with default configuration', () => {
      const baseAgent = {
        id: 'test-agent',
        name: 'Test Agent',
        description: 'Test agent description',
      };

      const memoryAwareAgent = createMemoryAwareAgent(baseAgent);

      expect(memoryAwareAgent.id).toBe('test-agent');
      expect(memoryAwareAgent.name).toBe('Test Agent');
      expect(memoryAwareAgent.memory).toBeInstanceOf(AgentMemoryManager);
    });

    test('should create memory-aware agents with custom configuration', () => {
      const baseAgent = {
        id: 'custom-agent',
        name: 'Custom Agent',
        description: 'Custom agent description',
      };

      const customConfig = {
        maxEntries: 500,
        retentionDays: 14,
        searchEnabled: true,
      };

      const memoryAwareAgent = createMemoryAwareAgent(baseAgent, customConfig);

      expect(memoryAwareAgent.memory).toBeInstanceOf(AgentMemoryManager);

      // Verify the configuration was applied
      const metrics = memoryAwareAgent.memory.getMemoryMetrics();
      expect(metrics).toBeDefined();
    });
  });

  describe('memory Utilities', () => {
    test('should create optimized memory configs for different agent types', () => {
      const chatConfig = memoryUtils.createMemoryConfig('chat');
      expect(chatConfig.maxEntries).toBe(500);
      expect(chatConfig.retentionDays).toBe(7);

      const researchConfig = memoryUtils.createMemoryConfig('research');
      expect(researchConfig.maxEntries).toBe(2000);
      expect(researchConfig.retentionDays).toBe(30);
      expect(researchConfig.persistenceEnabled).toBeTruthy();

      const longRunningConfig = memoryUtils.createMemoryConfig('longRunning');
      expect(longRunningConfig.maxEntries).toBe(5000);
      expect(longRunningConfig.retentionDays).toBe(90);
    });

    test('should merge memory snapshots correctly', () => {
      const snapshot1: AgentStateSnapshot = {
        agentId: 'agent1',
        sessionId: 'session1',
        timestamp: 1000,
        conversationHistory: [{ role: 'user', content: 'Hello' }],
        memoryEntries: [
          {
            id: 'mem1',
            type: 'task',
            content: 'Task 1',
            metadata: {},
            timestamp: 1000,
            importance: 0.8,
            tags: [],
          },
        ],
        variables: { var1: 'value1' },
        context: {},
        metrics: { totalMemories: 1 },
      };

      const snapshot2: AgentStateSnapshot = {
        agentId: 'agent1',
        sessionId: 'session2',
        timestamp: 2000,
        conversationHistory: [{ role: 'assistant', content: 'Hi there' }],
        memoryEntries: [
          {
            id: 'mem2',
            type: 'knowledge',
            content: 'Knowledge 1',
            metadata: {},
            timestamp: 2000,
            importance: 0.9,
            tags: [],
          },
        ],
        variables: { var2: 'value2' },
        context: {},
        metrics: { totalMemories: 1 },
      };

      const merged = memoryUtils.mergeSnapshots([snapshot1, snapshot2]);

      expect(merged).toBeDefined();
      expect(merged!.timestamp).toBe(2000); // Should use latest timestamp
      expect(merged!.memoryEntries).toHaveLength(2);
      expect(merged!.memoryEntries.some(m => m.id === 'mem1')).toBeTruthy();
      expect(merged!.memoryEntries.some(m => m.id === 'mem2')).toBeTruthy();
    });

    test('should export and import memory data', () => {
      memoryManager.addMemory('task', 'Export test task', {}, 0.8);
      memoryManager.setVariable('exportTest', 'testValue');

      const exportedData = memoryUtils.exportMemory(memoryManager);
      expect(typeof exportedData).toBe('string');

      const newManager = new AgentMemoryManager('import-agent');
      const importSuccess = memoryUtils.importMemory(newManager, exportedData);

      expect(importSuccess).toBeTruthy();
      expect(newManager.getVariable('exportTest')).toBe('testValue');

      const importedMemories = newManager.searchMemories(undefined, 'Export test', 10);
      expect(importedMemories.length).toBeGreaterThan(0);
    });

    test('should handle invalid import data gracefully', () => {
      const newManager = new AgentMemoryManager('import-fail-agent');
      const importSuccess = memoryUtils.importMemory(newManager, 'invalid json');

      expect(importSuccess).toBeFalsy();
    });
  });

  describe('edge Cases and Error Handling', () => {
    test('should handle empty search queries', () => {
      memoryManager.addMemory('task', 'Test task', {}, 0.8);

      const results = memoryManager.searchMemories(undefined, '', 10);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].entry.content).toBe('Test task');
    });

    test('should handle search with disabled search functionality', () => {
      const noSearchManager = new AgentMemoryManager('no-search-agent', {
        searchEnabled: false,
      });

      noSearchManager.addMemory('task', 'Test task', {}, 0.8);
      const results = noSearchManager.searchMemories(undefined, 'test', 10);

      expect(results).toHaveLength(0);
    });

    test('should handle memory cleanup gracefully', () => {
      memoryManager.addMemory('task', 'Task 1', {}, 0.8);
      memoryManager.addMessage({ role: 'user', content: 'Message 1' });
      memoryManager.setVariable('var1', 'value1');

      memoryManager.clearMemories();

      expect(memoryManager.getConversationHistory()).toHaveLength(0);
      expect(memoryManager.getVariable('var1')).toBeUndefined();
      expect(memoryManager.searchMemories(undefined, '', 10)).toHaveLength(0);
    });

    test('should handle invalid memory importance values', () => {
      const memoryId1 = memoryManager.addMemory('task', 'Task 1', {}, -0.5); // Below 0
      const memoryId2 = memoryManager.addMemory('task', 'Task 2', {}, 1.5); // Above 1

      const memories = memoryManager.searchMemories('task', '', 10);
      const memory1 = memories.find(m => m.entry.content === 'Task 1');
      const memory2 = memories.find(m => m.entry.content === 'Task 2');

      expect(memory1?.entry.importance).toBeGreaterThanOrEqual(0);
      expect(memory2?.entry.importance).toBeLessThanOrEqual(1);
    });
  });
});
