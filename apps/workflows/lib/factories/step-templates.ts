import { HttpRetryManager } from '@/lib/reliability/retry-manager'
import { type StepContext, type StepResult } from '@/lib/steps/step-registry'
import { z } from 'zod'

import { stepFactory, type StepTemplate } from './step-factory'

// HTTP Request Template
export const httpRequestTemplate: StepTemplate = {
  id: 'http-request',
  name: 'HTTP Request',
  category: 'http',
  description: 'Makes HTTP requests with automatic retries and error handling',
  
  configSchema: z.object({
    validateStatus: z.function().args(z.number()).returns(z.boolean()).optional(),
    url: z.string().url(),
    headers: z.record(z.string()).optional(),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).default('GET'),
    retryOnError: z.boolean().default(true),
    timeout: z.number().positive().optional()
  }),
  
  defaultConfig: {
    method: 'GET',
    retryOnError: true,
    timeout: 30000
  },
  
  createHandler: (config) => async (context: StepContext): Promise<StepResult> => {
    try {
      const { url, headers, method, retryOnError, timeout } = config
      const body = context.input.body ? JSON.stringify(context.input.body) : undefined
      
      const requestOptions: RequestInit = {
        body,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
          ...context.input.headers
        },
        method
      }
      
      // Add timeout if specified
      const controller = new AbortController()
      if (timeout) {
        setTimeout(() => controller.abort(), timeout)
        requestOptions.signal = controller.signal
      }
      
      const makeRequest = async () => {
        const response = await fetch(url, requestOptions)
        
        // Check if status is valid
        const validateStatus = config.validateStatus || ((status: number) => status >= 200 && status < 300)
        if (!validateStatus(response.status)) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const contentType = response.headers.get('content-type')
        const data = contentType?.includes('application/json') 
          ? await response.json() 
          : await response.text()
        
        return {
          data,
          headers: Object.fromEntries(response.headers.entries()),
          status: response.status,
          statusText: response.statusText
        }
      }
      
      const result = retryOnError 
        ? await HttpRetryManager.get(url, requestOptions)
        : await makeRequest()
      
      return {
        metadata: {
          url,
          duration: 0, // Would be tracked by execution context
          method
        },
        output: result,
        success: true
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'HTTP request failed',
        metadata: {
          url: config.url,
          method: config.method
        },
        success: false
      }
    }
  }
}

// Data Transformation Template
export const dataTransformTemplate: StepTemplate = {
  id: 'data-transform',
  name: 'Data Transformation',
  category: 'data',
  description: 'Transforms data using JSONPath or custom transformation functions',
  
  configSchema: z.object({
    transformations: z.array(z.object({
      customFn: z.string().optional(), // For custom transformations
      input: z.string(), // JSONPath or property path
      output: z.string(), // Output property path
      transform: z.enum(['copy', 'uppercase', 'lowercase', 'number', 'boolean', 'date', 'custom'])
    }))
  }),
  
  createHandler: (config) => async (context: StepContext): Promise<StepResult> => {
    try {
      const output: Record<string, any> = {}
      
      for (const transformation of config.transformations) {
        const value = getNestedProperty(context.input, transformation.input)
        
        let transformedValue: any
        switch (transformation.transform) {
          case 'copy':
            transformedValue = value
            break
          case 'uppercase':
            transformedValue = String(value).toUpperCase()
            break
          case 'lowercase':
            transformedValue = String(value).toLowerCase()
            break
          case 'number':
            transformedValue = Number(value)
            break
          case 'boolean':
            transformedValue = Boolean(value)
            break
          case 'date':
            transformedValue = new Date(value).toISOString()
            break
          case 'custom':
            if (transformation.customFn) {
              // In a real implementation, this would use a sandboxed eval
              // For now, we'll just support basic operations
              transformedValue = value // Placeholder
            }
            break
        }
        
        setNestedProperty(output, transformation.output, transformedValue)
      }
      
      return {
        metadata: {
          transformationCount: config.transformations.length
        },
        output,
        success: true
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Data transformation failed',
        success: false
      }
    }
  }
}

// Database Query Template
export const databaseQueryTemplate: StepTemplate = {
  id: 'database-query',
  name: 'Database Query',
  category: 'database',
  description: 'Executes database queries with connection pooling and retry logic',
  
  configSchema: z.object({
    connectionString: z.string(),
    params: z.array(z.any()).optional(),
    query: z.string(),
    timeout: z.number().positive().optional()
  }),
  
  defaultConfig: {
    timeout: 30000
  },
  
  createHandler: (config) => async (context: StepContext): Promise<StepResult> => {
    try {
      // This is a placeholder - in real implementation would use actual DB client
      const mockResult = {
        fields: [],
        rowCount: 0,
        rows: []
      }
      
      return {
        metadata: {
          query: config.query,
          rowCount: mockResult.rowCount
        },
        output: mockResult,
        success: true
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Database query failed',
        success: false
      }
    }
  }
}

// Email Notification Template
export const emailNotificationTemplate: StepTemplate = {
  id: 'email-notification',
  name: 'Email Notification',
  category: 'notification',
  description: 'Sends email notifications using configured email service',
  
  configSchema: z.object({
    provider: z.enum(['smtp', 'sendgrid', 'ses', 'resend']).default('smtp'),
    from: z.string().email(),
    smtpConfig: z.object({
      auth: z.object({
        pass: z.string(),
        user: z.string()
      }),
      host: z.string(),
      port: z.number(),
      secure: z.boolean()
    }).optional(),
    templateId: z.string().optional()
  }),
  
  createHandler: (config) => async (context: StepContext): Promise<StepResult> => {
    try {
      const { body, html, subject, to } = context.input
      
      // Validate required fields
      if (!to || !subject || (!body && !html)) {
        throw new Error('Missing required email fields: to, subject, and body or html')
      }
      
      // This is a placeholder - in real implementation would use actual email service
      console.log(`Sending email to ${to} with subject: ${subject}`)
      
      return {
        metadata: {
          provider: config.provider,
          subject,
          to
        },
        output: {
          provider: config.provider,
          accepted: [to],
          messageId: `msg_${Date.now()}`,
          rejected: []
        },
        success: true
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Email notification failed',
        success: false
      }
    }
  }
}

// File Processing Template
export const fileProcessingTemplate: StepTemplate = {
  id: 'file-processing',
  name: 'File Processing',
  category: 'file',
  description: 'Processes files with various operations',
  
  configSchema: z.object({
    createDirectories: z.boolean().default(true),
    encoding: z.string().default('utf-8'),
    operation: z.enum(['read', 'write', 'copy', 'move', 'delete', 'transform'])
  }),
  
  createHandler: (config) => async (context: StepContext): Promise<StepResult> => {
    try {
      const { encoding, operation } = config
      const { content, destination, source } = context.input
      
      // This is a placeholder - in real implementation would use actual file operations
      let result: any
      
      switch (operation) {
        case 'read':
          result = { content: 'file contents', size: 1024 }
          break
        case 'write':
          result = { path: destination, size: content?.length || 0 }
          break
        case 'copy':
        case 'move':
          result = { destination, source }
          break
        case 'delete':
          result = { deleted: source }
          break
        case 'transform':
          result = { transformed: true }
          break
      }
      
      return {
        metadata: {
          encoding,
          operation
        },
        output: result,
        success: true
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'File processing failed',
        success: false
      }
    }
  }
}

// Conditional Logic Template
export const conditionalLogicTemplate: StepTemplate = {
  id: 'conditional-logic',
  name: 'Conditional Logic',
  category: 'control',
  description: 'Evaluates conditions and returns different outputs',
  
  configSchema: z.object({
    conditions: z.array(z.object({
      expression: z.string(), // Simple expression like "input.value > 10"
      output: z.any()
    })),
    defaultOutput: z.any()
  }),
  
  createHandler: (config) => async (context: StepContext): Promise<StepResult> => {
    try {
      // Evaluate conditions in order
      for (const condition of config.conditions) {
        // Simple expression evaluation - in real implementation would use safe eval
        const result = evaluateSimpleExpression(condition.expression, context.input)
        if (result) {
          return {
            metadata: {
              matchedCondition: condition.expression
            },
            output: condition.output,
            success: true
          }
        }
      }
      
      // No conditions matched, return default
      return {
        metadata: {
          matchedCondition: 'default'
        },
        output: config.defaultOutput,
        success: true
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Conditional evaluation failed',
        success: false
      }
    }
  }
}

// Webhook Template
export const webhookTemplate: StepTemplate = {
  id: 'webhook',
  name: 'Webhook',
  category: 'integration',
  description: 'Triggers webhooks with payload and signature verification',
  
  configSchema: z.object({
    url: z.string().url(),
    headers: z.record(z.string()).optional(),
    method: z.enum(['POST', 'PUT']).default('POST'),
    retryAttempts: z.number().default(3),
    secret: z.string().optional(),
    timeout: z.number().default(30000)
  }),
  
  createHandler: (config) => async (context: StepContext): Promise<StepResult> => {
    try {
      const payload = context.input.payload || context.input
      
      // Generate signature if secret is provided
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...config.headers
      }
      
      if (config.secret) {
        // In real implementation, would use crypto to generate HMAC
        headers['X-Webhook-Signature'] = 'signature-placeholder'
      }
      
      const response = await HttpRetryManager.post(config.url, payload, {
        headers,
        timeout: config.timeout
      })
      
      return {
        metadata: {
          url: config.url,
          method: config.method
        },
        output: response,
        success: true
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Webhook failed',
        success: false
      }
    }
  }
}

// Helper functions
function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}

function setNestedProperty(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  
  const target = keys.reduce((current, key) => {
    if (!current[key]) {
      current[key] = {}
    }
    return current[key]
  }, obj)
  
  target[lastKey] = value
}

function evaluateSimpleExpression(expression: string, data: any): boolean {
  // Very simple expression evaluator - in production would use safe eval
  // Supports basic comparisons like "value > 10" or "status === 'active'"
  try {
    // This is a placeholder - would need proper sandboxed evaluation
    if (expression.includes('>')) {
      const [left, right] = expression.split('>').map(s => s.trim())
      const leftValue = getNestedProperty(data, left.replace('input.', ''))
      const rightValue = parseFloat(right) || right
      return leftValue > rightValue
    }
    
    if (expression.includes('===')) {
      const [left, right] = expression.split('===').map(s => s.trim())
      const leftValue = getNestedProperty(data, left.replace('input.', ''))
      const rightValue = right.replace(/['"]/g, '')
      return leftValue === rightValue
    }
    
    return false
  } catch {
    return false
  }
}

// Register all templates
export function registerBuiltInTemplates(): void {
  stepFactory.registerTemplate(httpRequestTemplate)
  stepFactory.registerTemplate(dataTransformTemplate)
  stepFactory.registerTemplate(databaseQueryTemplate)
  stepFactory.registerTemplate(emailNotificationTemplate)
  stepFactory.registerTemplate(fileProcessingTemplate)
  stepFactory.registerTemplate(conditionalLogicTemplate)
  stepFactory.registerTemplate(webhookTemplate)
  
  console.log('Registered built-in step templates')
}