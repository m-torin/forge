import { wsServer } from '@/lib/realtime/websocket-server'
import { memoryStore } from '@/lib/storage/memory-store'
import { workflowRegistry } from '@/lib/workflows/registry'
import { type WorkflowExecution } from '@/types'

import { BaseWorkflowProvider, type ExecutionOptions, type ProviderCapabilities, type QueueStats, type ScheduleOptions } from './base-provider'

interface ScheduledJob {
  cron: string
  enabled: boolean
  id: string
  input: Record<string, any>
  nextRun: Date
  timeout?: NodeJS.Timeout
  workflowId: string
}

export class LocalProvider extends BaseWorkflowProvider {
  readonly name = 'local'
  readonly capabilities: ProviderCapabilities = {
    supportsCancellation: true,
    supportsDelay: true,
    supportsMetrics: true,
    supportsPriority: true,
    supportsRetries: true,
    supportsScheduling: true,
  }

  private executionQueue: {
    executionId: string
    workflowId: string
    input: Record<string, any>
    options: ExecutionOptions
    priority: number
    scheduledFor: Date
  }[] = []

  private scheduledJobs = new Map<string, ScheduledJob>()
  private processingInterval: NodeJS.Timeout | null = null
  private runningExecutions = new Set<string>()

  async initialize(): Promise<void> {
    // Start processing queue every 100ms
    this.processingInterval = setInterval(() => {
      this.processQueue()
    }, 100)

    console.log('Local provider initialized')
  }

  async shutdown(): Promise<void> {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }

    // Cancel all scheduled jobs
    this.scheduledJobs.forEach(job => {
      if (job.timeout) {
        clearTimeout(job.timeout)
      }
    })
    this.scheduledJobs.clear()

    console.log('Local provider shutdown')
  }

  async executeWorkflow(
    workflowId: string,
    input: Record<string, any>,
    options: ExecutionOptions = {}
  ): Promise<{ executionId: string }> {
    this.validateOptions(options)

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const priority = this.getPriorityValue(options.priority)
    const scheduledFor = options.delay 
      ? new Date(Date.now() + options.delay)
      : new Date()

    // Add to queue
    this.executionQueue.push({
      executionId,
      input,
      options,
      priority,
      scheduledFor,
      workflowId,
    })

    // Sort queue by priority (higher number = higher priority) and scheduled time
    this.executionQueue.sort((a, b) => {
      if (a.scheduledFor.getTime() !== b.scheduledFor.getTime()) {
        return a.scheduledFor.getTime() - b.scheduledFor.getTime()
      }
      return b.priority - a.priority
    })

    // Create execution record
    const execution: WorkflowExecution = {
      id: executionId,
      environment: process.env.NODE_ENV || 'development',
      input,
      metrics: {},
      startedAt: new Date(),
      status: options.delay ? 'pending' : 'pending',
      steps: [],
      triggeredBy: 'local',
      version: '1.0.0',
      workflowId,
    }

    memoryStore.setExecution(execution)

    console.log(`Workflow ${workflowId} queued locally: ${executionId}`)
    return { executionId }
  }

  async scheduleWorkflow(
    workflowId: string,
    input: Record<string, any>,
    options: ScheduleOptions
  ): Promise<{ scheduleId: string }> {
    this.validateOptions(options)

    const scheduleId = `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const job: ScheduledJob = {
      id: scheduleId,
      cron: options.cron,
      enabled: options.enabled !== false,
      input,
      nextRun: this.parseNextCronRun(options.cron),
      workflowId,
    }

    this.scheduledJobs.set(scheduleId, job)
    this.scheduleNextRun(job)

    console.log(`Workflow ${workflowId} scheduled locally with cron: ${options.cron}`)
    return { scheduleId }
  }

  async cancelSchedule(scheduleId: string): Promise<void> {
    const job = this.scheduledJobs.get(scheduleId)
    if (job) {
      if (job.timeout) {
        clearTimeout(job.timeout)
      }
      this.scheduledJobs.delete(scheduleId)
      console.log(`Schedule ${scheduleId} cancelled`)
    }
  }

  async cancelWorkflow(executionId: string): Promise<void> {
    // Remove from queue if not started
    const queueIndex = this.executionQueue.findIndex(item => item.executionId === executionId)
    if (queueIndex !== -1) {
      this.executionQueue.splice(queueIndex, 1)
    }

    // Mark as cancelled if running
    this.runningExecutions.delete(executionId)

    const execution = memoryStore.getExecution(executionId)
    if (execution) {
      execution.status = 'cancelled'
      execution.completedAt = new Date()
      execution.duration = execution.startedAt 
        ? Date.now() - execution.startedAt.getTime() 
        : 0

      memoryStore.setExecution(execution)

      wsServer.broadcastWorkflowEvent({
        type: 'workflow-failed',
        data: {
          reason: 'Manual cancellation',
          status: 'cancelled',
        },
        executionId,
        timestamp: new Date(),
        workflowId: execution.workflowId,
      })
    }

    console.log(`Execution ${executionId} cancelled`)
  }

  async getQueueStats(): Promise<QueueStats> {
    const allExecutions = memoryStore.getAllExecutions()
    
    const pendingCount = this.executionQueue.length + this.runningExecutions.size
    const failedCount = allExecutions.filter(e => e.status === 'failed').length
    const completedCount = allExecutions.filter(e => e.status === 'completed').length

    return {
      dlqMessages: failedCount,
      pendingMessages: pendingCount,
      totalProcessed: completedCount,
    }
  }

  async healthCheck(): Promise<boolean> {
    return this.processingInterval !== null
  }

  // Queue processing
  private async processQueue(): Promise<void> {
    const now = new Date()
    
    // Find next item ready to process
    const readyIndex = this.executionQueue.findIndex(
      item => item.scheduledFor <= now
    )

    if (readyIndex === -1) return

    const item = this.executionQueue.splice(readyIndex, 1)[0]
    this.runningExecutions.add(item.executionId)

    // Execute workflow asynchronously
    this.executeWorkflowInternal(item).catch(error => {
      console.error(`Workflow execution failed: ${item.executionId}`, error)
    })
  }

  private async executeWorkflowInternal(item: {
    executionId: string
    workflowId: string
    input: Record<string, any>
    options: ExecutionOptions
  }): Promise<void> {
    const startTime = Date.now()
    const execution = memoryStore.getExecution(item.executionId)
    
    if (!execution) {
      console.error(`Execution not found: ${item.executionId}`)
      return
    }

    try {
      // Update status to running
      execution.status = 'running'
      memoryStore.setExecution(execution)

      // Broadcast started event
      wsServer.broadcastWorkflowEvent({
        type: 'workflow-started',
        data: { provider: 'local', input: item.input },
        executionId: item.executionId,
        timestamp: new Date(),
        workflowId: item.workflowId,
      })

      // Execute workflow with retries
      let lastError: Error | null = null
      const maxRetries = item.options.retries || 0
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const output = await workflowRegistry.executeWorkflow(item.workflowId, item.input)
          
          // Success
          execution.status = 'completed'
          execution.output = output
          execution.completedAt = new Date()
          execution.duration = Date.now() - startTime

          memoryStore.setExecution(execution)

          wsServer.broadcastWorkflowEvent({
            type: 'workflow-completed',
            data: { attempts: attempt + 1, duration: execution.duration, output },
            executionId: item.executionId,
            timestamp: new Date(),
            workflowId: item.workflowId,
          })

          break
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown error')
          
          if (attempt < maxRetries) {
            console.log(`Workflow ${item.workflowId} attempt ${attempt + 1} failed, retrying...`)
            await this.delay(1000 * Math.pow(2, attempt)) // Exponential backoff
          }
        }
      }

      if (lastError) {
        // All retries failed
        execution.status = 'failed'
        execution.error = lastError.message
        execution.completedAt = new Date()
        execution.duration = Date.now() - startTime

        memoryStore.setExecution(execution)

        wsServer.broadcastWorkflowEvent({
          type: 'workflow-failed',
          data: { duration: execution.duration, error: lastError.message },
          executionId: item.executionId,
          timestamp: new Date(),
          workflowId: item.workflowId,
        })
      }
    } catch (error) {
      console.error(`Workflow execution error: ${item.executionId}`, error)
    } finally {
      this.runningExecutions.delete(item.executionId)
    }
  }

  // Scheduling helpers
  private parseNextCronRun(cron: string): Date {
    // Simple cron parser - in production, use a proper cron library
    // For now, just schedule 1 minute from now as a placeholder
    return new Date(Date.now() + 60000)
  }

  private scheduleNextRun(job: ScheduledJob): void {
    if (!job.enabled) return

    const delay = job.nextRun.getTime() - Date.now()
    if (delay <= 0) {
      // Should run now
      this.triggerScheduledJob(job)
    } else {
      job.timeout = setTimeout(() => {
        this.triggerScheduledJob(job)
      }, delay)
    }
  }

  private async triggerScheduledJob(job: ScheduledJob): Promise<void> {
    if (!job.enabled) return

    try {
      await this.executeWorkflow(job.workflowId, job.input)
      
      // Schedule next run
      job.nextRun = this.parseNextCronRun(job.cron)
      this.scheduleNextRun(job)
    } catch (error) {
      console.error(`Scheduled job execution failed: ${job.id}`, error)
    }
  }

  private getPriorityValue(priority?: 'low' | 'normal' | 'high'): number {
    switch (priority) {
      case 'high': return 3
      case 'normal': return 2
      case 'low': return 1
      default: return 2
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}