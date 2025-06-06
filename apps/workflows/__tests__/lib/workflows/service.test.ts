import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { WorkflowService } from '@/lib/workflows/service'
import { WorkflowDefinition, WorkflowExecution, WorkflowStatus } from '@/types'

// Mock all dependencies
vi.mock('@/lib/workflows/registry')
vi.mock('@/lib/providers/provider-manager')
vi.mock('@/lib/steps/step-registry')
vi.mock('@/lib/storage/memory-store')
vi.mock('@/lib/realtime/websocket-server')

// Import after mocks are set up
import { workflowRegistry } from '@/lib/workflows/registry'
import { providerManager } from '@/lib/providers/provider-manager'
import { stepRegistry } from '@/lib/steps/step-registry'
import { memoryStore } from '@/lib/storage/memory-store'
import { wsServer } from '@/lib/realtime/websocket-server'

describe('WorkflowService', () => {
  let service: WorkflowService
  const originalEnv = process.env

  // Create mocked instances
  const mockedRegistry = vi.mocked(workflowRegistry)
  const mockedProviderManager = vi.mocked(providerManager)
  const mockedStepRegistry = vi.mocked(stepRegistry)
  const mockedMemoryStore = vi.mocked(memoryStore)
  const mockedWsServer = vi.mocked(wsServer)

  // Mock workflow definition
  const mockWorkflow: WorkflowDefinition = {
    id: 'test-workflow',
    name: 'Test Workflow',
    description: 'A test workflow',
    version: '1.0.0',
    category: 'test',
    tags: ['test', 'example'],
    author: 'Test Author',
    timeout: 30000,
    retries: 2,
    concurrency: 1,
    filePath: '/path/to/workflow.ts',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastModified: new Date(),
  }

  // Mock execution
  const mockExecution: WorkflowExecution = {
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

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Set up environment variables
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
    }

    // Setup default mocks
    mockedRegistry.initialize.mockResolvedValue(undefined)
    mockedRegistry.getWorkflows.mockReturnValue([mockWorkflow])
    mockedRegistry.getWorkflow.mockReturnValue(mockWorkflow)
    mockedRegistry.searchWorkflows.mockReturnValue([mockWorkflow])
    mockedRegistry.getWorkflowsByCategory.mockReturnValue([mockWorkflow])
    mockedRegistry.getWorkflowsByTag.mockReturnValue([mockWorkflow])
    mockedRegistry.getCategories.mockReturnValue(['test'])
    mockedRegistry.getTags.mockReturnValue(['test', 'example'])
    mockedRegistry.executeWorkflow.mockResolvedValue({ result: 'success' })

    mockedProviderManager.initialize.mockResolvedValue(undefined)
    mockedProviderManager.executeWorkflow.mockResolvedValue({
      executionId: 'exec-123',
      messageId: 'msg-456',
      provider: 'qstash'
    })
    mockedProviderManager.scheduleWorkflow.mockResolvedValue({
      scheduleId: 'sched-789',
      provider: 'qstash'
    })
    mockedProviderManager.cancelWorkflow.mockResolvedValue(undefined)
    mockedProviderManager.getAggregatedStats.mockResolvedValue({
      byProvider: {
        qstash: {
          pendingMessages: 0,
          dlqMessages: 0,
          totalProcessed: 10
        }
      },
      total: {
        pendingMessages: 0,
        dlqMessages: 0,
        totalProcessed: 10
      }
    })
    mockedProviderManager.healthCheck.mockResolvedValue({
      overall: true,
      providers: { qstash: true, local: true }
    })
    mockedProviderManager.getAvailableProviders.mockReturnValue(['qstash', 'local'])
    mockedProviderManager.getProviderCapabilities.mockReturnValue({
      qstash: { supportsScheduling: true, supportsRetries: true },
      local: { supportsScheduling: true, supportsRetries: true }
    })
    mockedProviderManager.getDefaultProvider.mockReturnValue(null)

    mockedStepRegistry.registerMultiple.mockReturnValue(undefined)
    mockedStepRegistry.getAllSteps.mockReturnValue([])
    mockedStepRegistry.getStepsByCategory.mockReturnValue([])
    mockedStepRegistry.searchSteps.mockReturnValue([])
    mockedStepRegistry.getStats.mockReturnValue({
      total: 0,
      categories: 0,
      tags: 0,
      byCategory: {},
      byTag: {}
    })

    mockedMemoryStore.getExecution.mockReturnValue(mockExecution)
    mockedMemoryStore.setExecution.mockReturnValue(undefined)
    mockedMemoryStore.getExecutionsByWorkflow.mockReturnValue([mockExecution])
    mockedMemoryStore.getExecutionsByStatus.mockReturnValue([mockExecution])
    mockedMemoryStore.searchExecutions.mockReturnValue({
      executions: [mockExecution],
      total: 1
    })
    mockedMemoryStore.getStats.mockReturnValue({
      executions: {
        total: 10,
        byStatus: {
          pending: 1,
          running: 2,
          completed: 6,
          failed: 1,
          cancelled: 0
        },
        byWorkflow: {
          'test-workflow': 10
        }
      },
      performance: {
        averageExecutionTime: 1500,
        successRate: 70,
        throughput: 10
      },
      memory: {
        used: 10,
        available: 90,
        percentage: 10
      }
    })
    mockedMemoryStore.getRecentActivity.mockReturnValue([{
      executionId: 'exec-123',
      workflowId: 'test-workflow',
      status: 'completed',
      timestamp: new Date()
    }])
    mockedMemoryStore.healthCheck.mockReturnValue({
      healthy: true,
      stats: {} as any,
      issues: []
    })

    mockedWsServer.broadcastWorkflowEvent.mockReturnValue(undefined)
    mockedWsServer.getConnectedClients.mockReturnValue(2)
    mockedWsServer.getClientInfo.mockReturnValue([])

    service = new WorkflowService()
  })

  afterEach(() => {
    process.env = originalEnv
    vi.clearAllTimers()
  })

  describe('initialization', () => {
    it('should initialize successfully', () => {
      expect(service).toBeDefined()
      expect(mockedRegistry.initialize).toHaveBeenCalled()
    })

    it('should handle registry initialization errors gracefully', async () => {
      mockedRegistry.initialize.mockRejectedValueOnce(new Error('Registry init failed'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const service = new WorkflowService()
      
      // Use vi.waitFor to wait for the console.error to be called
      await vi.waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to initialize workflow service:',
          expect.any(Error)
        )
      }, { timeout: 1000 })
    })
  })

  describe('workflow discovery and management', () => {
    it('should get all workflows', async () => {
      const workflows = await service.getWorkflows()
      
      expect(workflows).toEqual([mockWorkflow])
      expect(mockedRegistry.getWorkflows).toHaveBeenCalled()
    })

    it('should get workflow by ID', async () => {
      const workflow = await service.getWorkflow('test-workflow')
      
      expect(workflow).toEqual(mockWorkflow)
      expect(mockedRegistry.getWorkflow).toHaveBeenCalledWith('test-workflow')
    })

    it('should search workflows', async () => {
      const results = await service.searchWorkflows('test')
      
      expect(results).toEqual([mockWorkflow])
      expect(mockedRegistry.searchWorkflows).toHaveBeenCalledWith('test')
    })

    it('should get workflows by category', async () => {
      const workflows = await service.getWorkflowsByCategory('test')
      
      expect(workflows).toEqual([mockWorkflow])
      expect(mockedRegistry.getWorkflowsByCategory).toHaveBeenCalledWith('test')
    })

    it('should get workflows by tag', async () => {
      const workflows = await service.getWorkflowsByTag('example')
      
      expect(workflows).toEqual([mockWorkflow])
      expect(mockedRegistry.getWorkflowsByTag).toHaveBeenCalledWith('example')
    })
  })

  describe('workflow execution', () => {
    it('should execute workflow asynchronously', async () => {
      const input = { userId: 'user123' }
      const options = { timeout: 60000, retries: 3 }

      const result = await service.executeWorkflow('test-workflow', input, { type: 'manual', payload: {}, triggeredBy: 'test' }, options)

      expect(result).toEqual({
        executionId: 'exec-123',
        status: 'pending',
        context: expect.objectContaining({
          executionId: expect.stringMatching(/^exec_\d+_[a-z0-9]+$/),
          workflowId: 'test-workflow',
          input: input,
          status: 'running'
        })
      })

      expect(mockedProviderManager.executeWorkflow).toHaveBeenCalledWith('test-workflow', input, {
        timeout: 60000,
        retries: 3,
        delay: undefined,
        priority: undefined,
        tags: undefined,
        metadata: {
          executionId: expect.stringMatching(/^exec_\d+_[a-z0-9]+$/)
        },
        provider: undefined
      })
    })

    it('should use workflow defaults when options not provided', async () => {
      const input = { userId: 'user123' }

      await service.executeWorkflow('test-workflow', input, { type: 'manual', payload: {}, triggeredBy: 'test' })

      expect(mockedProviderManager.executeWorkflow).toHaveBeenCalledWith('test-workflow', input, {
        timeout: 30000, // from mockWorkflow.timeout
        retries: 2,     // from mockWorkflow.retries
        delay: undefined,
        priority: undefined,
        tags: undefined,
        metadata: {
          executionId: expect.stringMatching(/^exec_\d+_[a-z0-9]+$/)
        },
        provider: undefined
      })
    })

    it('should throw error for non-existent workflow', async () => {
      mockedRegistry.getWorkflow.mockReturnValueOnce(undefined)

      await expect(
        service.executeWorkflow('non-existent', {}, { type: 'manual', payload: {}, triggeredBy: 'test' })
      ).rejects.toThrow('Workflow not found: non-existent')
    })

    it('should handle execution errors', async () => {
      const error = new Error('Provider execution failed')
      mockedProviderManager.executeWorkflow.mockRejectedValueOnce(error)

      await expect(
        service.executeWorkflow('test-workflow', {}, { type: 'manual', payload: {}, triggeredBy: 'test' })
      ).rejects.toThrow('Provider execution failed')
    })
  })

  describe('synchronous workflow execution', () => {
    it('should execute workflow synchronously and succeed', async () => {
      const input = { userId: 'user123' }
      const output = { result: 'success' }
      
      mockedRegistry.executeWorkflow.mockResolvedValueOnce(output)

      const execution = await service.executeWorkflowSync('test-workflow', input)

      expect(execution.status).toBe('completed')
      expect(execution.output).toEqual(output)
      expect(execution.workflowId).toBe('test-workflow')
      expect(execution.input).toEqual(input)
      expect(execution.triggeredBy).toBe('sync')
      expect(execution.duration).toBeTypeOf('number')

      // Verify workflow started event was broadcast
      expect(mockedWsServer.broadcastWorkflowEvent).toHaveBeenCalledWith({
        type: 'workflow-started',
        workflowId: 'test-workflow',
        executionId: expect.stringMatching(/^exec_\d+_[a-z0-9]+$/),
        timestamp: expect.any(Date),
        data: { input, sync: true }
      })

      // Verify workflow completed event was broadcast
      expect(mockedWsServer.broadcastWorkflowEvent).toHaveBeenCalledWith({
        type: 'workflow-completed',
        workflowId: 'test-workflow',
        executionId: expect.stringMatching(/^exec_\d+_[a-z0-9]+$/),
        timestamp: expect.any(Date),
        data: { output, duration: expect.any(Number) }
      })

      // Verify execution was stored (twice: start and completion)
      expect(mockedMemoryStore.setExecution).toHaveBeenCalledTimes(2)
    })

    it('should handle synchronous execution failure', async () => {
      const input = { userId: 'user123' }
      const error = new Error('Workflow execution failed')
      
      mockedRegistry.executeWorkflow.mockRejectedValueOnce(error)

      await expect(
        service.executeWorkflowSync('test-workflow', input)
      ).rejects.toThrow('Workflow execution failed')

      // Verify workflow failed event was broadcast
      expect(mockedWsServer.broadcastWorkflowEvent).toHaveBeenCalledWith({
        type: 'workflow-failed',
        workflowId: 'test-workflow',
        executionId: expect.stringMatching(/^exec_\d+_[a-z0-9]+$/),
        timestamp: expect.any(Date),
        data: { error: 'Workflow execution failed', duration: expect.any(Number) }
      })

      // Verify execution was stored with error
      expect(mockedMemoryStore.setExecution).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed',
          error: 'Workflow execution failed'
        })
      )
    })

    it('should throw error for non-existent workflow in sync execution', async () => {
      mockedRegistry.getWorkflow.mockReturnValueOnce(undefined)

      await expect(
        service.executeWorkflowSync('non-existent', {})
      ).rejects.toThrow('Workflow not found: non-existent')
    })
  })

  describe('workflow scheduling', () => {
    it('should schedule workflow successfully', async () => {
      const input = { userId: 'user123' }
      const options = {
        cron: '0 0 * * *',
        timeout: 60000,
        retries: 3
      }

      const result = await service.scheduleWorkflow('test-workflow', input, options)

      expect(result).toEqual({ scheduleId: 'sched-789' })
      expect(mockedProviderManager.scheduleWorkflow).toHaveBeenCalledWith('test-workflow', input, {
        cron: '0 0 * * *',
        timezone: undefined,
        enabled: undefined,
        timeout: 60000,
        retries: 3,
        delay: undefined,
        priority: undefined,
        tags: undefined,
        metadata: undefined,
        provider: undefined
      })
    })

    it('should use workflow defaults for scheduling options', async () => {
      const input = { userId: 'user123' }
      const options = { cron: '0 0 * * *' }

      await service.scheduleWorkflow('test-workflow', input, options)

      expect(mockedProviderManager.scheduleWorkflow).toHaveBeenCalledWith('test-workflow', input, {
        cron: '0 0 * * *',
        timezone: undefined,
        enabled: undefined,
        timeout: 30000, // from mockWorkflow.timeout
        retries: 2,     // from mockWorkflow.retries
        delay: undefined,
        priority: undefined,
        tags: undefined,
        metadata: undefined,
        provider: undefined
      })
    })

    it('should throw error when scheduling non-existent workflow', async () => {
      mockedRegistry.getWorkflow.mockReturnValueOnce(undefined)

      await expect(
        service.scheduleWorkflow('non-existent', {}, { cron: '0 0 * * *' })
      ).rejects.toThrow('Workflow not found: non-existent')
    })

    it('should handle scheduling errors', async () => {
      const error = new Error('Scheduling failed')
      mockedProviderManager.scheduleWorkflow.mockRejectedValueOnce(error)

      await expect(
        service.scheduleWorkflow('test-workflow', {}, { cron: '0 0 * * *' })
      ).rejects.toThrow('Scheduling failed')
    })
  })

  describe('execution management', () => {
    it('should get execution by ID', async () => {
      const execution = await service.getExecution('exec-123')
      
      expect(execution).toEqual(mockExecution)
      expect(mockedMemoryStore.getExecution).toHaveBeenCalledWith('exec-123')
    })

    it('should get executions with search options', async () => {
      const options = {
        workflowId: 'test-workflow',
        status: 'completed' as WorkflowStatus,
        limit: 10,
        offset: 0
      }

      const result = await service.getExecutions(options)

      expect(result).toEqual({
        executions: [mockExecution],
        total: 1
      })
      expect(mockedMemoryStore.searchExecutions).toHaveBeenCalledWith(options)
    })

    it('should get executions by workflow ID', async () => {
      const executions = await service.getExecutionsByWorkflow('test-workflow')
      
      expect(executions).toEqual([mockExecution])
      expect(mockedMemoryStore.getExecutionsByWorkflow).toHaveBeenCalledWith('test-workflow')
    })

    it('should get executions by status', async () => {
      const executions = await service.getExecutionsByStatus('running')
      
      expect(executions).toEqual([mockExecution])
      expect(mockedMemoryStore.getExecutionsByStatus).toHaveBeenCalledWith('running')
    })
  })

  describe('execution cancellation', () => {
    it('should cancel running execution', async () => {
      const runningExecution = { ...mockExecution, status: 'running' as WorkflowStatus }
      mockedMemoryStore.getExecution.mockReturnValueOnce(runningExecution)

      await service.cancelExecution('exec-123')

      expect(mockedProviderManager.cancelWorkflow).toHaveBeenCalledWith('exec-123')
    })

    it('should throw error for non-existent execution', async () => {
      mockedMemoryStore.getExecution.mockReturnValueOnce(undefined)

      await expect(
        service.cancelExecution('non-existent')
      ).rejects.toThrow('Execution not found: non-existent')
    })

    it('should throw error when trying to cancel completed execution', async () => {
      const completedExecution = { ...mockExecution, status: 'completed' as WorkflowStatus }
      mockedMemoryStore.getExecution.mockReturnValueOnce(completedExecution)

      await expect(
        service.cancelExecution('exec-123')
      ).rejects.toThrow('Cannot cancel execution in status: completed')
    })

    it('should throw error when trying to cancel failed execution', async () => {
      const failedExecution = { ...mockExecution, status: 'failed' as WorkflowStatus }
      mockedMemoryStore.getExecution.mockReturnValueOnce(failedExecution)

      await expect(
        service.cancelExecution('exec-123')
      ).rejects.toThrow('Cannot cancel execution in status: failed')
    })

    it('should handle cancellation errors', async () => {
      const error = new Error('Cancellation failed')
      mockedProviderManager.cancelWorkflow.mockRejectedValueOnce(error)

      await expect(
        service.cancelExecution('exec-123')
      ).rejects.toThrow('Cancellation failed')
    })
  })

  describe('analytics and monitoring', () => {
    it('should get comprehensive workflow statistics', async () => {
      const stats = await service.getWorkflowStats()

      expect(stats).toEqual({
        totalWorkflows: 1,
        totalExecutions: 10,
        activeExecutions: 3, // pending + running (1 + 2)
        successRate: 70,
        averageExecutionTime: 1500,
        executionsByStatus: {
          pending: 1,
          running: 2,
          completed: 6,
          failed: 1,
          cancelled: 0
        },
        executionsByWorkflow: {
          'test-workflow': 10
        },
        categories: ['test'],
        tags: ['test', 'example']
      })
    })

    it('should get recent activity', async () => {
      const activity = await service.getRecentActivity(20)

      expect(activity).toEqual([{
        executionId: 'exec-123',
        workflowId: 'test-workflow',
        status: 'completed',
        timestamp: expect.any(Date)
      }])
      expect(mockedMemoryStore.getRecentActivity).toHaveBeenCalledWith(20)
    })

    it('should get recent activity with default limit', async () => {
      await service.getRecentActivity()

      expect(mockedMemoryStore.getRecentActivity).toHaveBeenCalledWith(50)
    })

    it('should get comprehensive system metrics', async () => {
      const metrics = await service.getMetrics()

      expect(metrics).toEqual({
        system: {
          uptime: expect.any(Number),
          memory: expect.any(Object),
          cpu: expect.any(Object)
        },
        store: expect.any(Object),
        providers: {
          byProvider: {
            qstash: {
              pendingMessages: 0,
              dlqMessages: 0,
              totalProcessed: 10
            }
          },
          total: {
            pendingMessages: 0,
            dlqMessages: 0,
            totalProcessed: 10
          }
        },
        websocket: {
          connectedClients: 2,
          clients: []
        }
      })

      expect(mockedMemoryStore.getStats).toHaveBeenCalled()
      expect(mockedProviderManager.getAggregatedStats).toHaveBeenCalled()
      expect(mockedWsServer.getConnectedClients).toHaveBeenCalled()
      expect(mockedWsServer.getClientInfo).toHaveBeenCalled()
    })
  })

  describe('health check', () => {
    it('should return healthy status when all services are healthy', async () => {
      const health = await service.healthCheck()

      expect(health).toEqual({
        healthy: true,
        services: {
          registry: true,
          store: true,
          providers: true,
          websocket: true
        },
        issues: []
      })
    })

    it('should return unhealthy status when store has issues', async () => {
      mockedMemoryStore.healthCheck.mockReturnValueOnce({
        healthy: false,
        stats: {} as any,
        issues: ['Memory usage is high']
      })

      const health = await service.healthCheck()

      expect(health.healthy).toBe(false)
      expect(health.services.store).toBe(false)
      expect(health.issues).toContain('Memory usage is high')
    })

    it('should return unhealthy status when providers are down', async () => {
      mockedProviderManager.healthCheck.mockResolvedValueOnce({
        overall: false,
        providers: { qstash: false, local: true }
      })

      const health = await service.healthCheck()

      expect(health.healthy).toBe(false)
      expect(health.services.providers).toBe(false)
      expect(health.issues).toContain('Provider qstash is unhealthy')
    })

    it('should handle provider connectivity errors', async () => {
      mockedProviderManager.healthCheck.mockResolvedValueOnce({
        overall: false,
        providers: { qstash: false, local: false }
      })

      const health = await service.healthCheck()

      expect(health.healthy).toBe(false)
      expect(health.services.providers).toBe(false)
      expect(health.issues).toContain('Provider qstash is unhealthy')
      expect(health.issues).toContain('Provider local is unhealthy')
    })
  })

  describe('utility methods', () => {
    it('should validate workflow input', async () => {
      const input = { userId: 'user123' }
      
      const result = await service.validateWorkflowInput('test-workflow', input)

      expect(result).toEqual({
        valid: true,
        errors: []
      })
    })

    it('should return invalid for non-existent workflow', async () => {
      mockedRegistry.getWorkflow.mockReturnValueOnce(undefined)

      const result = await service.validateWorkflowInput('non-existent', {})

      expect(result).toEqual({
        valid: false,
        errors: ['Workflow not found']
      })
    })

    it('should estimate execution time based on historical data', async () => {
      const executions = [
        { ...mockExecution, status: 'completed' as WorkflowStatus, duration: 1000 },
        { ...mockExecution, status: 'completed' as WorkflowStatus, duration: 2000 },
        { ...mockExecution, status: 'running' as WorkflowStatus } // Should be ignored
      ]
      mockedMemoryStore.getExecutionsByWorkflow.mockReturnValueOnce(executions)

      const estimatedTime = await service.estimateExecutionTime('test-workflow')

      expect(estimatedTime).toBe(1500) // Average of 1000 and 2000
    })

    it('should return 0 for execution time when no historical data', async () => {
      mockedMemoryStore.getExecutionsByWorkflow.mockReturnValueOnce([])

      const estimatedTime = await service.estimateExecutionTime('test-workflow')

      expect(estimatedTime).toBe(0)
    })

    it('should calculate workflow success rate', async () => {
      const executions = [
        { ...mockExecution, status: 'completed' as WorkflowStatus },
        { ...mockExecution, status: 'completed' as WorkflowStatus },
        { ...mockExecution, status: 'failed' as WorkflowStatus },
        { ...mockExecution, status: 'running' as WorkflowStatus }
      ]
      mockedMemoryStore.getExecutionsByWorkflow.mockReturnValueOnce(executions)

      const successRate = await service.getWorkflowSuccessRate('test-workflow')

      expect(successRate).toBe(50) // 2 completed out of 4 total
    })

    it('should return 0 success rate when no executions', async () => {
      mockedMemoryStore.getExecutionsByWorkflow.mockReturnValueOnce([])

      const successRate = await service.getWorkflowSuccessRate('test-workflow')

      expect(successRate).toBe(0)
    })
  })

  describe('event handling', () => {
    it('should register event handler', () => {
      const handler = vi.fn()
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const unsubscribe = service.onWorkflowEvent('workflow-started', handler)

      expect(consoleSpy).toHaveBeenCalledWith('Registered handler for event type: workflow-started')
      expect(typeof unsubscribe).toBe('function')
    })

    it('should unregister event handler', () => {
      const handler = vi.fn()
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const unsubscribe = service.onWorkflowEvent('workflow-started', handler)
      unsubscribe()

      expect(consoleSpy).toHaveBeenCalledWith('Unregistered handler for event type: workflow-started')
    })
  })
})