/**
 * Build-time stub for Prisma client
 * Provides minimal interface that satisfies Prisma 6 requirements during Next.js build
 * This prevents adapter initialization errors during static generation
 */

// Minimal adapter interface for build time
const buildAdapter = {
  name: 'build-stub-adapter',
  execute: async () => ({ rows: [], affectedRows: 0 }),
  query: async () => ({ rows: [], affectedRows: 0 }),
  queryRaw: async () => ({ rows: [], affectedRows: 0 }),
  executeRaw: async () => ({ rows: [], affectedRows: 0 }),
  close: async () => undefined,
  startTransaction: async () => ({
    commit: async () => undefined,
    rollback: async () => undefined,
  }),
};

// Build-time stub client that satisfies all Prisma 6 requirements
const createStubClient = () => {
  const handler = {
    get(target: any, prop: string): any {
      // Handle Prisma internal properties
      if (prop === '_engine') {
        return {
          name: 'build-stub-engine',
          config: {},
          datamodel: '',
        };
      }

      if (prop === '_adapter') {
        return buildAdapter;
      }

      // Handle Prisma lifecycle methods
      if (prop === '$connect') {
        return async () => {
          console.log('[Build Stub] $connect called - no-op during build');
        };
      }

      if (prop === '$disconnect') {
        return async () => {
          console.log('[Build Stub] $disconnect called - no-op during build');
        };
      }

      if (prop === '$transaction') {
        return async (queries: any) => {
          console.log('[Build Stub] $transaction called - returning empty array');
          return Array.isArray(queries) ? [] : null;
        };
      }

      if (prop === '$extends') {
        return () => createStubClient();
      }

      // Return a proxy for any model access (e.g., prisma.user, prisma.fandom)
      return new Proxy(
        {},
        {
          get(_, methodName: string) {
            // Handle all Prisma query methods
            return async (...args: any[]) => {
              console.log(`[Build Stub] ${String(prop)}.${String(methodName)} called`);

              // Return appropriate empty responses
              if (methodName === 'findMany') return [];
              if (methodName === 'findFirst' || methodName === 'findUnique') return null;
              if (methodName === 'count') return 0;
              if (methodName === 'create' || methodName === 'update' || methodName === 'delete')
                return null;
              if (
                methodName === 'createMany' ||
                methodName === 'updateMany' ||
                methodName === 'deleteMany'
              ) {
                return { count: 0 };
              }
              if (methodName === 'upsert') return null;
              if (methodName === 'aggregate') return {};
              if (methodName === 'groupBy') return [];

              // Default: return null
              return null;
            };
          },
        },
      );
    },
  };

  return new Proxy({}, handler);
};

// Export all the same functions as the real client, but returning stubs
export const createNodeClient = async () => createStubClient();
export const createDevelopmentClient = async () => createStubClient();
export const createProductionClient = async () => createStubClient();
export const createPostgreSQLClient = async () => createStubClient();
export const createSQLiteClient = async () => createStubClient();
export const createMonitoredClient = async () => createStubClient();

export const validateNodeClientOptions = () => ({
  isValid: true,
  issues: [],
  suggestions: [],
});

export const closeClient = async () => {
  console.log('[Build Stub] closeClient called - no-op during build');
};

// Extension-compatible stub with DRY operation methods
export function createExtensionCompatibleStub(): any {
  const baseStub = createStubClient();

  // Add extension methods that return empty results
  const extensionStub = {
    ...baseStub,

    // Client-level extension methods
    $paginate: async (modelName: string, options: any = {}) => ({
      data: [],
      pagination: { total: 0, page: 1, pageSize: 10, totalPages: 0 },
    }),

    $searchByName: async (modelName: string, searchTerm: string, options: any = {}) => ({
      data: [],
      pagination: { total: 0, page: 1, pageSize: 10, totalPages: 0 },
    }),

    $existsById: async (modelName: string, id: string) => false,

    $existsBySlug: async (modelName: string, slug: string) => false,

    // Story model extensions
    story: {
      ...baseStub.story,
      findWithBasicSelect: async (id: string) => null,
      findWithCompleteSelect: async (id: string) => null,
      findWithSeries: async (id: string) => null,
      findWithAllRelations: async (id: string) => null,
      findManyActiveWithSeries: async (options: any = {}) => [],
      findManyFictional: async (options: any = {}) => [],
      findBySeries: async (seriesId: string, options: any = {}) => [],
      findByFandom: async (fandomId: string, options: any = {}) => [],
    },
  };

  return extensionStub;
}

// Export types to maintain compatibility
export type NodeClientOptions = any;
export type RuntimeEnvironment = any;
export type AdapterConfig = any;
export type ClientOptions = any;
