import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { WorkflowExecution, WorkflowStatus } from '@/types'

// Mock @upstash/qstash
vi.mock('@upstash/qstash')

// Mock memory store
vi.mock('@/lib/storage/memory-store')

// Mock WebSocket server
vi.mock('@/lib/realtime/websocket-server')

// Import after mocks are set up
import { QStashClient } from '@/lib/qstash/client'
import { Client } from '@upstash/qstash'
import { memoryStore } from '@/lib/storage/memory-store'
import { wsServer } from '@/lib/realtime/websocket-server'

describe('QStashClient', () => {
  let client: QStashClient
  const originalEnv = process.env

  // Create mocked instances
  const mockPublishJSON = vi.fn()
  const mockClient = { publishJSON: mockPublishJSON }
  const MockedClient = vi.mocked(Client)
  const mockedMemoryStore = vi.mocked(memoryStore)
  const mockedWsServer = vi.mocked(wsServer)

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup QStash client mock
    MockedClient.mockImplementation(() => mockClient as any)
    
    // Set up environment variables
    process.env = {
      ...originalEnv,
      QSTASH_TOKEN: 'test-token',
      NODE_ENV: 'test',
    }

    client = new QStashClient()
  })

  afterEach(() => {
    process.env = originalEnv
    vi.clearAllTimers()
  })

  describe('constructor', () => {
    it('should initialize successfully with required environment variables', () => {
      expect(client).toBeDefined()
    })

    it('should throw error when QSTASH_TOKEN is missing', () => {
      delete process.env.QSTASH_TOKEN

      expect(() => new QStashClient()).toThrow(
        'QSTASH_TOKEN environment variable is required'
      )
    })

    it('should use VERCEL_URL when available', () => {
      process.env.VERCEL_URL = 'myapp.vercel.app'
      const vercelClient = new QStashClient()
      expect(vercelClient).toBeDefined()
    })

    it('should fallback to localhost when VERCEL_URL not available', () => {
      delete process.env.VERCEL_URL
      const localClient = new QStashClient()
      expect(localClient).toBeDefined()
    })
  })

  describe('executeWorkflow', () => {
    const mockQStashResponse = {
      messageId: 'msg_123456789',
      url: 'http://localhost:3100/api/workflows/test-workflow/execute',
    }

    beforeEach(() => {
      mockPublishJSON.mockResolvedValue(mockQStashResponse)
    })

    it('should execute workflow successfully', async () => {
      const workflowId = 'test-workflow'
      const input = { userId: 'user123', amount: 100 }
      const options = { timeout: 30000, retries: 2 }

      const result = await client.executeWorkflow(workflowId, input, options)

      expect(result).toEqual({
        executionId: expect.stringMatching(/^exec_\d+_[a-z0-9]+$/),
        messageId: mockQStashResponse.messageId,
      })

      // Verify execution was stored
      expect(mockedMemoryStore.setExecution).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.stringMatching(/^exec_\d+_[a-z0-9]+$/),
          workflowId,
          status: 'running',
          input,
          triggeredBy: 'manual',
          environment: 'test',
          version: '1.0.0',
        })
      )

      // Verify QStash message was sent
      expect(mockPublishJSON).toHaveBeenCalledWith({
        url: 'http://localhost:3100/api/workflows/test-workflow/execute',
        headers: {
          'Content-Type': 'application/json',
          'X-Execution-ID': expect.stringMatching(/^exec_\d+_[a-z0-9]+$/),
          'X-Workflow-ID': workflowId,
        },
        body: {
          executionId: expect.stringMatching(/^exec_\d+_[a-z0-9]+$/),
          workflowId,
          input,
          metadata: {
            triggeredBy: 'qstash',
            timestamp: expect.any(String),
            environment: 'test',
          },
        },
        retries: 2,
        delay: undefined,
        cron: undefined,
      })

      // Verify WebSocket event was broadcast
      expect(mockedWsServer.broadcastWorkflowEvent).toHaveBeenCalledWith({
        type: 'workflow-started',
        workflowId,
        executionId: expect.stringMatching(/^exec_\d+_[a-z0-9]+$/),
        timestamp: expect.any(Date),
        data: {
          input,
          messageId: mockQStashResponse.messageId,
          options,
        },
      })
    })

    it('should handle execution failure', async () => {
      const error = new Error('QStash publish failed')
      mockPublishJSON.mockRejectedValue(error)

      await expect(
        client.executeWorkflow('test-workflow', {})
      ).rejects.toThrow('QStash publish failed')

      // Verify failure was recorded
      expect(mockedMemoryStore.setExecution).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed',
          error: 'QStash publish failed',
          completedAt: expect.any(Date),
          duration: expect.any(Number),
        })
      )

      // Verify failure event was broadcast
      expect(mockedWsServer.broadcastWorkflowEvent).toHaveBeenCalledWith({
        type: 'workflow-failed',
        workflowId: 'test-workflow',
        executionId: expect.stringMatching(/^exec_\d+_[a-z0-9]+$/),
        timestamp: expect.any(Date),
        data: {
          error: 'QStash publish failed',
          input: {},
        },
      })
    })
  })

  describe('cancelWorkflow', () => {
    const mockExecution: WorkflowExecution = {
      id: 'exec-123',
      workflowId: 'test-workflow',
      status: 'running',
      input: {},
      startedAt: new Date('2024-01-01T10:00:00Z'),
      steps: [],
      triggeredBy: 'manual',
      environment: 'test',
      version: '1.0.0',
      metrics: {},
    }

    it('should cancel running workflow successfully', async () => {
      mockedMemoryStore.getExecution.mockReturnValue(mockExecution)

      await client.cancelWorkflow('exec-123')

      expect(mockedMemoryStore.setExecution).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'cancelled',
          completedAt: expect.any(Date),
          duration: expect.any(Number),
        })
      )

      expect(mockedWsServer.broadcastWorkflowEvent).toHaveBeenCalledWith({
        type: 'workflow-failed',
        workflowId: 'test-workflow',
        executionId: 'exec-123',
        timestamp: expect.any(Date),
        data: {
          status: 'cancelled',
          reason: 'Manual cancellation',
        },
      })
    })

    it('should throw error for non-existent execution', async () => {
      mockedMemoryStore.getExecution.mockReturnValue(undefined)

      await expect(client.cancelWorkflow('non-existent')).rejects.toThrow(
        'Execution not found: non-existent'
      )
    })
  })

  describe('getQueueStats', () => {
    it('should calculate stats from memory store', async () => {
      const mockExecutions: WorkflowExecution[] = [
        {
          id: 'exec-1',
          workflowId: 'test',
          status: 'pending',
          input: {},
          startedAt: new Date(),
          steps: [],
          triggeredBy: 'manual',
          environment: 'test',
          version: '1.0.0',
          metrics: {},
        },
        {
          id: 'exec-2',
          workflowId: 'test',
          status: 'running',
          input: {},
          startedAt: new Date(),
          steps: [],
          triggeredBy: 'manual',
          environment: 'test',
          version: '1.0.0',
          metrics: {},
        },
        {
          id: 'exec-3',
          workflowId: 'test',
          status: 'completed',
          input: {},
          startedAt: new Date(),
          steps: [],
          triggeredBy: 'manual',
          environment: 'test',
          version: '1.0.0',
          metrics: {},
        },
        {
          id: 'exec-4',
          workflowId: 'test',
          status: 'failed',
          input: {},
          startedAt: new Date(),
          steps: [],
          triggeredBy: 'manual',
          environment: 'test',
          version: '1.0.0',
          metrics: {},
        },
      ]

      mockedMemoryStore.getAllExecutions.mockReturnValue(mockExecutions)

      const stats = await client.getQueueStats()

      expect(stats).toEqual({
        pendingMessages: 2, // pending + running
        dlqMessages: 1, // failed
        totalProcessed: 1, // completed
      })
    })
  })

  describe('healthCheck', () => {
    it('should return true when QStash is healthy', async () => {
      mockPublishJSON.mockResolvedValue({ messageId: 'health-check' })

      const isHealthy = await client.healthCheck()

      expect(isHealthy).toBe(true)
      expect(mockPublishJSON).toHaveBeenCalledWith({
        url: 'http://localhost:3100/api/health',
        body: { test: true },
        delay: 1000,
      })
    })

    it('should return false when QStash is unhealthy', async () => {
      mockPublishJSON.mockRejectedValue(new Error('Service unavailable'))

      const isHealthy = await client.healthCheck()

      expect(isHealthy).toBe(false)
    })
  })
})