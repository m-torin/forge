
export interface ExecutionOptions {
  delay?: number
  metadata?: Record<string, any>
  priority?: 'low' | 'normal' | 'high'
  retries?: number
  tags?: string[]
  timeout?: number
}

export interface ScheduleOptions extends ExecutionOptions {
  cron: string
  enabled?: boolean
  timezone?: string
}

export interface QueueStats {
  dlqMessages: number
  pendingMessages: number
  totalProcessed: number
}

export interface ProviderCapabilities {
  supportsCancellation: boolean
  supportsDelay: boolean
  supportsMetrics: boolean
  supportsPriority: boolean
  supportsRetries: boolean
  supportsScheduling: boolean
}

export abstract class BaseWorkflowProvider {
  abstract readonly name: string
  abstract readonly capabilities: ProviderCapabilities

  // Core execution methods
  abstract executeWorkflow(
    workflowId: string,
    input: Record<string, any>,
    options?: ExecutionOptions
  ): Promise<{ executionId: string; messageId?: string }>

  abstract cancelWorkflow(executionId: string): Promise<void>

  // Scheduling (if supported)
  scheduleWorkflow?(
    workflowId: string,
    input: Record<string, any>,
    options: ScheduleOptions
  ): Promise<{ scheduleId: string }>

  cancelSchedule?(scheduleId: string): Promise<void>

  // Monitoring and metrics
  abstract getQueueStats(): Promise<QueueStats>
  abstract healthCheck(): Promise<boolean>

  // Provider lifecycle
  async initialize?(): Promise<void>
  async shutdown?(): Promise<void>

  // Utility methods
  isCapable(capability: keyof ProviderCapabilities): boolean {
    return this.capabilities[capability]
  }

  validateOptions(options: ExecutionOptions): void {
    if (options.priority && !this.isCapable('supportsPriority')) {
      throw new Error(`Provider ${this.name} does not support priority levels`)
    }
    if (options.delay && !this.isCapable('supportsDelay')) {
      throw new Error(`Provider ${this.name} does not support delayed execution`)
    }
    if (options.retries && !this.isCapable('supportsRetries')) {
      throw new Error(`Provider ${this.name} does not support retries`)
    }
  }
}

export interface WorkflowProvider extends BaseWorkflowProvider {}