/**
 * URL builder utilities for consistent workflow endpoint URLs
 */

/**
 * Get the base URL for the current environment
 */
export function getBaseUrl(): string {
  // In production, use the canonical URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // In development, use localhost
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3400';
}

/**
 * Build workflow endpoint URLs
 */
export function buildWorkflowUrls() {
  const baseUrl = getBaseUrl();
  
  return {
    basic: `${baseUrl}/api/workflows/basic`,
    'kitchen-sink': `${baseUrl}/api/workflows/kitchen-sink`,
    'image-processing': `${baseUrl}/api/workflows/image-processing`,
  };
}

/**
 * Build a specific workflow URL
 */
export function buildWorkflowUrl(workflowName: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/api/workflows/${workflowName}`;
}

/**
 * Build schedule endpoint URLs
 */
export function buildScheduleUrls() {
  const baseUrl = getBaseUrl();
  
  return {
    manage: `${baseUrl}/api/schedules`,
    kitchenSink: `${baseUrl}/api/schedules/kitchen-sink`,
  };
}

/**
 * Build client endpoint URLs
 */
export function buildClientUrls() {
  const baseUrl = getBaseUrl();
  
  return {
    trigger: `${baseUrl}/api/client/trigger`,
    cancel: `${baseUrl}/api/client/cancel`,
    notify: `${baseUrl}/api/client/notify`,
    logs: `${baseUrl}/api/client/logs`,
    waiters: `${baseUrl}/api/client/waiters`,
  };
}

/**
 * Build notification/webhook URLs for workflows
 */
export function buildNotificationUrls() {
  const baseUrl = getBaseUrl();
  
  return {
    success: `${baseUrl}/api/webhooks/workflow-success`,
    failure: `${baseUrl}/api/webhooks/workflow-failure`,
    completion: `${baseUrl}/api/webhooks/workflow-completion`,
  };
}