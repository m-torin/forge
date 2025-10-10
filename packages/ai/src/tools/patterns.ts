import { z } from 'zod/v3';

/**
 * Single tool template generator - true DRY approach
 * Eliminates duplication across database, analytics, auth, and notification patterns
 *
 * All patterns follow the same structure - this generates them consistently
 */

// Common patterns for different domains
const domainPatterns = {
  database: {
    query: {
      description: 'Query data from the database',
      defaultSchema: {
        query: z.string().describe('Search query'),
        limit: z.number().optional().default(10),
        category: z.string().optional(),
      },
      defaultReturn: { data: [], count: 0 },
      packageImport: '@repo/db-prisma',
    },
    mutation: {
      description: 'Create or update data in the database',
      defaultSchema: {
        data: z.record(z.string(), z.any()).describe('Data to save'),
      },
      defaultReturn: { success: true, id: 'placeholder' },
      packageImport: '@repo/db-prisma',
    },
  },

  analytics: {
    track: {
      description: 'Track user events',
      defaultSchema: {
        event: z.string().describe('Event name'),
        properties: z.record(z.string(), z.any()).optional(),
        userId: z.string().optional(),
      },
      defaultReturn: { success: true },
      packageImport: '@repo/analytics',
    },
    query: {
      description: 'Query analytics data',
      defaultSchema: {
        metric: z.string().describe('Metric to query'),
        dateRange: z.object({
          from: z.string(),
          to: z.string(),
        }),
      },
      defaultReturn: { data: [], summary: {} },
      packageImport: '@repo/analytics',
    },
  },

  auth: {
    authenticate: {
      description: 'Authenticate user credentials',
      defaultSchema: {
        email: z.string().email(),
        password: z.string(),
      },
      defaultReturn: { authenticated: false, token: null },
      packageImport: '@repo/auth',
    },
    profile: {
      description: 'Get user profile information',
      defaultSchema: {
        userId: z.string().describe('User ID'),
        includePermissions: z.boolean().optional().default(false),
      },
      defaultReturn: { user: null, permissions: [] },
      packageImport: '@repo/auth',
    },
  },

  notification: {
    send: {
      description: 'Send notification to user',
      defaultSchema: {
        userId: z.string(),
        title: z.string(),
        message: z.string(),
        type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
      },
      defaultReturn: { sent: true, id: 'placeholder' },
      packageImport: '@repo/notifications',
    },
    email: {
      description: 'Send email notification',
      defaultSchema: {
        to: z.string().email(),
        subject: z.string(),
        body: z.string(),
      },
      defaultReturn: { sent: true, messageId: 'placeholder' },
      packageImport: '@repo/notifications',
    },
  },
} as const;

/**
 * Create a tool template for any domain and action
 * Single function that generates all patterns - eliminates duplication
 */
export function createToolTemplate<
  D extends keyof typeof domainPatterns,
  A extends keyof (typeof domainPatterns)[D],
>(
  domain: D,
  action: A,
  options: {
    toolName?: string;
    description?: string;
    schema?: Record<string, z.ZodTypeAny>;
    returnValue?: any;
  } = {},
): string {
  const pattern = domainPatterns[domain][action] as any;

  if (!pattern) {
    throw new Error(`Unknown pattern: ${String(domain)}.${String(action)}`);
  }

  const toolName =
    options.toolName ||
    `${String(domain)}${String(action).charAt(0).toUpperCase() + String(action).slice(1)}Tool`;
  const description = options.description || pattern.description;
  const schema = options.schema || pattern.defaultSchema;
  const returnValue = options.returnValue || pattern.defaultReturn;
  const packageImport = pattern.packageImport;

  // Generate schema object string
  const schemaEntries = Object.entries(schema)
    .map(([key, zodType]) => {
      // Simple stringification of common Zod types
      return `    ${key}: ${zodTypeToString(zodType as z.ZodTypeAny)},`;
    })
    .join('\n');

  // Generate return value string
  const returnString = JSON.stringify(returnValue, null, 4).replace(/"([^"]+)":/g, '$1:');

  return `export const ${toolName} = tool({
  description: '${description}',
  inputSchema: z.object({
${schemaEntries}
  }),
  execute: async (input) => {
    // TODO: Implement with ${packageImport}
    return ${returnString};
  },
});`;
}

/**
 * Helper to convert Zod types to string representation
 */
function zodTypeToString(zodType: z.ZodTypeAny): string {
  // Simple mapping for common Zod types - extend as needed
  if (zodType instanceof z.ZodString) {
    return 'z.string()';
  }
  if (zodType instanceof z.ZodNumber) {
    return 'z.number()';
  }
  if (zodType instanceof z.ZodBoolean) {
    return 'z.boolean()';
  }
  if (zodType instanceof z.ZodOptional) {
    return `${zodTypeToString((zodType as any)._def.innerType)}.optional()`;
  }
  if (zodType instanceof z.ZodDefault) {
    const defaultValue =
      typeof (zodType as any)._def.defaultValue === 'function'
        ? (zodType as any)._def.defaultValue()
        : (zodType as any)._def.defaultValue;
    return `${zodTypeToString((zodType as any)._def.innerType)}.default(${JSON.stringify(defaultValue)})`;
  }
  if (zodType instanceof z.ZodRecord) {
    return 'z.record(z.string(), z.any())';
  }
  if (zodType instanceof z.ZodObject) {
    return 'z.object({ /* nested object */ })';
  }
  if (zodType instanceof z.ZodEnum) {
    const values = Object.values((zodType as any)._def.values)
      .map((v: any) => `'${v}'`)
      .join(', ');
    return `z.enum([${values}])`;
  }

  // Fallback
  return 'z.any()';
}

/**
 * Predefined common tool templates
 * These are the most commonly used patterns across the monorepo
 */
export const commonTemplates = {
  // Database templates
  databaseQuery: () => createToolTemplate('database', 'query' as any),
  databaseMutation: () => createToolTemplate('database', 'mutation' as any),

  // Analytics templates
  trackEvent: () => createToolTemplate('analytics', 'track' as any),
  queryAnalytics: () => createToolTemplate('analytics', 'query' as any),

  // Auth templates
  authenticateUser: () => createToolTemplate('auth', 'authenticate' as any),
  getUserProfile: () => createToolTemplate('auth', 'profile' as any),

  // Notification templates
  sendNotification: () => createToolTemplate('notification', 'send' as any),
  sendEmail: () => createToolTemplate('notification', 'email' as any),
};

/**
 * Get all available domain actions
 */
export function getAvailablePatterns() {
  const patterns: Record<string, string[]> = {};

  for (const [domain, actions] of Object.entries(domainPatterns)) {
    patterns[domain] = Object.keys(actions);
  }

  return patterns;
}
