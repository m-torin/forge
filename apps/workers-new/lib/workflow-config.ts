/**
 * Workflow Environment Configuration
 * Controls whether to use local QStash CLI or Upstash cloud services
 */

export type WorkflowMode = 'local' | 'cloud'

interface WorkflowConfig {
  readonly mode: WorkflowMode
  readonly qstashUrl: string
  readonly qstashToken: string
  readonly workflowUrl: string
  readonly signingKeys?: {
    readonly current?: string
    readonly next?: string
  }
}

const DEFAULT_LOCAL_CONFIG = {
  qstashUrl: 'http://localhost:8080',
  qstashToken: 'eyJVc2VySUQiOiJkZWZhdWx0VXNlciIsIlBhc3N3b3JkIjoiZGVmYXVsdFBhc3N3b3JkIn0=',
  workflowUrl: 'http://localhost:3001',
} as const

const DEFAULT_CLOUD_CONFIG = {
  qstashUrl: 'https://qstash.upstash.io',
} as const

export function getWorkflowConfig(): WorkflowConfig {
  const mode = (process.env.WORKFLOW_MODE as WorkflowMode) ?? 'local'
  
  if (mode === 'local') {
    return {
      mode: 'local',
      qstashUrl: process.env.LOCAL_QSTASH_URL ?? DEFAULT_LOCAL_CONFIG.qstashUrl,
      qstashToken: process.env.LOCAL_QSTASH_TOKEN ?? DEFAULT_LOCAL_CONFIG.qstashToken,
      workflowUrl: process.env.LOCAL_WORKFLOW_URL ?? DEFAULT_LOCAL_CONFIG.workflowUrl,
      // No signing keys for local development
    }
  }

  // Cloud mode - validate required environment variables
  const cloudToken = process.env.CLOUD_QSTASH_TOKEN
  const cloudWorkflowUrl = process.env.CLOUD_WORKFLOW_URL

  if (!cloudToken) {
    throw new Error('CLOUD_QSTASH_TOKEN is required when WORKFLOW_MODE="cloud"')
  }
  
  if (!cloudWorkflowUrl) {
    throw new Error('CLOUD_WORKFLOW_URL is required when WORKFLOW_MODE="cloud"')
  }

  return {
    mode: 'cloud',
    qstashUrl: process.env.CLOUD_QSTASH_URL ?? DEFAULT_CLOUD_CONFIG.qstashUrl,
    qstashToken: cloudToken,
    workflowUrl: cloudWorkflowUrl,
    signingKeys: {
      current: process.env.CLOUD_QSTASH_CURRENT_SIGNING_KEY,
      next: process.env.CLOUD_QSTASH_NEXT_SIGNING_KEY,
    }
  }
}

/**
 * Get configuration for orchestration provider
 */
export function getOrchestrationConfig() {
  const workflowConfig = getWorkflowConfig()
  
  const config: any = {
    baseUrl: workflowConfig.workflowUrl,
    debug: workflowConfig.mode === 'local',
    env: workflowConfig.mode,
    webhookUrlPattern: '/{id}', // Direct endpoint pattern for workers-new app
    qstash: {
      token: workflowConfig.qstashToken,
      baseUrl: workflowConfig.qstashUrl,
    }
  }

  // Only add Redis configuration if URL is provided
  if (process.env.UPSTASH_REDIS_REST_URL) {
    config.redis = {
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }
  }
  
  return config
}

export const isLocalMode = (): boolean => getWorkflowConfig().mode === 'local'

export const isCloudMode = (): boolean => getWorkflowConfig().mode === 'cloud'