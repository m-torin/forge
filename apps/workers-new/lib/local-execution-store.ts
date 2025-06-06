/**
 * In-memory storage for workflow executions in local development
 * This provides a simple store when Redis is not available
 */

interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt: Date
  completedAt?: Date
  input?: Record<string, any>
  output?: Record<string, any>
  error?: string
  steps: Array<{
    stepId: string
    status: 'pending' | 'running' | 'completed' | 'failed'
    attempts: number
    startedAt?: Date
    completedAt?: Date
    output?: any
    error?: string
  }>
  metadata?: {
    trigger: {
      type: 'manual' | 'scheduled' | 'webhook'
      payload?: any
      timestamp: Date
    }
  }
}

interface WorkflowRun {
  workflowRunId: string
  workflowState: 'RUN_STARTED' | 'RUN_SUCCESS' | 'RUN_FAILED' | 'RUN_CANCELED'
  workflowUrl: string
  workflowRunCreatedAt: number
  workflowRunCompletedAt?: number
  steps: unknown[]
}

class LocalExecutionStore {
  private executions = new Map<string, WorkflowExecution>()
  private maxExecutions = 100 // Keep last 100 executions

  addExecution(execution: WorkflowExecution): void {
    this.executions.set(execution.id, execution)
    
    // Cleanup old executions if we exceed the limit
    if (this.executions.size > this.maxExecutions) {
      const oldestKey = this.executions.keys().next().value
      if (oldestKey) {
        this.executions.delete(oldestKey)
      }
    }
  }

  updateExecution(id: string, updates: Partial<WorkflowExecution>): void {
    const existing = this.executions.get(id)
    if (existing) {
      this.executions.set(id, { ...existing, ...updates })
    }
  }

  getExecution(id: string): WorkflowExecution | undefined {
    return this.executions.get(id)
  }

  listExecutions(options?: {
    workflowId?: string
    status?: WorkflowExecution['status'][]
    limit?: number
    offset?: number
  }): WorkflowExecution[] {
    let executions = Array.from(this.executions.values())

    // Filter by workflowId
    if (options?.workflowId) {
      executions = executions.filter(exec => exec.workflowId === options.workflowId)
    }

    // Filter by status
    if (options?.status && options.status.length > 0) {
      executions = executions.filter(exec => options.status!.includes(exec.status))
    }

    // Sort by startedAt descending (newest first)
    executions.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())

    // Apply pagination
    const offset = options?.offset || 0
    const limit = options?.limit || 50
    return executions.slice(offset, offset + limit)
  }

  // Method to update workflow status from within workflow execution
  updateWorkflowFromExecution(workflowRunId: string, updates: {
    status?: WorkflowExecution['status']
    completedAt?: Date
    output?: Record<string, any>
    error?: string
    stepUpdates?: Array<{
      stepId: string
      status: 'pending' | 'running' | 'completed' | 'failed'
      startedAt?: Date
      completedAt?: Date
      output?: any
      error?: string
    }>
  }): void {
    const existing = this.executions.get(workflowRunId)
    if (!existing) {
      console.log(`[LOCAL-STORE] No execution found for ID: ${workflowRunId}`)
      return
    }

    let updatedSteps = existing.steps
    
    // Update individual steps if provided
    if (updates.stepUpdates) {
      updatedSteps = existing.steps.map(step => {
        const stepUpdate = updates.stepUpdates!.find(u => u.stepId === step.stepId)
        if (stepUpdate) {
          return {
            ...step,
            ...stepUpdate,
            attempts: step.attempts + (stepUpdate.status === 'running' ? 1 : 0)
          }
        }
        return step
      })
    }

    // Update the execution
    this.updateExecution(workflowRunId, {
      ...updates,
      steps: updatedSteps
    })

    console.log(`[LOCAL-STORE] Updated workflow ${workflowRunId} - Status: ${updates.status || existing.status}`)
  }

  transformToWorkflowRuns(baseUrl: string): WorkflowRun[] {
    const executions = this.listExecutions({ limit: 100 })
    
    return executions.map(execution => ({
      workflowRunId: execution.id,
      workflowState: this.mapStatusToState(execution.status),
      workflowUrl: `${baseUrl}/${execution.workflowId}`,
      workflowRunCreatedAt: execution.startedAt.getTime(),
      workflowRunCompletedAt: execution.completedAt?.getTime(),
      steps: execution.steps && execution.steps.length > 0 ? [{
        steps: execution.steps.map(step => ({
          ...step,
          stepName: step.stepId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), // Convert camelCase to Title Case
          state: step.status === 'completed' ? 'STEP_SUCCESS' as const :
                 step.status === 'failed' ? 'STEP_FAILED' as const :
                 step.status === 'running' ? 'STEP_RUNNING' as const : 
                 step.status === 'pending' ? 'STEP_PENDING' as const : undefined,
          createdAt: step.startedAt,
          completedAt: step.completedAt
        }))
      }] : []
    }))
  }

  private mapStatusToState(status: WorkflowExecution['status']): WorkflowRun['workflowState'] {
    switch (status) {
      case 'pending':
      case 'running':
        return 'RUN_STARTED'
      case 'completed':
        return 'RUN_SUCCESS'
      case 'failed':
        return 'RUN_FAILED'
      case 'cancelled':
        return 'RUN_CANCELED'
      default:
        return 'RUN_STARTED'
    }
  }

  clear(): void {
    this.executions.clear()
  }

  getStats(): { total: number; byStatus: Record<string, number> } {
    const executions = Array.from(this.executions.values())
    const byStatus: Record<string, number> = {}
    
    executions.forEach(exec => {
      byStatus[exec.status] = (byStatus[exec.status] || 0) + 1
    })

    return {
      total: executions.length,
      byStatus
    }
  }
}

// Global singleton instance for local development
const localExecutionStore = new LocalExecutionStore()

export { localExecutionStore, type WorkflowExecution, type WorkflowRun }