
export interface StepContext {
  executionId: string
  input: Record<string, any>
  metadata: Record<string, any>
  previousSteps: Record<string, any>
  stepId: string
  workflowId: string
}

export interface StepResult {
  error?: string
  metadata?: Record<string, any>
  nextSteps?: string[]
  output?: any
  success: boolean
}

export interface StepDefinition {
  category: string
  description?: string
  handler: (context: StepContext) => Promise<StepResult>
  id: string
  inputSchema?: any
  name: string
  outputSchema?: any
  retries?: number
  tags: string[]
  timeout?: number
  version: string
  
  // Step dependencies
  dependencies?: string[]
  
  // Conditional execution
  condition?: (context: StepContext) => boolean | Promise<boolean>
  
  // Error handling
  onError?: (context: StepContext, error: Error) => Promise<StepResult>
  
  afterExecution?: (context: StepContext, result: StepResult) => Promise<void>
  // Lifecycle hooks
  beforeExecution?: (context: StepContext) => Promise<void>
}

export interface StepExecution {
  completedAt?: Date
  duration?: number
  error?: string
  executionId: string
  id: string
  input: Record<string, any>
  metadata: Record<string, any>
  output?: any
  retryCount: number
  startedAt?: Date
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  stepId: string
}

export class StepRegistry {
  private steps = new Map<string, StepDefinition>()
  private categories = new Set<string>()
  private tags = new Set<string>()
  private subscribers = new Set<(steps: StepDefinition[]) => void>()

  // Step registration
  register(step: StepDefinition): void {
    this.validateStep(step)
    
    this.steps.set(step.id, { ...step })
    this.categories.add(step.category)
    step.tags.forEach(tag => this.tags.add(tag))

    console.log(`Registered step: ${step.id}`)
    this.notifySubscribers()
  }

  registerMultiple(steps: StepDefinition[]): void {
    steps.forEach(step => this.register(step))
  }

  unregister(stepId: string): boolean {
    const success = this.steps.delete(stepId)
    if (success) {
      this.rebuildMetadata()
      this.notifySubscribers()
      console.log(`Unregistered step: ${stepId}`)
    }
    return success
  }

  // Step retrieval
  getStep(stepId: string): StepDefinition | undefined {
    return this.steps.get(stepId)
  }

  getAllSteps(): StepDefinition[] {
    return Array.from(this.steps.values())
  }

  getStepsByCategory(category: string): StepDefinition[] {
    return this.getAllSteps().filter(step => step.category === category)
  }

  getStepsByTag(tag: string): StepDefinition[] {
    return this.getAllSteps().filter(step => step.tags.includes(tag))
  }

  searchSteps(query: string): StepDefinition[] {
    const lowerQuery = query.toLowerCase()
    return this.getAllSteps().filter(step => 
      step.id.toLowerCase().includes(lowerQuery) ||
      step.name.toLowerCase().includes(lowerQuery) ||
      step.description?.toLowerCase().includes(lowerQuery) ||
      step.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  // Step validation
  private validateStep(step: StepDefinition): void {
    if (!step.id || typeof step.id !== 'string') {
      throw new Error('Step must have a valid ID')
    }
    
    if (!step.name || typeof step.name !== 'string') {
      throw new Error('Step must have a valid name')
    }
    
    if (!step.handler || typeof step.handler !== 'function') {
      throw new Error('Step must have a valid handler function')
    }
    
    if (!step.version || typeof step.version !== 'string') {
      throw new Error('Step must have a valid version')
    }
    
    if (!step.category || typeof step.category !== 'string') {
      throw new Error('Step must have a valid category')
    }
    
    if (!Array.isArray(step.tags)) {
      throw new Error('Step tags must be an array')
    }

    if (this.steps.has(step.id)) {
      console.warn(`Step ${step.id} is being overwritten`)
    }
  }

  // Step execution
  async executeStep(
    stepId: string,
    context: StepContext
  ): Promise<StepResult> {
    const step = this.getStep(stepId)
    if (!step) {
      throw new Error(`Step not found: ${stepId}`)
    }

    // Check condition if specified
    if (step.condition) {
      const shouldExecute = await step.condition(context)
      if (!shouldExecute) {
        return {
          metadata: { reason: 'Condition not met', skipped: true },
          output: null,
          success: true
        }
      }
    }

    const startTime = Date.now()
    let result: StepResult

    try {
      // Before execution hook
      if (step.beforeExecution) {
        await step.beforeExecution(context)
      }

      // Execute with timeout if specified
      if (step.timeout) {
        result = await this.executeWithTimeout(step.handler, context, step.timeout)
      } else {
        result = await step.handler(context)
      }

      // After execution hook
      if (step.afterExecution) {
        await step.afterExecution(context, result)
      }

      // Add execution metadata
      result.metadata = {
        ...result.metadata,
        executionTime: Date.now() - startTime,
        stepId,
        stepVersion: step.version
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Try error handler if defined
      if (step.onError) {
        try {
          result = await step.onError(context, error instanceof Error ? error : new Error(errorMessage))
          result.metadata = {
            ...result.metadata,
            errorHandled: true,
            executionTime: Date.now() - startTime,
            stepId,
            stepVersion: step.version
          }
          return result
        } catch (handlerError) {
          // Error handler also failed
          return {
            error: `Step execution failed: ${errorMessage}. Error handler also failed: ${handlerError instanceof Error ? handlerError.message : 'Unknown error'}`,
            metadata: {
              errorHandlerFailed: true,
              executionTime: Date.now() - startTime,
              stepId,
              stepVersion: step.version
            },
            success: false
          }
        }
      }

      return {
        error: errorMessage,
        metadata: {
          executionTime: Date.now() - startTime,
          stepId,
          stepVersion: step.version
        },
        success: false
      }
    }
  }

  private async executeWithTimeout<T>(
    handler: (context: StepContext) => Promise<T>,
    context: StepContext,
    timeoutMs: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Step execution timed out after ${timeoutMs}ms`))
      }, timeoutMs)

      handler(context)
        .then(result => {
          clearTimeout(timer)
          resolve(result)
        })
        .catch(error => {
          clearTimeout(timer)
          reject(error)
        })
    })
  }

  // Step execution with retries
  async executeStepWithRetries(
    stepId: string,
    context: StepContext,
    maxRetries?: number
  ): Promise<StepResult> {
    const step = this.getStep(stepId)
    if (!step) {
      throw new Error(`Step not found: ${stepId}`)
    }

    const retries = maxRetries ?? step.retries ?? 0
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await this.executeStep(stepId, {
          ...context,
          metadata: {
            ...context.metadata,
            attempt: attempt + 1,
            maxAttempts: retries + 1
          }
        })

        if (result.success) {
          return {
            ...result,
            metadata: {
              ...result.metadata,
              totalAttempts: attempt + 1
            }
          }
        }

        // Step returned failure, don't retry
        return result
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        
        if (attempt < retries) {
          console.log(`Step ${stepId} attempt ${attempt + 1} failed, retrying...`)
          await this.delay(1000 * Math.pow(2, attempt)) // Exponential backoff
        }
      }
    }

    return {
      error: `Step failed after ${retries + 1} attempts: ${lastError?.message}`,
      metadata: {
        allAttemptsFailed: true,
        stepId,
        totalAttempts: retries + 1
      },
      success: false
    }
  }

  // Dependency resolution
  resolveDependencies(stepIds: string[]): string[] {
    const resolved: string[] = []
    const visited = new Set<string>()
    const visiting = new Set<string>()

    const visit = (stepId: string) => {
      if (visiting.has(stepId)) {
        throw new Error(`Circular dependency detected involving step: ${stepId}`)
      }
      
      if (visited.has(stepId)) {
        return
      }

      visiting.add(stepId)
      
      const step = this.getStep(stepId)
      if (!step) {
        throw new Error(`Step not found: ${stepId}`)
      }

      // Visit dependencies first
      if (step.dependencies) {
        step.dependencies.forEach(depId => visit(depId))
      }

      visiting.delete(stepId)
      visited.add(stepId)
      resolved.push(stepId)
    }

    stepIds.forEach(stepId => visit(stepId))
    return resolved
  }

  // Metadata and statistics
  getCategories(): string[] {
    return Array.from(this.categories).sort()
  }

  getTags(): string[] {
    return Array.from(this.tags).sort()
  }

  getStats(): {
    total: number
    categories: number
    tags: number
    byCategory: Record<string, number>
    byTag: Record<string, number>
  } {
    const byCategory: Record<string, number> = {}
    const byTag: Record<string, number> = {}

    this.getAllSteps().forEach(step => {
      byCategory[step.category] = (byCategory[step.category] || 0) + 1
      step.tags.forEach(tag => {
        byTag[tag] = (byTag[tag] || 0) + 1
      })
    })

    return {
      byCategory,
      byTag,
      categories: this.categories.size,
      tags: this.tags.size,
      total: this.steps.size
    }
  }

  // Subscription system
  subscribe(callback: (steps: StepDefinition[]) => void): () => void {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  private notifySubscribers(): void {
    const steps = this.getAllSteps()
    this.subscribers.forEach(callback => {
      try {
        callback(steps)
      } catch (error) {
        console.error('Error in step registry subscriber:', error)
      }
    })
  }

  private rebuildMetadata(): void {
    this.categories.clear()
    this.tags.clear()

    this.getAllSteps().forEach(step => {
      this.categories.add(step.category)
      step.tags.forEach(tag => this.tags.add(tag))
    })
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Validation and health
  validateStepChain(stepIds: string[]): {
    valid: boolean
    errors: string[]
    missingSteps: string[]
    circularDependencies: string[]
  } {
    const errors: string[] = []
    const missingSteps: string[] = []
    let circularDependencies: string[] = []

    // Check for missing steps
    stepIds.forEach(stepId => {
      if (!this.getStep(stepId)) {
        missingSteps.push(stepId)
      }
    })

    // Check for circular dependencies
    try {
      this.resolveDependencies(stepIds)
    } catch (error) {
      if (error instanceof Error && error.message.includes('Circular dependency')) {
        circularDependencies = [error.message]
      }
    }

    if (missingSteps.length > 0) {
      errors.push(`Missing steps: ${missingSteps.join(', ')}`)
    }

    if (circularDependencies.length > 0) {
      errors.push(...circularDependencies)
    }

    return {
      valid: errors.length === 0,
      circularDependencies,
      errors,
      missingSteps
    }
  }

  clear(): void {
    this.steps.clear()
    this.categories.clear()
    this.tags.clear()
    this.notifySubscribers()
  }
}

// Singleton instance
export const stepRegistry = new StepRegistry()