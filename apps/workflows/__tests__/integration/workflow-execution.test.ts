import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { WorkflowRegistry } from '@/lib/workflows/registry'
import { MemoryStore } from '@/lib/storage/memory-store'
import { WorkflowWebSocketServer } from '@/lib/realtime/websocket-server'
import { QStashClient } from '@/lib/qstash/client'
import { WorkflowDefinition, WorkflowExecution } from '@/types'
import { join } from 'path'

// Mock external dependencies only
vi.mock('@upstash/qstash', () => ({
  Client: vi.fn(() => ({
    publishJSON: vi.fn().mockResolvedValue({
      messageId: 'msg-123',
      url: 'http://localhost:3100/api/workflows/test/execute'
    })
  }))
}))

// Mock file system for registry
vi.mock('fs', () => ({
  readdirSync: vi.fn(),
  statSync: vi.fn()
}))

vi.mock('path', () => ({
  join: vi.fn((...args) => args.join('/')),
  extname: vi.fn((file) => file.split('.').pop() || ''),
  basename: vi.fn((file, ext) => {
    const name = file.split('/').pop() || ''
    return ext ? name.replace(ext, '') : name
  })
}))

// Mock WebSocket server dependencies
vi.mock('ws', () => ({
  WebSocketServer: vi.fn(() => ({
    on: vi.fn(),
    close: vi.fn((callback) => callback())
  })),
  WebSocket: {
    OPEN: 1,
    CLOSED: 3
  }
}))

vi.mock('http', () => ({
  createServer: vi.fn(() => ({
    listen: vi.fn((port, callback) => callback()),
    close: vi.fn((callback) => callback())
  }))
}))

// Integration tests - test components working together
describe('Workflow Integration Tests', () => {
  let registry: WorkflowRegistry
  let memoryStore: MemoryStore
  let wsServer: WorkflowWebSocketServer
  let qstashClient: QStashClient
  
  const originalEnv = process.env

  // Mock workflow handler
  const mockWorkflowHandler = vi.fn().mockResolvedValue({ result: 'success', userId: 'user123' })

  // Mock dynamic import for workflow loading
  const mockImport = vi.fn().mockImplementation((path) => {
    if (path.includes('workflow.ts')) {
      return Promise.resolve({
        default: {
          id: 'test-workflow',
          name: 'Test Integration Workflow',
          description: 'A workflow for integration testing',
          version: '1.0.0',
          category: 'test',
          tags: ['test', 'integration'],
          timeout: 30000,
          retries: 2,
          handler: mockWorkflowHandler
        }
      })
    }
    return Promise.reject(new Error(`Cannot find module ${path}`))
  })
  vi.stubGlobal('import', mockImport)

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Set up environment variables
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      QSTASH_TOKEN: 'test-token',
      VERCEL_URL: '',
    }

    // Set up file system mocks for registry
    const fs = await import('fs')
    const mockedFs = vi.mocked(fs)
    
    mockedFs.readdirSync.mockReturnValue([
      { name: 'workflow.ts', isDirectory: () => false, isFile: () => true }
    ] as any)
    
    mockedFs.statSync.mockReturnValue({
      isDirectory: () => true,
      mtime: new Date('2024-01-01')
    } as any)

    // Create real instances
    registry = new WorkflowRegistry('./test-workflows')
    memoryStore = new MemoryStore(1000, 100)
    wsServer = new WorkflowWebSocketServer(3102)
    qstashClient = new QStashClient()

    // Initialize registry
    await registry.initialize()
  })

  afterEach(async () => {
    process.env = originalEnv
    vi.clearAllTimers()
    
    // Clean up
    if (wsServer) {
      await wsServer.stop()
    }
    if (memoryStore) {
      memoryStore.clear()
    }
  })

  describe('registry and workflow loading integration', () => {
    it('should load and manage workflows successfully', async () => {
      // Verify workflow was loaded
      const workflows = registry.getWorkflows()
      expect(workflows).toHaveLength(1)
      expect(workflows[0]).toEqual({
        id: 'test-workflow',
        name: 'Test Integration Workflow',
        description: 'A workflow for integration testing',
        version: '1.0.0',
        category: 'test',
        tags: ['test', 'integration'],
        timeout: 30000,
        retries: 2,
        concurrency: 1,
        inputSchema: undefined,
        outputSchema: undefined,
        filePath: expect.stringContaining('test-workflow.ts'),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        lastModified: expect.any(Date),
      })

      // Test workflow execution through registry
      const result = await registry.executeWorkflow('test-workflow', { userId: 'user123' })
      expect(result).toEqual({ result: 'success', userId: 'user123' })
      expect(mockWorkflowHandler).toHaveBeenCalledWith({ userId: 'user123' })
    })

    it('should handle workflow search and filtering', async () => {
      const testWorkflows = registry.searchWorkflows('test')
      expect(testWorkflows).toHaveLength(1)
      expect(testWorkflows[0].id).toBe('test-workflow')

      const categoryWorkflows = registry.getWorkflowsByCategory('test')
      expect(categoryWorkflows).toHaveLength(1)

      const tagWorkflows = registry.getWorkflowsByTag('integration')
      expect(tagWorkflows).toHaveLength(1)

      const stats = registry.getStats()
      expect(stats.total).toBe(1)
      expect(stats.categories).toBe(1)
      expect(stats.tags).toBe(2)
    })
  })

  describe('memory store and execution tracking integration', () => {
    it('should track and manage workflow executions', async () => {
      const execution: WorkflowExecution = {
        id: 'exec-123',
        workflowId: 'test-workflow',
        status: 'running',
        input: { userId: 'user123' },
        startedAt: new Date(),
        steps: [],
        triggeredBy: 'manual',
        environment: 'test',
        version: '1.0.0',
        metrics: {},
      }

      // Store execution
      memoryStore.setExecution(execution)

      // Verify retrieval methods
      const retrieved = memoryStore.getExecution('exec-123')
      expect(retrieved).toEqual(execution)

      const byWorkflow = memoryStore.getExecutionsByWorkflow('test-workflow')
      expect(byWorkflow).toContain(execution)

      const byStatus = memoryStore.getExecutionsByStatus('running')
      expect(byStatus).toContain(execution)

      // Test search functionality
      const searchResult = memoryStore.searchExecutions({
        workflowId: 'test-workflow',
        status: 'running'
      })
      expect(searchResult.executions).toContain(execution)
      expect(searchResult.total).toBe(1)

      // Complete execution and verify state change
      const completedExecution = { 
        ...execution, 
        status: 'completed' as const,
        output: { result: 'success' },
        completedAt: new Date(),
        duration: 1500
      }
      memoryStore.setExecution(completedExecution)

      const runningExecutions = memoryStore.getExecutionsByStatus('running')
      const completedExecutions = memoryStore.getExecutionsByStatus('completed')
      
      expect(runningExecutions).toHaveLength(0)
      expect(completedExecutions).toContain(completedExecution)
    })

    it('should track execution statistics and metrics', async () => {
      // Add multiple executions
      const executions = [
        {
          id: 'exec-1',
          workflowId: 'test-workflow',
          status: 'completed' as const,
          input: {},
          startedAt: new Date(),
          completedAt: new Date(),
          duration: 1000,
          steps: [],
          triggeredBy: 'manual' as const,
          environment: 'test',
          version: '1.0.0',
          metrics: {},
        },
        {
          id: 'exec-2',
          workflowId: 'test-workflow',
          status: 'completed' as const,
          input: {},
          startedAt: new Date(),
          completedAt: new Date(),
          duration: 2000,
          steps: [],
          triggeredBy: 'manual' as const,
          environment: 'test',
          version: '1.0.0',
          metrics: {},
        },
        {
          id: 'exec-3',
          workflowId: 'test-workflow',
          status: 'failed' as const,
          input: {},
          startedAt: new Date(),
          steps: [],
          triggeredBy: 'manual' as const,
          environment: 'test',
          version: '1.0.0',
          metrics: {},
        }
      ]

      executions.forEach(exec => memoryStore.setExecution(exec))

      const stats = memoryStore.getStats()
      expect(stats.executions.total).toBe(3)
      expect(stats.executions.byStatus.completed).toBe(2)
      expect(stats.executions.byStatus.failed).toBe(1)
      expect(stats.performance.averageExecutionTime).toBe(1500) // (1000 + 2000) / 2
      expect(stats.performance.successRate).toBeCloseTo(66.67, 1) // 2/3 * 100

      const recentActivity = memoryStore.getRecentActivity(5)
      expect(recentActivity).toHaveLength(3)
    })

    it('should handle memory constraints properly', async () => {
      const smallStore = new MemoryStore(3, 3) // Small capacity
      
      // Add executions beyond capacity
      for (let i = 0; i < 5; i++) {
        const execution: WorkflowExecution = {
          id: `exec-${i}`,
          workflowId: 'test-workflow',
          status: 'completed',
          input: { iteration: i },
          startedAt: new Date(Date.now() + i * 1000), // Different timestamps
          steps: [],
          triggeredBy: 'manual',
          environment: 'test',
          version: '1.0.0',
          metrics: {},
        }
        smallStore.setExecution(execution)
      }

      const allExecutions = smallStore.getAllExecutions()
      expect(allExecutions.length).toBeLessThanOrEqual(3) // Should respect capacity
      
      // Should keep most recent
      const executionIds = allExecutions.map(e => e.id)
      expect(executionIds).toContain('exec-4')
      expect(executionIds).toContain('exec-3')
      expect(executionIds).toContain('exec-2')
    })
  })

  describe('qstash client integration', () => {
    it('should execute workflow via QStash and track in memory', async () => {
      const input = { userId: 'user123', async: true }
      const options = { timeout: 60000, retries: 3 }

      const result = await qstashClient.executeWorkflow('test-workflow', input, options)

      expect(result.executionId).toMatch(/^exec_\d+_[a-z0-9]+$/)
      expect(result.messageId).toBe('msg-123')

      // Verify execution was stored in memory
      const execution = memoryStore.getExecution(result.executionId)
      expect(execution).toBeDefined()
      expect(execution?.status).toBe('running')
      expect(execution?.input).toEqual(input)
      expect(execution?.workflowId).toBe('test-workflow')
    })

    it('should handle QStash queue statistics', async () => {
      // Add some test executions to simulate queue state
      const executions = [
        { id: 'exec-1', status: 'pending' as const },
        { id: 'exec-2', status: 'running' as const },
        { id: 'exec-3', status: 'completed' as const },
        { id: 'exec-4', status: 'failed' as const },
      ]

      executions.forEach(({ id, status }) => {
        memoryStore.setExecution({
          id,
          workflowId: 'test-workflow',
          status,
          input: {},
          startedAt: new Date(),
          steps: [],
          triggeredBy: 'manual',
          environment: 'test',
          version: '1.0.0',
          metrics: {},
        })
      })

      const queueStats = await qstashClient.getQueueStats()
      
      // Should calculate from memory store
      expect(queueStats.pendingMessages).toBe(2) // pending + running
      expect(queueStats.dlqMessages).toBe(1) // failed
      expect(queueStats.totalProcessed).toBe(1) // completed
    })
  })

  describe('websocket server integration', () => {
    it('should start and stop WebSocket server', async () => {
      await wsServer.start()
      
      expect(wsServer.getConnectedClients()).toBe(0) // No clients connected in test
      
      await wsServer.stop()
    })

    it('should handle client information and metrics', async () => {
      await wsServer.start()
      
      const clientInfo = wsServer.getClientInfo()
      expect(Array.isArray(clientInfo)).toBe(true)
      
      const connectedClients = wsServer.getConnectedClients()
      expect(typeof connectedClients).toBe('number')
      expect(connectedClients).toBeGreaterThanOrEqual(0)
      
      await wsServer.stop()
    })
  })

  describe('cross-component integration scenarios', () => {
    it('should coordinate workflow execution across all components', async () => {
      // Start WebSocket server
      await wsServer.start()

      // Get workflow from registry
      const workflow = registry.getWorkflow('test-workflow')
      expect(workflow).toBeDefined()

      // Create execution and store in memory
      const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const execution: WorkflowExecution = {
        id: executionId,
        workflowId: 'test-workflow',
        status: 'running',
        input: { userId: 'user123' },
        startedAt: new Date(),
        steps: [],
        triggeredBy: 'manual',
        environment: 'test',
        version: '1.0.0',
        metrics: {},
      }

      memoryStore.setExecution(execution)

      // Simulate workflow completion
      const output = await registry.executeWorkflow('test-workflow', execution.input)
      
      // Update execution with completion
      const completedExecution = {
        ...execution,
        status: 'completed' as const,
        output,
        completedAt: new Date(),
        duration: 1500
      }
      memoryStore.setExecution(completedExecution)

      // Verify final state
      const finalExecution = memoryStore.getExecution(executionId)
      expect(finalExecution?.status).toBe('completed')
      expect(finalExecution?.output).toEqual(output)

      const stats = memoryStore.getStats()
      expect(stats.executions.byStatus.completed).toBe(1)

      await wsServer.stop()
    })

    it('should handle error scenarios across components', async () => {
      // Make workflow handler fail
      mockWorkflowHandler.mockRejectedValueOnce(new Error('Workflow execution failed'))

      const execution: WorkflowExecution = {
        id: 'exec-error-test',
        workflowId: 'test-workflow',
        status: 'running',
        input: { test: 'error' },
        startedAt: new Date(),
        steps: [],
        triggeredBy: 'manual',
        environment: 'test',
        version: '1.0.0',
        metrics: {},
      }

      memoryStore.setExecution(execution)

      // Try to execute workflow (should fail)
      await expect(
        registry.executeWorkflow('test-workflow', execution.input)
      ).rejects.toThrow('Workflow execution failed')

      // Update execution with error
      const errorExecution = {
        ...execution,
        status: 'failed' as const,
        error: 'Workflow execution failed',
        completedAt: new Date(),
        duration: 500
      }
      memoryStore.setExecution(errorExecution)

      // Verify error tracking
      const failedExecution = memoryStore.getExecution('exec-error-test')
      expect(failedExecution?.status).toBe('failed')
      expect(failedExecution?.error).toBe('Workflow execution failed')

      const failedExecutions = memoryStore.getExecutionsByStatus('failed')
      expect(failedExecutions).toContain(failedExecution)
    })

    it('should maintain data consistency across operations', async () => {
      // Complex scenario: multiple workflows, executions, and state changes
      
      // 1. Load multiple workflow definitions
      const fs = await import('fs')
      const mockedFs = vi.mocked(fs)
      
      mockedFs.readdirSync.mockReturnValue([
        { name: 'test-workflow.ts', isDirectory: () => false },
        { name: 'email-workflow.ts', isDirectory: () => false }
      ] as any)

      mockImport
        .mockResolvedValueOnce({
          default: {
            id: 'test-workflow',
            name: 'Test Workflow',
            handler: vi.fn().mockResolvedValue({ result: 'test-success' })
          }
        })
        .mockResolvedValueOnce({
          default: {
            id: 'email-workflow',
            name: 'Email Workflow',
            handler: vi.fn().mockResolvedValue({ sent: true })
          }
        })

      const multiRegistry = new WorkflowRegistry('./multi-workflows')
      await multiRegistry.initialize()

      // 2. Execute multiple workflows
      const executions: WorkflowExecution[] = []
      for (let i = 0; i < 5; i++) {
        const workflowId = i % 2 === 0 ? 'test-workflow' : 'email-workflow'
        const execution: WorkflowExecution = {
          id: `exec-${i}`,
          workflowId,
          status: 'completed',
          input: { iteration: i },
          startedAt: new Date(Date.now() + i * 1000),
          completedAt: new Date(Date.now() + i * 1000 + 500),
          duration: 500,
          steps: [],
          triggeredBy: 'manual',
          environment: 'test',
          version: '1.0.0',
          metrics: {},
        }
        executions.push(execution)
        memoryStore.setExecution(execution)
      }

      // 3. Verify data consistency across different access patterns
      const allExecutions = memoryStore.getAllExecutions()
      expect(allExecutions).toHaveLength(5)

      const testWorkflowExecutions = memoryStore.getExecutionsByWorkflow('test-workflow')
      const emailWorkflowExecutions = memoryStore.getExecutionsByWorkflow('email-workflow')
      
      expect(testWorkflowExecutions.length + emailWorkflowExecutions.length).toBe(5)

      const searchResults = memoryStore.searchExecutions({ limit: 10 })
      expect(searchResults.total).toBe(5)
      expect(searchResults.executions).toHaveLength(5)

      // 4. Verify statistics consistency
      const stats = memoryStore.getStats()
      expect(stats.executions.total).toBe(5)
      expect(stats.executions.byWorkflow['test-workflow']).toBe(3) // 0, 2, 4
      expect(stats.executions.byWorkflow['email-workflow']).toBe(2) // 1, 3
      expect(stats.performance.successRate).toBe(100)
    })
  })
})