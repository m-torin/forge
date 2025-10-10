/**
 * Memory Adapter for Better Auth Demo Mode
 *
 * Provides an in-memory database adapter that implements Better Auth's adapter interface
 * while maintaining all demo user data and sessions in memory for demo/development purposes.
 */

import { logInfo, logWarn } from '@repo/observability';
import { createAdapter } from 'better-auth/adapters';

// Demo users template - will be created with proper hashed passwords
const DEMO_USER_TEMPLATES = [
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
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'jane123',
    emailVerified: true,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
    role: 'user',
  },
];

// Storage for properly hashed demo users
let DEMO_USERS: any[] = [];

// In-memory storage
const storage = new Map<string, Map<string, any>>();

// Initialize storage tables
storage.set('user', new Map());

// Initialize other tables
storage.set('session', new Map());
storage.set('account', new Map());
storage.set('verification', new Map());
storage.set('twoFactor', new Map());

/**
 * Generate a unique ID for records
 */
function generateId(): string {
  return `mem_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

/**
 * Match where clause against record
 */
function matchesWhere(record: any, where: any): boolean {
  if (!where) return true;

  for (const [key, value] of Object.entries(where)) {
    if (key === 'OR') {
      // Handle OR conditions
      const orConditions = value as any[];
      return orConditions.some(condition => matchesWhere(record, condition));
    }

    if (key === 'AND') {
      // Handle AND conditions
      const andConditions = value as any[];
      return andConditions.every(condition => matchesWhere(record, condition));
    }

    if (typeof value === 'object' && value !== null) {
      // Handle complex conditions like { gt: 10 }, { contains: 'text' }
      for (const [op, val] of Object.entries(value)) {
        switch (op) {
          case 'gt':
            if (record[key] <= val) return false;
            break;
          case 'gte':
            if (record[key] < val) return false;
            break;
          case 'lt':
            if (record[key] >= val) return false;
            break;
          case 'lte':
            if (record[key] > val) return false;
            break;
          case 'contains':
            if (!record[key]?.includes?.(val)) return false;
            break;
          case 'startsWith':
            if (!record[key]?.startsWith?.(val)) return false;
            break;
          case 'endsWith':
            if (!record[key]?.endsWith?.(val)) return false;
            break;
          case 'in':
            if (!Array.isArray(val) || !val.includes(record[key])) return false;
            break;
          case 'notIn':
            if (Array.isArray(val) && val.includes(record[key])) return false;
            break;
          default:
            if (record[key] !== val) return false;
        }
      }
    } else {
      // Simple equality check
      if (record[key] !== value) return false;
    }
  }

  return true;
}

/**
 * Apply select fields to record
 */
function applySelect(record: any, select?: string[]): any {
  if (!select || select.length === 0) {
    return record;
  }

  const result: any = {};
  for (const field of select) {
    if (record.hasOwnProperty(field)) {
      result[field] = record[field];
    }
  }
  return result;
}

/**
 * Memory adapter configuration
 */
export const memoryAdapter = createAdapter({
  config: {
    adapterId: 'memory-adapter',
    adapterName: 'Memory Adapter (Demo Mode)',
    usePlural: false,
    debugLogs: process.env.NODE_ENV === 'development',
    supportsJSON: true,
    supportsDates: true,
    supportsBooleans: true,
    supportsNumericIds: false, // We use string IDs
  },
  adapter: () => {
    return {
      /**
       * Create a new record
       */
      create: async ({ model, data, select }) => {
        let table = storage.get(model);
        if (!table) {
          storage.set(model, new Map());
          table = storage.get(model);
        }

        const record = {
          ...data,
          id: data.id || generateId(),
          createdAt: data.createdAt || new Date(),
          updatedAt: data.updatedAt || new Date(),
        };

        if (table) {
          table.set(record.id, record);
        }

        logInfo(`[Memory Adapter] Created ${model} with ID: ${record.id}`);

        return applySelect(record, select);
      },

      /**
       * Find a single record
       */
      findOne: async ({ model, where, select }) => {
        // Initialize demo users on first user lookup
        if (model === 'user' && !demoUsersInitialized) {
          await initializeDemoUsers();
        }

        const table = storage.get(model);
        if (!table) return null;

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
        const table = storage.get(model);
        if (!table) return [];

        let records = Array.from(table.values()).filter(record => matchesWhere(record, where));

        // Apply sorting
        if (sortBy) {
          records.sort((a, b) => {
            const { field, direction = 'asc' } = sortBy;
            const aVal = a[field];
            const bVal = b[field];

            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
          });
        }

        // Apply offset and limit
        if (offset > 0) {
          records = records.slice(offset);
        }
        if (limit) {
          records = records.slice(0, limit);
        }

        return records.map(record => applySelect(record, undefined));
      },

      /**
       * Update a single record
       */
      update: async ({ model, where, data, select }: any) => {
        const table = storage.get(model);
        if (!table) return null;

        for (const [id, record] of table.entries()) {
          if (matchesWhere(record, where)) {
            const updatedRecord = {
              ...record,
              ...data,
              updatedAt: new Date(),
            };

            table.set(id, updatedRecord);

            logInfo(`[Memory Adapter] Updated ${model} with ID: ${id}`);

            return applySelect(updatedRecord, select);
          }
        }

        return null;
      },

      /**
       * Update multiple records
       */
      updateMany: async ({ model, where, data }: any) => {
        const table = storage.get(model);
        if (!table) return 0;

        let count = 0;
        for (const [id, record] of table.entries()) {
          if (matchesWhere(record, where)) {
            const updatedRecord = {
              ...record,
              ...data,
              updatedAt: new Date(),
            };

            table.set(id, updatedRecord);
            count++;
          }
        }

        if (count > 0) {
          logInfo(`[Memory Adapter] Updated ${count} ${model} records`);
        }

        return count;
      },

      /**
       * Delete records
       */
      delete: async ({ model, where }) => {
        const table = storage.get(model);
        if (!table) return;

        const toDelete: string[] = [];
        for (const [id, record] of table.entries()) {
          if (matchesWhere(record, where)) {
            toDelete.push(id);
          }
        }

        for (const id of toDelete) {
          table.delete(id);
        }

        if (toDelete.length > 0) {
          logInfo(`[Memory Adapter] Deleted ${toDelete.length} ${model} records`);
        }
      },

      /**
       * Delete many records
       */
      deleteMany: async ({ model, where }) => {
        const table = storage.get(model);
        if (!table) return 0;

        const toDelete: string[] = [];
        for (const [id, record] of table.entries()) {
          if (matchesWhere(record, where)) {
            toDelete.push(id);
          }
        }

        for (const id of toDelete) {
          table.delete(id);
        }

        if (toDelete.length > 0) {
          logInfo(`[Memory Adapter] Deleted ${toDelete.length} ${model} records`);
        }

        return toDelete.length;
      },

      /**
       * Count records
       */
      count: async ({ model, where }) => {
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

      /**
       * Create schema (no-op for memory adapter)
       */
      createSchema: async ({ tables }: { tables: any }) => {
        logInfo('[Memory Adapter] Schema creation requested - using in-memory storage');
        // Initialize any missing tables
        for (const [tableName] of Object.entries(tables)) {
          if (!storage.has(tableName)) {
            storage.set(tableName, new Map());
          }
        }
        return {
          success: true,
          code: 'CREATE_SCHEMA_SUCCESS',
          path: 'memory://schema',
        };
      },
    };
  },
});

/**
 * Initialize demo users with simple but consistent hashes
 * This is called lazily on first user lookup
 */
let demoUsersInitialized = false;

async function initializeDemoUsers() {
  if (demoUsersInitialized) return;

  logInfo('[Memory Adapter] Initializing demo users with placeholder hashes');

  const userTable = storage.get('user');
  if (!userTable) {
    logWarn('[Memory Adapter] User table not initialized');
    return;
  }

  // Create demo users with consistent hashes that match our custom verify function
  for (const template of DEMO_USER_TEMPLATES) {
    const demoUser = {
      ...template,
      // Use the same format as our custom hash function for consistency
      password: `$2b$10$demo.hash.${template.password}`,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    userTable.set(template.id, demoUser);
    DEMO_USERS.push(demoUser);

    logInfo(`[Memory Adapter] Initialized demo user: ${template.email}`);
  }

  demoUsersInitialized = true;
}

/**
 * Get all demo users (for development/testing)
 */
function _getDemoUsers() {
  return DEMO_USERS.map(({ password: _password, ...user }) => user);
}

/**
 * Reset memory storage to initial state
 */
function _resetMemoryStorage() {
  storage.clear();
  storage.set('user', new Map());
  storage.set('session', new Map());
  storage.set('account', new Map());
  storage.set('verification', new Map());
  storage.set('twoFactor', new Map());

  // Clear demo users - they will be recreated on next setup
  DEMO_USERS = [];

  logInfo('[Memory Adapter] Storage reset to initial state');
}
