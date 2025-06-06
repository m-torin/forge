'use client'

import { createContext, useContext, useOptimistic, useTransition, useActionState, ReactNode, useEffect, useCallback, cache } from 'react'
import { useSetState, useDebouncedValue, useToggle, useQueue, useId } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconX, IconAlertCircle } from '@tabler/icons-react'
import { 
  type WorkflowDefinition,
  UpstashWorkflowProvider
} from '@repo/orchestration/server'
import { 
  WorkflowClient,
  createWorkflowClient,
  type WorkflowClientConfig
} from '@repo/orchestration/client'
import type { WorkflowInfo } from '../lib/workflows'

const cachedFetchConfig = cache(async (): Promise<WorkflowConfig> => {
  const response = await fetch('/api/config')
  if (!response.ok) {
    throw new Error('Failed to fetch config', { 
      cause: { status: response.status, statusText: response.statusText } 
    })
  }
  return response.json()
})


type WorkflowStatus = 'pending' | 'running' | 'success' | 'error'
type WorkflowState = 'RUN_STARTED' | 'RUN_SUCCESS' | 'RUN_FAILED' | 'RUN_CANCELED'
type ConfigMode = 'local' | 'cloud'

interface WorkflowExecution {
  readonly id: string
  readonly workflowSlug: string
  readonly status: WorkflowStatus
  readonly startTime: number
  readonly workflowRunId?: string
  readonly endTime?: number
  readonly error?: string
  readonly response?: unknown
}

interface WorkflowRun {
  readonly workflowRunId: string
  readonly workflowState: WorkflowState
  readonly workflowUrl: string
  readonly workflowRunCreatedAt: number
  readonly workflowRunCompletedAt?: number
  readonly steps: readonly unknown[]
}

interface WorkflowConfig {
  readonly mode: ConfigMode
  readonly environment: string
  readonly qstashUrl: `${'http' | 'https'}://${string}`
  readonly workflowUrl: `${'http' | 'https'}://${string}`
  readonly description: string
}

type LoadingStates = {
  readonly [K in 'sleepTest' | 'invoiceTest' | 'plainAPI' | 'qstashConnect' | 'qstashPublish' | 'config' | 'polling']: boolean
}

type QueueHandlers<T> = {
  readonly add: (...items: T[]) => void
  readonly update: (fn: (state: T[]) => T[]) => void
  readonly cleanQueue: () => void
  readonly state: T[]
  readonly limit: number
}

interface WorkflowsContextType {
  readonly workflows: readonly WorkflowInfo[]
  readonly config: WorkflowConfig | null
  readonly configLoading: boolean
  readonly configPromise: Promise<WorkflowConfig> | null
  readonly executions: WorkflowExecution[]
  readonly executeWorkflow: (slug: string, payload: Record<string, unknown>) => Promise<unknown>
  readonly isExecuting: boolean
  readonly workflowRuns: WorkflowRun[]
  readonly debouncedWorkflowRuns: WorkflowRun[]
  readonly sseConnected: boolean
  readonly loadingStates: LoadingStates
  readonly compactView: boolean
  readonly toggleCompactView: () => void
  readonly showAdvanced: boolean
  readonly toggleShowAdvanced: () => void
  readonly executionQueue: WorkflowExecution[]
  readonly queueHandlers: QueueHandlers<WorkflowExecution>
  readonly cancelWorkflow: (workflowRunId: string) => Promise<{ success: boolean; message?: string }>
  readonly cancelWorkflows: (workflowRunIds: readonly string[]) => Promise<{ success: boolean; message?: string }>
  readonly quickTestSleep: () => Promise<unknown>
  readonly quickTestInvoice: () => Promise<unknown>
  readonly testPlainAPI: (payload?: Record<string, unknown>) => Promise<unknown>
  readonly testQStashConnection: () => Promise<unknown>
  readonly testQStashPublish: (payload?: Record<string, unknown>) => Promise<unknown>
  readonly workflowAction: {
    readonly state: { readonly success: boolean; readonly error?: string; readonly data?: unknown }
    readonly action: (payload: FormData) => void
    readonly isPending: boolean
  }
  readonly refreshConfig: () => Promise<void>
  // New orchestration integration
  readonly orchestrationProvider: UpstashWorkflowProvider | null
  readonly workflowClient: WorkflowClient | null
}

const WorkflowsContext = createContext<WorkflowsContextType | null>(null)

interface WorkflowsProviderProps {
  children: ReactNode
  workflows: WorkflowInfo[]
}

export function WorkflowsProvider({ children, workflows }: WorkflowsProviderProps) {
  const [isPending, startTransition] = useTransition()
  const uniqueId = useId()
  
  const [state, setState] = useSetState({
    config: null as WorkflowConfig | null,
    configLoading: true,
    configPromise: null as Promise<WorkflowConfig> | null,
    workflowRuns: [] as WorkflowRun[],
    sseConnected: false,
    previousWorkflowStates: new Map<string, string>(),
    notifiedTransitions: new Set<string>(), // Track notified transitions to prevent duplicates
    loadingStates: {
      sleepTest: false,
      invoiceTest: false,
      plainAPI: false,
      qstashConnect: false,
      qstashPublish: false,
      config: false,
      polling: false
    } as LoadingStates,
    orchestrationProvider: null as UpstashWorkflowProvider | null,
    workflowClient: null as WorkflowClient | null
  })

  const [debouncedWorkflowRuns] = useDebouncedValue(state.workflowRuns, 300)

  const [compactView, toggleCompactView] = useToggle()
  const [showAdvanced, toggleShowAdvanced] = useToggle()

  const QUEUE_LIMIT = 3
  const executionQueue = useQueue<WorkflowExecution>({
    initialValues: [],
    limit: QUEUE_LIMIT
  })

  const [optimisticExecutions, addOptimisticExecution] = useOptimistic(
    [] as WorkflowExecution[],
    (state: WorkflowExecution[], newExecution: WorkflowExecution) => [...state, newExecution]
  )

  const fetchConfig = useCallback(async () => {
    try {
      setState({ configLoading: true })
      const data = await cachedFetchConfig()
      setState({ config: data, configPromise: Promise.resolve(data) })
      
      // Initialize orchestration provider with config
      try {
        const { getOrchestrationConfig } = await import('../lib/workflow-config')
        const orchestrationConfig = getOrchestrationConfig()
        
        const provider = new UpstashWorkflowProvider(orchestrationConfig)
        
        const clientConfig: WorkflowClientConfig = {
          baseUrl: orchestrationConfig.baseUrl || 'http://localhost:3001',
          timeout: 30000,
          enableRetries: true
        }
        
        const client = createWorkflowClient(clientConfig)
        
        setState(prev => ({
          ...prev,
          orchestrationProvider: provider,
          workflowClient: client
        }))
      } catch (providerError) {
        console.error('Failed to initialize orchestration provider:', providerError)
      }
    } catch (error) {
      console.error('Failed to fetch config:', error)
      setState({ config: null, configPromise: null })
    } finally {
      setState({ configLoading: false })
    }
  }, [setState])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  // SSE Connection for workflow updates with reconnection logic
  useEffect(() => {
    let eventSource: EventSource | null = null
    let reconnectTimeoutId: NodeJS.Timeout | null = null
    let reconnectAttempts = 0
    const maxReconnectAttempts = 5
    const baseReconnectDelay = 1000

    const connect = () => {
      console.log('[SSE] Setting up connection to /api/events')
      eventSource = new EventSource('/api/events')

      eventSource.onopen = () => {
        console.log('[SSE] Connection opened')
        setState({ sseConnected: true })
        reconnectAttempts = 0 // Reset on successful connection
      }

      eventSource.onerror = (error) => {
        console.error('[SSE] Connection error:', error)
        setState({ sseConnected: false })
        
        // Attempt reconnection with exponential backoff
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts)
          reconnectAttempts++
          
          console.log(`[SSE] Attempting reconnection ${reconnectAttempts}/${maxReconnectAttempts} in ${delay}ms`)
          
          reconnectTimeoutId = setTimeout(() => {
            if (eventSource) {
              eventSource.close()
            }
            connect()
          }, delay)
        } else {
          console.error('[SSE] Max reconnection attempts reached')
        }
      }

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data)
          const { type, data: eventData } = parsed

          if (type === 'workflow-update' && eventData?.runs) {
            const newRuns = eventData.runs || []

            setState(prevState => {
              const updatedPreviousStates = new Map(prevState.previousWorkflowStates)
              const updatedNotifiedTransitions = new Set(prevState.notifiedTransitions)
              
              newRuns.forEach((run: WorkflowRun) => {
                const previousState = updatedPreviousStates.get(run.workflowRunId)
                const currentState = run.workflowState
                const transitionKey = `${run.workflowRunId}:${previousState}→${currentState}`
                
                // Only show notification if this is a new state transition and we haven't notified about it
                if (previousState && 
                    previousState !== currentState && 
                    !updatedNotifiedTransitions.has(transitionKey)) {
                  
                  const workflowName = run.workflowUrl.split('/').pop() || 'Unknown'
                  
                  const notificationConfig = {
                    'RUN_SUCCESS': { 
                      title: 'Workflow Completed', 
                      color: 'green' as const, 
                      icon: <IconCheck size={18} />, 
                      autoClose: 4000 
                    },
                    'RUN_FAILED': { 
                      title: 'Workflow Failed', 
                      color: 'red' as const, 
                      icon: <IconX size={18} />, 
                      autoClose: 6000 
                    },
                    'RUN_CANCELED': { 
                      title: 'Workflow Canceled', 
                      color: 'orange' as const, 
                      icon: <IconAlertCircle size={18} />, 
                      autoClose: 4000 
                    }
                  }
                  
                  const config = notificationConfig[currentState as keyof typeof notificationConfig]
                  if (config) {
                    // Mark this transition as notified
                    updatedNotifiedTransitions.add(transitionKey)
                    
                    // Defer notification to avoid setState during render
                    setTimeout(() => {
                      notifications.show({
                        ...config,
                        message: `${workflowName} ${currentState.toLowerCase().replace('run_', '')}`,
                      })
                    }, 0)
                  }
                }
                
                updatedPreviousStates.set(run.workflowRunId, currentState)
              })
              
              const hasChanges = newRuns.length !== prevState.workflowRuns.length || 
                                newRuns.some((run: WorkflowRun, i: number) => prevState.workflowRuns[i]?.workflowState !== run.workflowState)
              
              if (hasChanges) {
                console.log(`[SSE] Updated ${newRuns.length} workflow runs at ${new Date().toLocaleTimeString()}`)
              }
              
              return {
                ...prevState,
                workflowRuns: newRuns,
                previousWorkflowStates: updatedPreviousStates,
                notifiedTransitions: updatedNotifiedTransitions
              }
            })
          } else if (type === 'connected') {
            console.log('[SSE] Connection confirmed:', eventData?.message)
          } else if (type === 'error') {
            console.error('[SSE] Server error:', eventData?.message)
          }
        } catch (error) {
          console.error('[SSE] Error parsing message:', error)
        }
      }
    }

    connect()

    return () => {
      console.log('[SSE] Cleaning up connection')
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId)
      }
      if (eventSource) {
        eventSource.close()
      }
      setState({ sseConnected: false })
    }
  }, [uniqueId, setState])

  // Cleanup old notified transitions to prevent memory leaks
  useEffect(() => {
    const cleanup = setInterval(() => {
      setState(prevState => {
        const activeWorkflowIds = new Set(prevState.workflowRuns.map(run => run.workflowRunId))
        const filteredTransitions = new Set(
          Array.from(prevState.notifiedTransitions).filter(transition => {
            const workflowId = transition.split(':')[0]
            return activeWorkflowIds.has(workflowId)
          })
        )
        
        if (filteredTransitions.size !== prevState.notifiedTransitions.size) {
          console.log(`[CLEANUP] Removed ${prevState.notifiedTransitions.size - filteredTransitions.size} old notification transitions`)
          return { ...prevState, notifiedTransitions: filteredTransitions }
        }
        return prevState
      })
    }, 60000) // Cleanup every minute

    return () => clearInterval(cleanup)
  }, [setState])

  const executeWorkflow = useCallback(async (slug: string, payload: Record<string, unknown>) => {
    const executionId = `exec_${Date.now()}_${crypto.randomUUID?.() ?? Math.random().toString(36).substring(2, 11)}`
    
    if (executionQueue.state.length >= QUEUE_LIMIT) {
      notifications.show({
        title: 'Execution Queue Full',
        message: `Maximum ${QUEUE_LIMIT} workflows can run simultaneously. Please wait for others to complete.`,
        icon: <IconAlertCircle size={18} />,
        color: 'orange',
        autoClose: 5000
      })
      throw new Error('Queue is full', { 
        cause: { queueLength: executionQueue.state.length, limit: QUEUE_LIMIT } 
      })
    }
    
    return new Promise((resolve, reject) => {
      startTransition(async () => {
        const execution: WorkflowExecution = {
          id: executionId,
          workflowSlug: slug,
          status: 'pending' as const,
          startTime: Date.now()
        }
        
        executionQueue.add(execution)
        addOptimisticExecution(execution)
        
        try {
          const response = await fetch('/api/local-trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ route: slug, payload })
          })
          
          const result = await response.json()
          
          const completedExecution: WorkflowExecution = {
            ...execution,
            status: result.success ? 'success' : 'error',
            workflowRunId: result.workflowRunId,
            endTime: Date.now(),
            error: result.success ? undefined : result.error,
            response: result
          }
          
          addOptimisticExecution(completedExecution)
          executionQueue.update((queue) => queue.filter(e => e.id !== execution.id))
          
          if (result.success) {
            console.log('Workflow executed successfully:', result)
            resolve(result)
          } else {
            const errorMessage = result.error ?? 'Workflow execution failed'
            console.error('Workflow execution failed:', result)
            reject(new Error(errorMessage, { cause: result }))
          }
        } catch (error) {
          console.error('Failed to execute workflow:', error)
          
          const errorExecution: WorkflowExecution = {
            ...execution,
            status: 'error',
            endTime: Date.now(),
            error: error instanceof Error ? error.message : 'Unknown error'
          }
          
          addOptimisticExecution(errorExecution)
          executionQueue.update(queue => queue.filter(e => e.id !== execution.id))
          
          reject(error)
        }
      })
    })
  }, [addOptimisticExecution, startTransition, executionQueue])

  const workflowActionFunction = useCallback(async (
    prevState: { readonly success: boolean; readonly error?: string; readonly data?: unknown }, 
    formData: FormData
  ) => {
    try {
      const slug = formData.get('slug') as string
      const payloadString = formData.get('payload') as string
      const payload = JSON.parse(payloadString ?? '{}') as Record<string, unknown>
      
      const result = await executeWorkflow(slug, payload)
      return { success: true as const, data: result, error: undefined }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return { 
        success: false as const, 
        error: errorMessage,
        data: undefined 
      }
    }
  }, [executeWorkflow])

  const [actionState, workflowActionHandler, isActionPending] = useActionState(
    workflowActionFunction,
    { success: false as const, error: '', data: undefined }
  )

  const cancelWorkflow = useCallback(async (workflowRunId: string) => {
    try {
      const response = await fetch('/api/workflows/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowRunId })
      })
      
      const result = await response.json()
      
      if (result.success) {
        notifications.show({
          title: 'Workflow Canceled',
          message: `Workflow ${workflowRunId} was canceled successfully`,
          icon: <IconCheck size={18} />,
          color: 'green'
        })
      } else {
        notifications.show({
          title: 'Cancellation Failed',
          message: result.message || 'Failed to cancel workflow',
          icon: <IconX size={18} />,
          color: 'red'
        })
      }
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      notifications.show({
        title: 'Cancellation Error',
        message: errorMessage,
        icon: <IconX size={18} />,
        color: 'red'
      })
      throw error
    }
  }, [])

  const cancelWorkflows = useCallback(async (workflowRunIds: readonly string[]) => {
    try {
      const response = await fetch('/api/workflows/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowRunIds })
      })
      
      const result = await response.json()
      
      if (result.success) {
        notifications.show({
          title: 'Workflows Canceled',
          message: `Successfully canceled ${workflowRunIds.length} workflow(s)`,
          icon: <IconCheck size={18} />,
          color: 'green'
        })
      } else {
        notifications.show({
          title: 'Partial Cancellation',
          message: result.message || 'Some workflows could not be canceled',
          icon: <IconAlertCircle size={18} />,
          color: 'orange'
        })
      }
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      notifications.show({
        title: 'Cancellation Error',
        message: errorMessage,
        icon: <IconX size={18} />,
        color: 'red'
      })
      throw error
    }
  }, [])

  const quickTestSleep = useCallback(async () => {
    const loadingKey = 'sleepTest'
    try {
      setState(prev => ({ 
        ...prev,
        loadingStates: { ...prev.loadingStates, [loadingKey]: true } 
      }))
      return await executeWorkflow('sleep', { duration: 2, message: 'Quick test' })
    } finally {
      setState(prev => ({ 
        ...prev,
        loadingStates: { ...prev.loadingStates, [loadingKey]: false } 
      }))
    }
  }, [executeWorkflow, setState])

  const quickTestInvoice = useCallback(async () => {
    const loadingKey = 'invoiceTest'
    try {
      setState(prev => ({ 
        ...prev,
        loadingStates: { ...prev.loadingStates, [loadingKey]: true } 
      }))
      return await executeWorkflow('northStarSimple', { 
        date: Date.now(), 
        email: 'test@example.com', 
        amount: 50 
      })
    } finally {
      setState(prev => ({ 
        ...prev,
        loadingStates: { ...prev.loadingStates, [loadingKey]: false } 
      }))
    }
  }, [executeWorkflow, setState])

  const withLoadingState = useCallback(<T extends readonly unknown[]>(
    loadingKey: keyof LoadingStates,
    fn: (...args: T) => Promise<unknown>
  ) => {
    return async (...args: T): Promise<unknown> => {
      try {
        setState(prev => ({ 
          ...prev,
          loadingStates: { ...prev.loadingStates, [loadingKey]: true } 
        }))
        return await fn(...args)
      } finally {
        setState(prev => ({ 
          ...prev,
          loadingStates: { ...prev.loadingStates, [loadingKey]: false } 
        }))
      }
    }
  }, [setState])

  const testPlainAPI = useCallback(withLoadingState('plainAPI', async (payload: Record<string, unknown> = { test: true }) => {
    const response = await fetch('/api/debug/test-plain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    const result = await response.json() as { success: boolean; error?: string }
    console.log('[DEBUG] Plain API test result:', result)
    
    notifications.show({
      title: 'Plain API Test',
      message: result.success ? 'API test successful' : (result.error ?? 'API test failed'),
      icon: result.success ? <IconCheck size={18} /> : <IconX size={18} />,
      color: result.success ? 'green' : 'red'
    })
    
    return result
  }), [withLoadingState])

  const testQStashConnection = useCallback(withLoadingState('qstashConnect', async () => {
    const response = await fetch('/api/debug/test-qstash')
    const result = await response.json() as { success: boolean; config?: { mode: string }; error?: string }
    console.log('[DEBUG] QStash connection test result:', result)
    
    notifications.show({
      title: 'QStash Connection Test',
      message: result.success 
        ? `Connected to ${result.config?.mode ?? 'unknown'} mode` 
        : (result.error ?? 'Connection failed'),
      icon: result.success ? <IconCheck size={18} /> : <IconX size={18} />,
      color: result.success ? 'green' : 'red'
    })
    
    return result
  }), [withLoadingState])

  const testQStashPublish = useCallback(withLoadingState('qstashPublish', async (payload: Record<string, unknown> = { test: true }) => {
    const response = await fetch('/api/debug/test-qstash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload })
    })
    
    const result = await response.json() as { success: boolean; messageId?: string; error?: string }
    console.log('[DEBUG] QStash publish test result:', result)
    
    notifications.show({
      title: 'QStash Publish Test',
      message: result.success 
        ? `Published message: ${result.messageId ?? 'unknown'}` 
        : (result.error ?? 'Publish failed'),
      icon: result.success ? <IconCheck size={18} /> : <IconX size={18} />,
      color: result.success ? 'green' : 'red'
    })
    
    return result
  }), [withLoadingState])

  const value: WorkflowsContextType = {
    workflows,
    config: state.config,
    configLoading: state.configLoading,
    configPromise: state.configPromise,
    executions: optimisticExecutions,
    executeWorkflow,
    isExecuting: isPending,
    workflowRuns: state.workflowRuns,
    debouncedWorkflowRuns,
    sseConnected: state.sseConnected,
    loadingStates: state.loadingStates,
    compactView,
    toggleCompactView,
    showAdvanced,
    toggleShowAdvanced,
    executionQueue: executionQueue.state,
    queueHandlers: {
      add: executionQueue.add,
      update: executionQueue.update,
      cleanQueue: executionQueue.cleanQueue,
      state: executionQueue.state,
      limit: QUEUE_LIMIT
    },
    workflowAction: {
      state: actionState,
      action: workflowActionHandler,
      isPending: isActionPending
    },
    cancelWorkflow,
    cancelWorkflows,
    quickTestSleep,
    quickTestInvoice,
    testPlainAPI,
    testQStashConnection,
    testQStashPublish,
    refreshConfig: fetchConfig,
    // New orchestration integration
    orchestrationProvider: state.orchestrationProvider,
    workflowClient: state.workflowClient
  } satisfies WorkflowsContextType

  return (
    <WorkflowsContext.Provider value={value}>
      {children}
    </WorkflowsContext.Provider>
  )
}

export function useWorkflows() {
  const context = useContext(WorkflowsContext)
  if (!context) {
    throw new Error('useWorkflows must be used within a WorkflowsProvider')
  }
  return context
}