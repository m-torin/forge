import { tool } from 'ai';
import { schemas } from './schema-fragments';

/**
 * Standard tools for the monorepo - Official AI SDK v5 tool() implementations
 * All tools use official patterns with proper parameter schemas
 */

// Web Search Tool
export const webSearchTool = tool({
  description: 'Search the web for current information',
  inputSchema: schemas.webSearch,
  execute: async ({ query, maxResults, timeRange, region }) => {
    // Mock implementation - replace with actual web search logic
    return {
      query,
      results: [
        {
          title: `Mock result for: ${query}`,
          url: 'https://example.com',
          snippet: `Mock search result content for query: ${query}`,
          timestamp: new Date().toISOString(),
        },
      ],
      totalResults: maxResults,
      timeRange,
      region,
    };
  },
});

// Database Query Tool
export const databaseQueryTool = tool({
  description: 'Query the application database',
  inputSchema: schemas.databaseQuery,
  execute: async ({ table, operation, filters, limit }) => {
    // Mock implementation - replace with actual database logic
    return {
      table,
      operation,
      filters,
      results: [],
      count: 0,
      limit,
      timestamp: new Date().toISOString(),
    };
  },
});

// Send Email Tool
export const sendEmailTool = tool({
  description: 'Send email notifications',
  inputSchema: schemas.email,
  execute: async ({ to, subject, body, template, priority }) => {
    // Mock implementation - replace with actual email service
    const recipients = Array.isArray(to) ? to : [to];
    return {
      messageId: `msg_${Date.now()}`,
      to: recipients,
      subject,
      body,
      template,
      priority,
      status: 'sent',
      timestamp: new Date().toISOString(),
    };
  },
});

// File System Tool
export const fileSystemTool = tool({
  description: 'Perform file system operations',
  inputSchema: schemas.fileOperation,
  execute: async ({ operation, path, content, encoding }) => {
    // Security check
    const safePaths = ['/tmp/', './uploads/', './data/'];
    const isSafePath = safePaths.some(safePath => path.startsWith(safePath));

    if (!isSafePath) {
      throw new Error('Access denied: path not in allowed directories');
    }

    // Mock implementation - replace with actual file operations
    return {
      operation,
      path,
      success: true,
      content: operation === 'read' ? 'Mock file content' : undefined,
      encoding,
      timestamp: new Date().toISOString(),
    };
  },
});

// Track Event Tool
export const trackEventTool = tool({
  description: 'Track analytics events',
  inputSchema: schemas.analyticsEvent,
  execute: async ({ event, userId, properties, timestamp }) => {
    // Mock implementation - replace with actual analytics service
    return {
      eventId: `evt_${Date.now()}`,
      event,
      userId,
      properties,
      timestamp: timestamp || new Date().toISOString(),
      status: 'tracked',
    };
  },
});

// Auth Check Tool
export const authCheckTool = tool({
  description: 'Check user authentication and permissions',
  inputSchema: schemas.authCheck,
  execute: async ({ userId, permission, resource }) => {
    // Mock implementation - replace with actual auth service
    return {
      userId,
      permission,
      resource,
      hasAccess: true,
      userRole: 'user',
      timestamp: new Date().toISOString(),
    };
  },
});

// HTTP Request Tool
export const httpRequestTool = tool({
  description: 'Make HTTP requests to external APIs',
  inputSchema: schemas.httpRequest,
  execute: async ({ url, method, headers, body, timeout }) => {
    // Mock implementation - replace with actual HTTP client
    return {
      url,
      method,
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: 'Mock response',
        url,
        method,
        timestamp: new Date().toISOString(),
      }),
      timeout,
    };
  },
});

/**
 * Collection of all standard tools
 */
export const standardTools = {
  webSearchTool,
  databaseQueryTool,
  sendEmailTool,
  fileSystemTool,
  trackEventTool,
  authCheckTool,
  httpRequestTool,
};

/**
 * Get tools by category
 */
export function getStandardToolsByCategory(category: keyof typeof toolCategories) {
  const toolNames = toolCategories[category];
  const categoryTools: Record<string, any> = {};

  toolNames.forEach(toolName => {
    const toolKey = `${toolName}Tool`;
    if (toolKey in standardTools) {
      categoryTools[toolName] = (standardTools as any)[toolKey];
    }
  });

  return categoryTools;
}

/**
 * Get commonly used tool combinations
 */
export const commonToolSets = {
  basic: {
    webSearch: webSearchTool,
    trackEvent: trackEventTool,
  },
  admin: {
    databaseQuery: databaseQueryTool,
    sendEmail: sendEmailTool,
    authCheck: authCheckTool,
    trackEvent: trackEventTool,
  },
  data: {
    databaseQuery: databaseQueryTool,
    fileSystem: fileSystemTool,
    httpRequest: httpRequestTool,
  },
  communication: {
    sendEmail: sendEmailTool,
    trackEvent: trackEventTool,
    httpRequest: httpRequestTool,
  },
} as const;

/**
 * Tool categories for organization and discovery
 */
export const toolCategories = {
  search: ['webSearch'] as const,
  database: ['databaseQuery'] as const,
  communication: ['sendEmail'] as const,
  system: ['fileSystem'] as const,
  analytics: ['trackEvent'] as const,
  auth: ['authCheck'] as const,
  network: ['httpRequest'] as const,
} as const;
