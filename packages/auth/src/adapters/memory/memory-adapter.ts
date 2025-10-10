/**
 * Memory Adapter for Better Auth
 *
 * Provides an in-memory database adapter that implements Better Auth's adapter interface.
 * Perfect for demos, development, and testing scenarios where a real database isn't needed.
 *
 * @example
 * ```typescript
 * import { createMemoryAdapter } from '@repo/auth/adapters/memory';
 *
 * const adapter = createMemoryAdapter({
 *   demoUsers: [
 *     { name: 'Demo User', email: 'demo@example.com', password: 'demo123' }
 *   ],
 *   debugMode: true
 * });
 * ```
 */

import { createAdapter } from 'better-auth/adapters';
import type {
  DemoUser,
  Logger,
  MemoryAdapterOptions,
  SortConfig,
  StorageRecord,
  WhereCondition,
} from './types';

const formatLogMessage = (message: string, args: any[]): string => {
  if (args.length === 0) return message;
  const suffix = args.map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg))).join(' ');
  return `${message} ${suffix}`;
};

/**
 * Default logger that writes directly to stdout/stderr to avoid console usage.
 */
const defaultLogger: Logger = {
  info: (message: string, ...args: any[]) => {
    process.stdout.write(`${formatLogMessage(message, args)}\n`);
  },
  warn: (message: string, ...args: any[]) => {
    process.stderr.write(`WARN ${formatLogMessage(message, args)}\n`);
  },
  error: (message: string, ...args: any[]) => {
    process.stderr.write(`ERROR ${formatLogMessage(message, args)}\n`);
  },
};

/**
 * Default demo users for quick setup
 */
const DEFAULT_DEMO_USERS: DemoUser[] = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'demo123',
    emailVerified: true,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    role: 'user',
  },
  {
    id: '2',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    emailVerified: true,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    role: 'admin',
  },
];

/**
 * Creates a memory adapter instance for Better Auth
 *
 * @param options - Configuration options for the adapter
 * @returns Configured Better Auth adapter
 */
export function createMemoryAdapter(options: MemoryAdapterOptions = {}) {
  const {
    demoUsers = DEFAULT_DEMO_USERS,
    logger = defaultLogger,
    debugMode = false,
    eagerInit = true,
    adapterName = 'Memory Adapter',
  } = options;

  // In-memory storage
  const storage = new Map<string, Map<string, StorageRecord>>();

  // Initialize storage tables
  storage.set('user', new Map());
  storage.set('session', new Map());
  storage.set('account', new Map());
  storage.set('verification', new Map());
  storage.set('twoFactor', new Map());

  // Track initialization state
  let demoUsersInitialized = false;

  /**
   * Generate a unique ID for records
   */
  function generateId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Log debug messages if debug mode is enabled
   */
  function debug(message: string, ...args: any[]) {
    if (debugMode) {
      logger.info(`[${adapterName}] ${message}`, ...args);
    }
  }

  /**
   * Match where clause against record
   * Handles both simple object format and Better Auth condition array format
   */
  function matchesWhere(record: StorageRecord, where: any): boolean {
    if (!where) return true;

    // Handle Better Auth condition array format
    if (Array.isArray(where)) {
      for (const condition of where) {
        if (condition && typeof condition === 'object' && 'field' in condition) {
          const { field, value, operator = 'eq' } = condition as WhereCondition;

          switch (operator) {
            case 'eq':
              if (record[field] !== value) return false;
              break;
            case 'neq':
              if (record[field] === value) return false;
              break;
            case 'gt':
              if (record[field] <= value) return false;
              break;
            case 'gte':
              if (record[field] < value) return false;
              break;
            case 'lt':
              if (record[field] >= value) return false;
              break;
            case 'lte':
              if (record[field] > value) return false;
              break;
            case 'in':
              if (!Array.isArray(value) || !value.includes(record[field])) return false;
              break;
            case 'notIn':
              if (Array.isArray(value) && value.includes(record[field])) return false;
              break;
            case 'contains':
              if (!String(record[field]).includes(value)) return false;
              break;
            case 'startsWith':
              if (!String(record[field]).startsWith(value)) return false;
              break;
            case 'endsWith':
              if (!String(record[field]).endsWith(value)) return false;
              break;
            default:
              logger.warn(`Unknown operator: ${operator}`);
          }
        }
      }
      return true;
    }

    // Handle simple object format
    for (const [key, value] of Object.entries(where)) {
      if (record[key] !== value) {
        return false;
      }
    }

    return true;
  }

  /**
   * Apply select clause to record
   */
  function applySelect(record: StorageRecord, select?: string[]): any {
    if (!select || select.length === 0) return record;

    const result: any = {};
    for (const field of select) {
      if (field in record) {
        result[field] = record[field];
      }
    }
    return result;
  }

  /**
   * Sort records based on configuration
   */
  function sortRecords(records: any[], sortBy?: SortConfig | SortConfig[]): any[] {
    if (!sortBy) return records;

    const sortConfigs = Array.isArray(sortBy) ? sortBy : [sortBy];

    return [...records].sort((a, b) => {
      for (const config of sortConfigs) {
        const aVal = a[config.field];
        const bVal = b[config.field];

        if (aVal === bVal) continue;

        const comparison = aVal < bVal ? -1 : 1;
        return config.direction === 'asc' ? comparison : -comparison;
      }
      return 0;
    });
  }

  /**
   * Initialize demo users with hashed passwords
   */
  async function initializeDemoUsers(): Promise<void> {
    if (demoUsersInitialized) {
      debug('Demo users already initialized');
      return;
    }

    try {
      const userTable = storage.get('user');
      if (!userTable) {
        throw new Error('User table not initialized');
      }

      // Import Better Auth utilities dynamically to avoid circular dependencies
      const crypto = await import('better-auth/crypto');
      const hash = (crypto as any).hash || (crypto as any).default?.hash;

      for (const template of demoUsers) {
        const hashedPassword = await hash(template.password);

        const user: StorageRecord = {
          id: template.id || generateId(),
          name: template.name,
          email: template.email,
          password: hashedPassword,
          emailVerified: template.emailVerified ?? true,
          image: template.image || null,
          role: template.role || 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
          // Add any additional custom fields from template
          ...Object.fromEntries(
            Object.entries(template).filter(
              ([key]) =>
                !['id', 'name', 'email', 'password', 'emailVerified', 'image', 'role'].includes(
                  key,
                ),
            ),
          ),
        };

        userTable.set(user.id, user);
        debug(`Created demo user: ${user.email} (ID: ${user.id})`);
      }

      demoUsersInitialized = true;
      logger.info(`[${adapterName}] Initialized ${demoUsers.length} demo users`);
    } catch (error) {
      logger.error(`[${adapterName}] Failed to initialize demo users:`, error);
      throw error;
    }
  }

  // Create the Better Auth adapter
  const adapter = createAdapter({
    config: {
      adapterId: 'memory-adapter',
      adapterName,
      usePlural: false,
      debugLogs: debugMode,
      supportsJSON: true,
      supportsDates: true,
      supportsBooleans: true,
      supportsNumericIds: false, // We use string IDs
    },
    adapter: () => {
      // Eagerly initialize demo users when adapter is created
      if (eagerInit && demoUsers.length > 0) {
        logger.info(`[${adapterName}] Starting eager initialization`);

        void (async () => {
          try {
            await initializeDemoUsers();
            logger.info(`[${adapterName}] Eager initialization completed`);
          } catch (error) {
            logger.warn(`[${adapterName}] Eager initialization failed:`, error);
          }
        })();
      }

      return {
        /**
         * Create a new record
         */
        create: async ({ model, data, select }: any) => {
          let table = storage.get(model);
          if (!table) {
            storage.set(model, new Map());
            table = storage.get(model);
          }

          const record: StorageRecord = {
            ...data,
            id: data.id || generateId(),
            createdAt: data.createdAt || new Date(),
            updatedAt: data.updatedAt || new Date(),
          };

          if (table) {
            table.set(record.id, record);
          }

          debug(`Created ${model} with ID: ${record.id}`);

          return applySelect(record, select);
        },

        /**
         * Find a single record
         */
        findOne: async ({ model, where, select }: any) => {
          // Initialize demo users on first user or account lookup
          if (
            (model === 'user' || model === 'account') &&
            !demoUsersInitialized &&
            demoUsers.length > 0
          ) {
            debug(`Initializing demo users for ${model} lookup`);
            try {
              await initializeDemoUsers();
            } catch (error) {
              logger.warn(`[${adapterName}] Demo users initialization failed:`, error);
            }
          }

          const table = storage.get(model);
          if (!table) {
            debug(`Table ${model} not found`);
            return null;
          }

          for (const record of table.values()) {
            if (matchesWhere(record, where)) {
              return applySelect(record, select);
            }
          }

          return null;
        },

        /**
         * Find multiple records
         */
        findMany: async ({ model, where, limit, offset = 0, sortBy }: any) => {
          // Initialize demo users on first user or account lookup
          if (
            (model === 'user' || model === 'account') &&
            !demoUsersInitialized &&
            demoUsers.length > 0
          ) {
            await initializeDemoUsers();
          }

          const table = storage.get(model);
          if (!table) return [];

          let records: any[] = Array.from(table.values()).filter(record =>
            matchesWhere(record, where),
          );

          // Apply sorting
          if (sortBy) {
            records = sortRecords(records, sortBy);
          }

          // Apply pagination
          if (limit) {
            records = records.slice(offset, offset + limit);
          }

          return records;
        },

        /**
         * Update records
         */
        update: async ({ model, where, update }: any) => {
          const data = update;
          const table = storage.get(model);
          if (!table) return null;

          const updates: any[] = [];

          for (const [id, record] of table.entries()) {
            if (matchesWhere(record, where)) {
              const updated = {
                ...record,
                ...data,
                updatedAt: new Date(),
              };
              table.set(id, updated);
              updates.push(updated);
            }
          }

          debug(`Updated ${updates.length} ${model} records`);

          return updates[0] || null;
        },

        /**
         * Delete records
         */
        delete: async ({ model, where }: any) => {
          const table = storage.get(model);
          if (!table) return null;

          let deleted: any = null;

          for (const [id, record] of table.entries()) {
            if (matchesWhere(record, where)) {
              deleted = record;
              table.delete(id);
              break;
            }
          }

          if (deleted) {
            debug(`Deleted ${model} with ID: ${deleted.id}`);
          }

          return deleted;
        },

        /**
         * Delete multiple records
         */
        deleteMany: async ({ model, where }: any) => {
          const table = storage.get(model);
          if (!table) return 0;

          let count = 0;

          for (const [id, record] of table.entries()) {
            if (matchesWhere(record, where)) {
              table.delete(id);
              count++;
            }
          }

          debug(`Deleted ${count} ${model} records`);

          return count;
        },

        /**
         * Update multiple records
         */
        updateMany: async ({ model, where, update }: any) => {
          const data = update;
          const table = storage.get(model);
          if (!table) return 0;

          let count = 0;

          for (const [id, record] of table.entries()) {
            if (matchesWhere(record, where)) {
              const updated = {
                ...record,
                ...data,
                updatedAt: new Date(),
              };
              table.set(id, updated);
              count++;
            }
          }

          debug(`Updated ${count} ${model} records`);

          return count;
        },

        /**
         * Count records matching where clause
         */
        count: async ({ model, where }: any) => {
          const table = storage.get(model);
          if (!table) return 0;

          let count = 0;

          for (const record of table.values()) {
            if (matchesWhere(record, where)) {
              count++;
            }
          }

          return count;
        },
      };
    },
  });

  return adapter;
}
