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
    'image-processing': `${baseUrl}/api/workflows/image-processing`,
    'kitchen-sink': `${baseUrl}/api/workflows/kitchen-sink`,
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
    list: `${baseUrl}/api/schedules`,
    manage: `${baseUrl}/api/schedules`,
  };
}

/**
 * Build a specific schedule URL for a workflow
 */
export function buildScheduleUrl(workflowSlug: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/api/schedules/${workflowSlug}`;
}

/**
 * Build client endpoint URLs
 */
export function buildClientUrls() {
  const baseUrl = getBaseUrl();

  return {
    cancel: `${baseUrl}/api/client/cancel`,
    logs: `${baseUrl}/api/client/logs`,
    notify: `${baseUrl}/api/client/notify`,
    trigger: `${baseUrl}/api/client/trigger`,
    waiters: `${baseUrl}/api/client/waiters`,
  };
}

/**
 * Build notification/webhook URLs for workflows
 */
export function buildNotificationUrls() {
  const baseUrl = getBaseUrl();

  return {
    completion: `${baseUrl}/api/webhooks/workflow-completion`,
    failure: `${baseUrl}/api/webhooks/workflow-failure`,
    success: `${baseUrl}/api/webhooks/workflow-success`,
  };
}
