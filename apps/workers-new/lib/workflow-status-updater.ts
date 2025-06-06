import { localExecutionStore } from './local-execution-store'

export function updateWorkflowStatus(executionId: string, updates: {
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
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
}) {
  try {
    localExecutionStore.updateWorkflowFromExecution(executionId, updates)
    console.log(`[WORKFLOW-STATUS] Updated execution ${executionId}:`, {
      status: updates.status,
      stepUpdates: updates.stepUpdates?.length || 0
    })
  } catch (error) {
    console.error(`[WORKFLOW-STATUS] Failed to update execution ${executionId}:`, error)
  }
}

export function getExecutionIdFromContext(context: any): string | null {
  try {
    // Check if context has request information
    if (context.request) {
      // Try to get from query parameters
      const url = new URL(context.request.url)
      const executionId = url.searchParams.get('executionId')
      if (executionId) {
        return executionId
      }

      // Try to get from headers
      const headerExecutionId = context.request.headers.get('X-Workflow-Execution-Id')
      if (headerExecutionId) {
        return headerExecutionId
      }
    }

    // Check if context has headers directly
    if (context.headers) {
      const headerExecutionId = context.headers['x-workflow-execution-id'] || context.headers['X-Workflow-Execution-Id']
      if (headerExecutionId) {
        return headerExecutionId
      }
    }

    console.log('[WORKFLOW-STATUS] No execution ID found in context')
    return null
  } catch (error) {
    console.error('[WORKFLOW-STATUS] Error extracting execution ID:', error)
    return null
  }
}